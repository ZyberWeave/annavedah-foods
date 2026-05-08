import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/schema'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { verifySession } from '@/lib/auth'
import { PAID_ORDER_STATUSES } from '@/lib/order-status'

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Strict userId-only filter — the email-based fallback was unsafe because
    // users can change their account email at any time. Guest orders should
    // be stamped with userId at registration time (claimGuestOrders).
    //
    // Filter out 'pending' / 'cancelled' rows: pending rows are abandoned
    // Razorpay create-order leftovers (user opened checkout but never
    // completed payment) and should not appear in the customer dashboard.
    const userOrders = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.userId, session.userId),
        inArray(orders.status, [...PAID_ORDER_STATUSES]),
      ))
      .orderBy(desc(orders.createdAt))

    return NextResponse.json({ orders: userOrders }, { status: 200 })
  } catch (err: unknown) {
    console.error('[orders/get]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST intentionally removed. Order rows are written exclusively by:
//   - /api/razorpay/create-order (status: pending)
//   - /api/razorpay/verify       (flips to success after signature check)
//   - /api/shiprocket/create-order (COD path, status: success after ownership check)
// Allowing client-driven inserts here was a fabrication vector even with
// status forced to 'pending', because it let any user mint pending rows and
// take over the orderId namespace.
