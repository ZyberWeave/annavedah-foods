import { NextResponse } from 'next/server'
import { and, eq, inArray } from 'drizzle-orm'

import { verifySession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CANCELLATION_REASON_PREFIX } from '@/lib/order-cancellation'
import { userOwnsOrder } from '@/lib/order-records'
import { rateLimitOr429 } from '@/lib/rate-limit'
import { orders, refundRequests } from '@/lib/schema'

export async function POST(req: Request) {
  const session = await verifySession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const block = await rateLimitOr429(`cancel-order:user:${session.userId}`, 5, 600)
  if (block) return block

  try {
    const body = await req.json()
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
    if (!orderId || orderId.length > 100) {
      return NextResponse.json({ error: 'A valid order ID is required' }, { status: 400 })
    }

    const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (!userOwnsOrder(order, { userId: session.userId }, null)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Once fulfillment starts, cancellation becomes a return/refund request.
    if (order.status !== 'success') {
      return NextResponse.json(
        { error: 'This order can no longer be cancelled. Please use the refund request option.' },
        { status: 400 },
      )
    }

    const existingRequest = await db
      .select({ id: refundRequests.id })
      .from(refundRequests)
      .where(and(
        eq(refundRequests.userId, session.userId),
        eq(refundRequests.orderId, orderId),
        inArray(refundRequests.status, ['pending', 'approved']),
      ))
      .limit(1)
    if (existingRequest.length > 0) {
      return NextResponse.json(
        { error: 'A cancellation or refund request is already in progress for this order.' },
        { status: 409 },
      )
    }

    try {
      await db.insert(refundRequests).values({
        userId: session.userId,
        orderId,
        reason: `${CANCELLATION_REASON_PREFIX} Customer requested cancellation before fulfillment.`,
        imageUrl: null,
      })
    } catch (error: unknown) {
      const dbError = error as { code?: string; message?: string }
      if (dbError.code === '23505' || dbError.message?.includes('refund_requests_open_per_order_idx')) {
        return NextResponse.json(
          { error: 'A cancellation or refund request is already in progress for this order.' },
          { status: 409 },
        )
      }
      throw error
    }

    return NextResponse.json({ success: true, cancellationRequested: true })
  } catch (error) {
    console.error('[orders/cancel]', error)
    return NextResponse.json({ error: 'Could not submit the cancellation request' }, { status: 500 })
  }
}
