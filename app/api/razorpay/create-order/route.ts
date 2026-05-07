import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'
import { priceCart } from '@/lib/pricing'
import { verifySession } from '@/lib/auth'
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit'

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
      pricing = await priceCart(cart, { couponCode, paymentMethod: 'Prepaid' })
    } catch (validationErr) {
      const msg = validationErr instanceof Error ? validationErr.message : 'Invalid cart'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (pricing.total < 1) {
      return NextResponse.json({ error: 'Order total must be at least ₹1' }, { status: 400 })
    }

    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount: pricing.total * 100, // paise
      currency: 'INR',
      receipt: receipt ?? `receipt_${Date.now()}`,
      notes: notes ?? {},
    })

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
