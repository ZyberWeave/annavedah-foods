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

const CART_MAX_ITEMS = 50
const CART_MAX_BYTES = 16 * 1024 // 16 KB serialized — plenty for any real cart

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await req.json()

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items must be an array' }, { status: 400 })
    }
    if (items.length > CART_MAX_ITEMS) {
      return NextResponse.json({ error: 'Cart has too many items' }, { status: 400 })
    }
    // Loose shape check — we don't know the full client item shape, but each
    // entry should at least be an object. Reject obvious junk.
    for (const it of items) {
      if (!it || typeof it !== 'object') {
        return NextResponse.json({ error: 'Cart contains invalid entries' }, { status: 400 })
      }
    }
    const serialized = JSON.stringify(items)
    if (serialized.length > CART_MAX_BYTES) {
      return NextResponse.json({ error: 'Cart payload too large' }, { status: 400 })
    }

    await db
      .update(users)
      .set({ cartData: serialized })
      .where(eq(users.id, session.userId))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[cart/post]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
