import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { orders, abandonedCarts, users } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, items, total, orderId } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ verified: false, error: 'Signature mismatch' }, { status: 400 })
    }

    // Payment Verified! 
    if (customer && items && total) {
      try {
        // Find user by email to link order
        const userRecords = await db.select().from(users).where(eq(users.email, customer.email)).limit(1)
        const userId = userRecords.length > 0 ? userRecords[0].id : null

        // Save Order
        await db.insert(orders).values({
          orderId,
          paymentId: razorpay_payment_id,
          userId,
          customerEmail: customer.email,
          total: parseInt(total),
          items: JSON.stringify(items),
          status: 'success'
        })

        // Mark abandoned cart as recovered
        await db.update(abandonedCarts)
          .set({ status: 'recovered' })
          .where(and(eq(abandonedCarts.email, customer.email), eq(abandonedCarts.status, 'pending')))
      } catch (dbErr) {
        console.error('Failed to save order or update abandoned cart:', dbErr)
      }

      // Send Confirmation Emails
      try {
        // 1. Email to Customer
        const orderItemsHtml = items.map((i: any) =>
          '<li style="padding: 12px 0; border-bottom: 1px dashed #e8ddd0; display: flex; justify-content: space-between; color: #6b5347;">' +
          '<span>' + i.qty + 'x ' + i.name + '</span>' +
          '<strong style="color: #2d1b15;">Rs ' + (i.price * i.qty) + '</strong>' +
          '</li>'
        ).join('');

        const itemCount = items.reduce((s: number, i: any) => s + i.qty, 0);
        const placedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
        const etaFrom = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const etaTo = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
        const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const etaRange = fmtDate(etaFrom) + ' – ' + fmtDate(etaTo);

        await resend.emails.send({
          from: 'Annavedah Foods <support@annavedahfoods.com>',
          to: customer.email,
          subject: 'Order Confirmed ✓ — ' + orderId + ' (Rs ' + total + ')',
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Thank You for Your Order!</h1>' +
            '<p style="color: #6b5347; font-size: 13px; margin: 8px 0 0;">Order ' + orderId + ' &middot; placed ' + placedAt + '</p>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + customer.firstName + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">Payment of <strong>Rs ' + total + '</strong> received successfully — your order is confirmed and headed into our kitchen for hand-packing. Below are all the details for your records.</p>' +

            '<div style="background-color: #f0fdf4; padding: 18px 20px; border-radius: 12px; border: 1px solid #bbf7d0; margin: 24px 0;">' +
              '<p style="margin: 0 0 4px; color: #166534; font-size: 14px; font-weight: bold;">Estimated delivery</p>' +
              '<p style="margin: 0; color: #166534; font-size: 18px; font-weight: 600;">' + etaRange + '</p>' +
              '<p style="margin: 8px 0 0; color: #166534; font-size: 13px;">You\'ll get a separate tracking email as soon as your parcel ships (usually within 24 hours).</p>' +
            '</div>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Payment Details</h3>' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<tr><td style="padding: 6px 0; color: #6b5347; width: 160px;">Payment Method</td><td style="padding: 6px 0; color: #2d1b15;">Razorpay (Prepaid)</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Payment ID</td><td style="padding: 6px 0; color: #2d1b15; font-family: monospace;">' + razorpay_payment_id + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Order ID</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">' + orderId + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Items</td><td style="padding: 6px 0; color: #2d1b15;">' + itemCount + ' item' + (itemCount === 1 ? '' : 's') + '</td></tr>' +
            '</table>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Order Summary</h3>' +
            '<ul style="list-style: none; padding: 0; margin: 0;">' + orderItemsHtml +
            '<li style="padding: 12px 0; display: flex; justify-content: space-between; color: #6b5347; border-bottom: 1px dashed #e8ddd0;">' +
              '<span>Shipping</span><strong style="color: #166534;">FREE</strong>' +
            '</li>' +
            '<li style="padding: 16px 0 0; display: flex; justify-content: space-between; font-size: 18px;">' +
            '<span style="color: #6b5347;">Total Paid</span>' +
            '<strong style="color: #8b1a1a;">Rs ' + total + '</strong>' +
            '</li></ul>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 32px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Shipping To</h3>' +
            '<p style="color: #6b5347; font-size: 14px; line-height: 1.7; margin: 0; background:#faf6f0; padding:14px 16px; border-radius:8px; border-left: 4px solid #c9a45c;">' +
            '<strong style="color:#2d1b15;">' + customer.firstName + ' ' + customer.lastName + '</strong><br/>' +
            customer.address + '<br/>' +
            (customer.landmark ? customer.landmark + '<br/>' : '') +
            customer.city + ', ' + customer.state + ' ' + customer.pincode + '<br/>' +
            'Phone: ' + customer.phone + '<br/>' +
            'Email: ' + customer.email +
            '</p>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 32px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Need Help?</h3>' +
            '<ul style="color: #6b5347; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">' +
              '<li>Track your order anytime in <a href="https://annavedahfoods.com/dashboard" style="color:#8b1a1a;">your dashboard</a>.</li>' +
              '<li>Need to change the address or cancel? Reply to this email within 12 hours.</li>' +
              '<li>Issue with your delivery? Submit a refund request from your dashboard with photos.</li>' +
              '<li>Email us at <a href="mailto:support@annavedahfoods.com" style="color:#8b1a1a;">support@annavedahfoods.com</a> — we usually reply the same day.</li>' +
            '</ul>' +

            '<p style="color: #6b5347; font-size: 14px; line-height: 1.6; margin-top: 28px;">With gratitude,<br/><strong style="color: #2d1b15;">Team Annavedah</strong></p>' +
            '</div>' +
            '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
            '<p style="color: #e8ddd0; font-size: 12px; margin: 0 0 4px;">Annavedah Foods &middot; support@annavedahfoods.com</p>' +
            '<p style="color: #a39189; font-size: 11px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
            '</div></div>',
        });

        // 2. Email to Admin
        const adminAddressBlock =
          customer.firstName + ' ' + customer.lastName + '<br/>' +
          customer.address + '<br/>' +
          (customer.landmark ? customer.landmark + '<br/>' : '') +
          customer.city + ', ' + customer.state + ' - ' + customer.pincode + '<br/>' +
          (customer.country ? customer.country + '<br/>' : '') +
          'Phone: ' + customer.phone + '<br/>' +
          'Email: ' + customer.email

        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: ['zyberweave@gmail.com', 'annavedahfoods@gmail.com'],
          subject: '🚨 NEW ORDER RECEIVED - ' + orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 2px solid #8b1a1a; border-radius: 12px; overflow: hidden;">' +
            '<div style="background-color: #8b1a1a; padding: 24px; text-align: center;">' +
            '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Order Alert 🚨</h1>' +
            '</div>' +
            '<div style="padding: 28px 32px;">' +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 0;">Order Details</h3>' +
            '<table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">' +
            '<tr><td style="padding: 6px 0; color: #6b5347; width: 140px;">Order ID:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + orderId + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Payment ID:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + razorpay_payment_id + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Razorpay Order:</td><td style="padding: 6px 0; color: #2d1b15;">' + razorpay_order_id + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Total:</td><td style="padding: 6px 0; font-weight: bold; color: #8b1a1a; font-size: 18px;">Rs ' + total + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Placed at:</td><td style="padding: 6px 0; color: #2d1b15;">' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST</td></tr>' +
            '</table>' +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Customer</h3>' +
            '<table style="width: 100%; border-collapse: collapse;">' +
            '<tr><td style="padding: 6px 0; color: #6b5347; width: 140px;">Name:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + customer.firstName + ' ' + customer.lastName + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Email:</td><td style="padding: 6px 0; color: #2d1b15;"><a href="mailto:' + customer.email + '" style="color: #8b1a1a;">' + customer.email + '</a></td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Phone:</td><td style="padding: 6px 0; color: #2d1b15;"><a href="tel:' + customer.phone + '" style="color: #8b1a1a;">' + customer.phone + '</a></td></tr>' +
            '</table>' +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Shipping Address</h3>' +
            '<p style="color: #2d1b15; font-size: 14px; line-height: 1.7; margin: 0; background: #faf6f0; padding: 14px 16px; border-radius: 8px; border-left: 4px solid #c9a45c;">' +
            adminAddressBlock +
            '</p>' +
            (customer.notes ? '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Order Notes</h3><p style="color: #2d1b15; font-size: 14px; line-height: 1.6; margin: 0;">' + customer.notes + '</p>' : '') +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Items Ordered (' + items.reduce((s: number, i: any) => s + i.qty, 0) + ' units across ' + items.length + ' SKUs)</h3>' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<thead><tr><th align="left" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347; font-weight:600;">Item</th><th align="center" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347; font-weight:600;">Qty</th><th align="right" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347; font-weight:600;">Unit</th><th align="right" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347; font-weight:600;">Line Total</th></tr></thead>' +
              '<tbody>' + items.map((i: any) =>
                '<tr>' +
                  '<td style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15;">' + i.name + '</td>' +
                  '<td align="center" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15;">' + i.qty + '</td>' +
                  '<td align="right" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#6b5347;">Rs ' + i.price + '</td>' +
                  '<td align="right" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15; font-weight:600;">Rs ' + (i.price * i.qty) + '</td>' +
                '</tr>'
              ).join('') + '</tbody>' +
            '</table>' +
            '<div style="text-align: center; margin-top: 32px;">' +
            '<a href="https://annavedahfoods.com/n7xk2mq9pf" style="display: inline-block; background-color: #2d1b15; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Dashboard</a>' +
            '</div></div></div>',
        });
      } catch (emailErr) {
        console.error('Failed to send purchase emails:', emailErr);
      }
    }

    return NextResponse.json({ verified: true, payment_id: razorpay_payment_id })
  } catch (err: unknown) {
    console.error('[razorpay/verify]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
