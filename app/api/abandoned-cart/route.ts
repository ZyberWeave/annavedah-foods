import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { abandonedCarts } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { email, phone, name, items } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const cartItemsString = JSON.stringify(items)

    // Check if an active abandoned cart exists for this email
    const existing = await db
      .select()
      .from(abandonedCarts)
      .where(
        and(
          eq(abandonedCarts.email, email),
          eq(abandonedCarts.status, 'pending')
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Update existing
      await db
        .update(abandonedCarts)
        .set({
          name: name || existing[0].name,
          phone: phone || existing[0].phone,
          cartItems: cartItemsString,
          updatedAt: new Date()
        })
        .where(eq(abandonedCarts.id, existing[0].id))
    } else {
      // Create new
      await db.insert(abandonedCarts).values({
        email,
        name,
        phone,
        cartItems: cartItemsString,
        status: 'pending'
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: unknown) {
    console.error('[abandoned-cart]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
