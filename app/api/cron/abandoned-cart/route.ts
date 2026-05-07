import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { abandonedCarts } from '@/lib/schema'
import { eq, and, isNull, lt } from 'drizzle-orm'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Simple auth for cron: in production, verify a secret token or Vercel's Cron header
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // 3 days ago
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    // Fetch pending carts updated more than 3 days ago and not yet reminded
    const cartsToRemind = await db
      .select()
      .from(abandonedCarts)
      .where(
        and(
          eq(abandonedCarts.status, 'pending'),
          lt(abandonedCarts.updatedAt, threeDaysAgo),
          isNull(abandonedCarts.remindedAt)
        )
      )

    for (const cart of cartsToRemind) {
      const items = JSON.parse(cart.cartItems)
      const name = cart.name ? cart.name.split(' ')[0] : 'there'

      const getPrice = (i: any) => i.price ?? i.product?.price ?? 0
      const getName = (i: any) => i.name || i.product?.name || 'Item'
      const subtotal = items.reduce((s: number, i: any) => s + getPrice(i) * i.qty, 0)
      const itemCount = items.reduce((s: number, i: any) => s + i.qty, 0)

      const itemsHtml = items.map((i: any) =>
        `<li style="padding: 12px 0; border-bottom: 1px dashed #e8ddd0; display:flex; justify-content:space-between; color: #6b5347;">
          <span><strong style="color:#2d1b15;">${i.qty} ×</strong> ${getName(i)}</span>
          <strong style="color:#2d1b15;">Rs ${getPrice(i) * i.qty}</strong>
        </li>`
      ).join('')

      const lastUpdated = cart.updatedAt
        ? new Date(cart.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
        : ''

      await resend.emails.send({
        from: 'Annavedah Foods <support@annavedahfoods.com>',
        to: cart.email,
        subject: `${name}, your cart is still here — ${itemCount} item${itemCount === 1 ? '' : 's'} waiting 🛒`,
        html: `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">
            <img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />
            <h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">We saved your cart!</h1>
            ${lastUpdated ? `<p style="color:#6b5347; font-size:13px; margin:8px 0 0;">Last updated on ${lastUpdated}</p>` : ''}
          </div>
          <div style="padding: 40px 32px;">
            <p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>${name}</strong>,</p>
            <p style="color: #6b5347; font-size: 16px; line-height: 1.6;">A few hand-picked items have been waiting in your cart at Annavedah Foods. Stocks move fast on small-batch traditional foods — we wanted to make sure you don't miss out.</p>

            <h3 style="color: #2d1b15; font-size: 17px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Your Items (${itemCount})</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">${itemsHtml}</ul>
            <div style="display:flex; justify-content:space-between; padding:16px 0 0; font-size:18px; border-top:2px solid #e8ddd0; margin-top:8px;">
              <span style="color:#6b5347;">Subtotal</span>
              <strong style="color:#8b1a1a;">Rs ${subtotal}</strong>
            </div>

            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:14px 18px; margin:24px 0; color:#166534; font-size:13px; line-height:1.6;">
              ✓ Free shipping across India &nbsp; ✓ 100% small-batch &nbsp; ✓ No preservatives
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <a href="https://annavedahfoods.com/cart" style="display: inline-block; background-color: #8b1a1a; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">Complete My Order →</a>
              <p style="margin:14px 0 0; color:#a39189; font-size:12px;">Your cart will be cleared automatically after a while.</p>
            </div>

            <h3 style="color:#2d1b15; font-size:15px; margin:32px 0 8px; border-bottom:1px solid #e8ddd0; padding-bottom:6px;">Questions before you check out?</h3>
            <p style="color:#6b5347; font-size:13px; line-height:1.7; margin:0;">
              Reply to this email — a real human reads it.<br/>
              ✉️ <a href="mailto:support@annavedahfoods.com" style="color:#8b1a1a;">support@annavedahfoods.com</a><br/>
              🛍️ Or browse <a href="https://annavedahfoods.com/products" style="color:#8b1a1a;">all our products</a>.
            </p>
          </div>
          <div style="background-color: #2d1b15; padding: 24px; text-align: center;">
            <p style="color:#e8ddd0; font-size:12px; margin:0 0 4px;">Annavedah Foods &middot; support@annavedahfoods.com</p>
            <p style="color: #a39189; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Annavedah Foods. All rights reserved.</p>
          </div>
        </div>`
      })

      // Mark as reminded
      await db
        .update(abandonedCarts)
        .set({ remindedAt: new Date() })
        .where(eq(abandonedCarts.id, cart.id))
    }

    return NextResponse.json({ success: true, processed: cartsToRemind.length })
  } catch (err: unknown) {
    console.error('[cron/abandoned-cart]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
