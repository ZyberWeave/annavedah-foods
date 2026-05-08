import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'
import { priceCart } from '@/lib/pricing'
import { verifySession } from '@/lib/auth'
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit'
import { persistOrderRecord } from '@/lib/order-records'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(req)
    const block = await rateLimitOr429(`rzp-create:user:${session.userId}:${ip}`, 10, 60)
    if (block) return block

    const { cart, couponCode, receipt, notes } = await req.json()

    let pricing
    try {
      pricing = await priceCart(cart, { couponCode, paymentMethod: 'Prepaid', userId: session.userId })
    } catch (validationErr) {
      const msg = validationErr instanceof Error ? validationErr.message : 'Invalid cart'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (pricing.total < 1) {
      return NextResponse.json({ error: 'Order total must be at least ₹1' }, { status: 400 })
    }

    const [sessionUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)
    if (!sessionUser) {
      return NextResponse.json({ error: 'Session user not found' }, { status: 401 })
    }

    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount: pricing.total * 100, // paise
      currency: 'INR',
      receipt: receipt ?? `receipt_${Date.now()}`,
      notes: notes ?? {},
    })

    // Lock the priced cart to the Razorpay order id IMMEDIATELY. /api/razorpay/verify
    // will look up this row and only flip status to 'success' — it never reprices.
    // This prevents the "pay-cheap, verify-expensive" attack where a client could
    // submit a different cart at verify time.
    try {
      await persistOrderRecord({
        orderId: order.id,
        paymentId: null,
        customerEmail: sessionUser.email,
        total: pricing.total,
        items: pricing.items,
        status: 'pending',
        userId: session.userId,
      })
    } catch (dbErr) {
      console.error('[razorpay/create-order] failed to persist pending order', dbErr)
      return NextResponse.json({ error: 'Could not initialize order' }, { status: 500 })
    }

    return NextResponse.json({
      ...order,
      pricing,
    }, { status: 201 })
  } catch (err: unknown) {
    console.error('[razorpay/create-order]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
