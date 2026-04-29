import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const { amount, receipt, notes } = await req.json()

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount: Math.round(amount), // already in paise from client
      currency: 'INR',
      receipt: receipt ?? `receipt_${Date.now()}`,
      notes: notes ?? {},
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err: unknown) {
    console.error('[razorpay/create-order]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
