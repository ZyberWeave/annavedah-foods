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
      
      const itemsHtml = items.map((i: any) => 
        `<li style="padding: 12px 0; border-bottom: 1px dashed #e8ddd0; color: #6b5347;">
          <strong>${i.qty}x ${i.name || i.product.name}</strong>
        </li>`
      ).join('')

      await resend.emails.send({
        from: 'Annavedah Foods <support@annavedahfoods.com>',
        to: cart.email,
        subject: 'Did you forget something? 🛒',
        html: `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">
            <img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />
            <h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">We saved your cart!</h1>
          </div>
          <div style="padding: 40px 32px;">
            <p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>${name}</strong>,</p>
            <p style="color: #6b5347; font-size: 16px; line-height: 1.6;">We noticed you left some items in your cart. They are still waiting for you!</p>
            
            <h3 style="color: #2d1b15; font-size: 18px; margin: 32px 0 16px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Your Items</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">${itemsHtml}</ul>
            
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://annavedahfoods.com/cart" style="display: inline-block; background-color: #8b1a1a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Your Order</a>
            </div>
          </div>
          <div style="background-color: #2d1b15; padding: 24px; text-align: center;">
            <p style="color: #e8ddd0; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Annavedah Foods. All rights reserved.</p>
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
