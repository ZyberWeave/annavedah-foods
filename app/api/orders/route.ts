import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, refundRequests } from '@/lib/schema'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { verifySession } from '@/lib/auth'
import { PAID_ORDER_STATUSES } from '@/lib/order-status'
import { isCancellationReason } from '@/lib/order-cancellation'

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
    // Pending rows are abandoned Razorpay create-order leftovers. Cancelled
    // orders remain visible so customers retain a complete order history.
    const userOrders = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.userId, session.userId),
        inArray(orders.status, [...PAID_ORDER_STATUSES, 'cancelled']),
      ))
      .orderBy(desc(orders.createdAt))

    const customerRefundRequests = await db
      .select({ orderId: refundRequests.orderId, status: refundRequests.status, reason: refundRequests.reason, createdAt: refundRequests.createdAt })
      .from(refundRequests)
      .where(eq(refundRequests.userId, session.userId))
      .orderBy(desc(refundRequests.createdAt))
    const latestRequestByOrderId = new Map<string, { status: string; reason: string }>()
    for (const request of customerRefundRequests) {
      if (!latestRequestByOrderId.has(request.orderId)) {
        latestRequestByOrderId.set(request.orderId, { status: request.status, reason: request.reason })
      }
    }

    return NextResponse.json({
      orders: userOrders.map((order) => ({
        ...order,
        refundRequestStatus: latestRequestByOrderId.get(order.orderId)?.status ?? null,
        isCancellationRequest: latestRequestByOrderId.has(order.orderId)
          ? isCancellationReason(latestRequestByOrderId.get(order.orderId)!.reason)
          : false,
      })),
    }, { status: 200 })
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
