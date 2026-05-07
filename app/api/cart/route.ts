import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifySession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json({ cart: null }, { status: 200 })
    }

    const userRecords = await db
      .select({ cartData: users.cartData })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)

    if (userRecords.length === 0 || !userRecords[0].cartData) {
      return NextResponse.json({ cart: null }, { status: 200 })
    }

    let parsedCart: unknown = null
    try {
      parsedCart = JSON.parse(userRecords[0].cartData)
    } catch (parseErr) {
      console.error('[cart/get] corrupted cartData', parseErr)
      return NextResponse.json({ cart: null, warning: 'Corrupted cart data; reset.' }, { status: 200 })
    }
    return NextResponse.json({ cart: parsedCart }, { status: 200 })
  } catch (err) {
    console.error('[cart/get]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await req.json()

    await db
      .update(users)
      .set({ cartData: JSON.stringify(items) })
      .where(eq(users.id, session.userId))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[cart/post]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
