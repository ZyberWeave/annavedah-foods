import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { abandonedCarts, users } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit'
import { verifySession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Auth required: this endpoint triggers a delayed branded email to the
    // submitted address via the abandoned-cart cron, so it cannot be public.
    // The email is taken from the verified session, NOT from the request body
    // — that closes the spam-via-arbitrary-recipient vector.
    const session = await verifySession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(req)
    const block = await rateLimitOr429(`abandoned:user:${session.userId}:${ip}`, 5, 600)
    if (block) return block

    const { phone, name, items } = await req.json()

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

    // Pull the authoritative email from the session-bound user record.
    const [sessionUser] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)
    if (!sessionUser) {
      return NextResponse.json({ error: 'Session user not found' }, { status: 401 })
    }
    const email = sessionUser.email.toLowerCase()
    const safeName = (name && typeof name === 'string') ? name.trim() : sessionUser.name

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
      await db
        .update(abandonedCarts)
        .set({
          name: safeName || existing[0].name,
          phone: phone || existing[0].phone,
          cartItems: cartItemsString,
          updatedAt: new Date(),
        })
        .where(eq(abandonedCarts.id, existing[0].id))
    } else {
      await db.insert(abandonedCarts).values({
        email,
        name: safeName,
        phone,
        cartItems: cartItemsString,
        status: 'pending',
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: unknown) {
    console.error('[abandoned-cart]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
