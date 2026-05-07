import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, users } from '@/lib/schema'
import { and, desc, eq, isNull, or } from 'drizzle-orm'
import { verifySession } from '@/lib/auth'
import { persistOrderRecord } from '@/lib/order-records'

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecords = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)

    const currentEmail = userRecords[0]?.email ?? null

    const whereClause = currentEmail
      ? or(
          eq(orders.userId, session.userId),
          and(isNull(orders.userId), eq(orders.customerEmail, currentEmail)),
        )
      : eq(orders.userId, session.userId)

    const userOrders = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))

    return NextResponse.json({ orders: userOrders }, { status: 200 })
  } catch (err: unknown) {
    console.error('[orders/get]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, paymentId, customerEmail, total, items, status } = await req.json()

    if (!orderId || !customerEmail || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'orderId, customerEmail, and items are required' }, { status: 400 })
    }

    const order = await persistOrderRecord({
      orderId,
      paymentId: paymentId ?? null,
      customerEmail,
      total: Number(total),
      items,
      status: status || 'success',
      userId: session.userId,
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (err: unknown) {
    console.error('[orders/post]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
