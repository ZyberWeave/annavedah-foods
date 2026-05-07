import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { abandonedCarts } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const block = await rateLimitOr429(`abandoned:ip:${ip}`, 10, 600)
    if (block) return block

    const { email, phone, name, items } = await req.json()

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: 'Cart is empty or too large' }, { status: 400 })
    }

    if (name && (typeof name !== 'string' || name.length > 100)) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 })
    }
    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return NextResponse.json({ error: 'Phone too long' }, { status: 400 })
    }

    const cartItemsString = JSON.stringify(items)
    if (cartItemsString.length > 50000) {
      return NextResponse.json({ error: 'Cart payload too large' }, { status: 400 })
    }

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
