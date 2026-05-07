import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { orders } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { findOrderByOrderId, persistOrderRecord } from '@/lib/order-records'
import { escapeHtml, getAdminEmails } from '@/lib/email-utils'
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit'
import { priceCart } from '@/lib/pricing'
import { verifySession } from '@/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(req)
    const block = await rateLimitOr429(`rzp-verify:ip:${ip}`, 30, 60)
    if (block) return block

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, cart, couponCode } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

    const sigBuf = Buffer.from(expectedSignature, 'hex')
    const givenBuf = Buffer.from(String(razorpay_signature), 'hex')
    const sigOk = sigBuf.length === givenBuf.length && crypto.timingSafeEqual(sigBuf, givenBuf)
    if (!sigOk) {
      return NextResponse.json({ verified: false, error: 'Signature mismatch' }, { status: 400 })
    }

    // Bind the local order to the *signed* razorpay_order_id. Never accept a
    // separate client-supplied orderId — that would let an attacker re-use one
    // valid signature to mint multiple local "success" rows.
    const orderId = String(razorpay_order_id)

    // Idempotency: same razorpay_order_id + same payment_id already saved → short-circuit.
    const existing = await findOrderByOrderId(orderId)
    if (existing && existing.paymentId === razorpay_payment_id && existing.status === 'success') {
      return NextResponse.json({ verified: true, payment_id: razorpay_payment_id, duplicate: true })
    }
    // If the row exists but with a *different* payment_id, refuse — something is wrong.
    if (existing && existing.paymentId && existing.paymentId !== razorpay_payment_id) {
      console.error('[razorpay/verify] order/payment mismatch', { orderId, existingPaymentId: existing.paymentId, incoming: razorpay_payment_id })
      return NextResponse.json({ error: 'Order/payment mismatch' }, { status: 409 })
    }
    // Refuse if this payment_id was already bound to *another* local order.
    const bound = await db
      .select({ orderId: orders.orderId })
      .from(orders)
      .where(eq(orders.paymentId, razorpay_payment_id))
      .limit(1)
    if (bound[0] && bound[0].orderId !== orderId) {
      console.error('[razorpay/verify] payment replay attempt', { incomingOrderId: orderId, alreadyBoundTo: bound[0].orderId })
      return NextResponse.json({ error: 'Payment already used for a different order' }, { status: 409 })
    }

    if (customer && cart) {
      // Server-authoritative repricing — client cannot influence amounts.
      let pricing
      try {
        pricing = await priceCart(cart, { couponCode, paymentMethod: 'Prepaid' })
      } catch (validationErr) {
        const msg = validationErr instanceof Error ? validationErr.message : 'Invalid cart'
        return NextResponse.json({ error: msg }, { status: 400 })
      }
      const numericTotal = pricing.total
      const validatedItems = pricing.items

      try {
        await persistOrderRecord({
          orderId,
          paymentId: razorpay_payment_id,
          customerEmail: customer.email,
          total: numericTotal,
          items: validatedItems,
          status: 'success',
          userId: session.userId,
        })
      } catch (dbErr) {
        // Critical: payment was captured by Razorpay but we couldn't persist
        // the order locally. Surface this so the client can show a "contact
        // support with this payment id" path instead of silently advancing.
        console.error('[razorpay/verify] persist failure', dbErr)
        // verified is intentionally false here — the order is not in a
        // success state from the app's perspective until it's persisted.
        return NextResponse.json(
          {
            verified: false,
            persisted: false,
            payment_id: razorpay_payment_id,
            error: 'Payment received but order could not be saved. Please contact support with this payment id.',
          },
          { status: 500 },
        )
      }

      // Pre-escape all user-controlled strings used inside HTML.
      const eFirst = escapeHtml(customer.firstName)
      const eLast = escapeHtml(customer.lastName)
      const eAddress = escapeHtml(customer.address)
      const eLandmark = customer.landmark ? escapeHtml(customer.landmark) : ''
      const eCity = escapeHtml(customer.city)
      const eState = escapeHtml(customer.state)
      const ePincode = escapeHtml(customer.pincode)
      const eCountry = customer.country ? escapeHtml(customer.country) : ''
      const ePhone = escapeHtml(customer.phone)
      const eEmail = escapeHtml(customer.email)
      const eNotes = customer.notes ? escapeHtml(customer.notes) : ''
      const eOrderId = escapeHtml(orderId)
      const ePaymentId = escapeHtml(razorpay_payment_id)
      const eRzpOrderId = escapeHtml(razorpay_order_id)
      const eTotal = escapeHtml(numericTotal)

      try {
        const orderItemsHtml = validatedItems.map((i) =>
          '<li style="padding: 12px 0; border-bottom: 1px dashed #e8ddd0; display: flex; justify-content: space-between; color: #6b5347;">' +
          '<span>' + i.qty + 'x ' + escapeHtml(i.name) + '</span>' +
          '<strong style="color: #2d1b15;">Rs ' + (i.price * i.qty) + '</strong>' +
          '</li>'
        ).join('');

        const itemCount = validatedItems.reduce((s, i) => s + i.qty, 0);
        const placedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
        const etaFrom = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const etaTo = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
        const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const etaRange = fmtDate(etaFrom) + ' – ' + fmtDate(etaTo);

        await resend.emails.send({
          from: 'Annavedah Foods <support@annavedahfoods.com>',
          to: customer.email,
          subject: 'Order Confirmed ✓ — ' + orderId + ' (Rs ' + numericTotal + ')',
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Thank You for Your Order!</h1>' +
            '<p style="color: #6b5347; font-size: 13px; margin: 8px 0 0;">Order ' + eOrderId + ' &middot; placed ' + placedAt + '</p>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + eFirst + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">Payment of <strong>Rs ' + eTotal + '</strong> received successfully — your order is confirmed and headed into our kitchen for hand-packing. Below are all the details for your records.</p>' +

            '<div style="background-color: #f0fdf4; padding: 18px 20px; border-radius: 12px; border: 1px solid #bbf7d0; margin: 24px 0;">' +
              '<p style="margin: 0 0 4px; color: #166534; font-size: 14px; font-weight: bold;">Estimated delivery</p>' +
              '<p style="margin: 0; color: #166534; font-size: 18px; font-weight: 600;">' + etaRange + '</p>' +
              '<p style="margin: 8px 0 0; color: #166534; font-size: 13px;">You\'ll get a separate tracking email as soon as your parcel ships (usually within 24 hours).</p>' +
            '</div>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Payment Details</h3>' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<tr><td style="padding: 6px 0; color: #6b5347; width: 160px;">Payment Method</td><td style="padding: 6px 0; color: #2d1b15;">Razorpay (Prepaid)</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Payment ID</td><td style="padding: 6px 0; color: #2d1b15; font-family: monospace;">' + ePaymentId + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Order ID</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">' + eOrderId + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Items</td><td style="padding: 6px 0; color: #2d1b15;">' + itemCount + ' item' + (itemCount === 1 ? '' : 's') + '</td></tr>' +
            '</table>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Order Summary</h3>' +
            '<ul style="list-style: none; padding: 0; margin: 0;">' + orderItemsHtml +
            '<li style="padding: 12px 0; display: flex; justify-content: space-between; color: #6b5347; border-bottom: 1px dashed #e8ddd0;">' +
              '<span>Shipping</span><strong style="color: #166534;">FREE</strong>' +
            '</li>' +
            '<li style="padding: 16px 0 0; display: flex; justify-content: space-between; font-size: 18px;">' +
            '<span style="color: #6b5347;">Total Paid</span>' +
            '<strong style="color: #8b1a1a;">Rs ' + eTotal + '</strong>' +
            '</li></ul>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 32px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Shipping To</h3>' +
            '<p style="color: #6b5347; font-size: 14px; line-height: 1.7; margin: 0; background:#faf6f0; padding:14px 16px; border-radius:8px; border-left: 4px solid #c9a45c;">' +
            '<strong style="color:#2d1b15;">' + eFirst + ' ' + eLast + '</strong><br/>' +
            eAddress + '<br/>' +
            (eLandmark ? eLandmark + '<br/>' : '') +
            eCity + ', ' + eState + ' ' + ePincode + '<br/>' +
            'Phone: ' + ePhone + '<br/>' +
            'Email: ' + eEmail +
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

        const adminAddressBlock =
          eFirst + ' ' + eLast + '<br/>' +
          eAddress + '<br/>' +
          (eLandmark ? eLandmark + '<br/>' : '') +
          eCity + ', ' + eState + ' - ' + ePincode + '<br/>' +
          (eCountry ? eCountry + '<br/>' : '') +
          'Phone: ' + ePhone + '<br/>' +
          'Email: ' + eEmail

        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: getAdminEmails(),
          subject: '🚨 NEW ORDER RECEIVED - ' + orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 2px solid #8b1a1a; border-radius: 12px; overflow: hidden;">' +
            '<div style="background-color: #8b1a1a; padding: 24px; text-align: center;">' +
            '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Order Alert 🚨</h1>' +
            '</div>' +
            '<div style="padding: 28px 32px;">' +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 0;">Order Details</h3>' +
            '<table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">' +
            '<tr><td style="padding: 6px 0; color: #6b5347; width: 140px;">Order ID:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + eOrderId + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Payment ID:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + ePaymentId + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Razorpay Order:</td><td style="padding: 6px 0; color: #2d1b15;">' + eRzpOrderId + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Total:</td><td style="padding: 6px 0; font-weight: bold; color: #8b1a1a; font-size: 18px;">Rs ' + eTotal + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Placed at:</td><td style="padding: 6px 0; color: #2d1b15;">' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST</td></tr>' +
            '</table>' +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Customer</h3>' +
            '<table style="width: 100%; border-collapse: collapse;">' +
            '<tr><td style="padding: 6px 0; color: #6b5347; width: 140px;">Name:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + eFirst + ' ' + eLast + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Email:</td><td style="padding: 6px 0; color: #2d1b15;"><a href="mailto:' + eEmail + '" style="color: #8b1a1a;">' + eEmail + '</a></td></tr>' +
            '<tr><td style="padding: 6px 0; color: #6b5347;">Phone:</td><td style="padding: 6px 0; color: #2d1b15;"><a href="tel:' + ePhone + '" style="color: #8b1a1a;">' + ePhone + '</a></td></tr>' +
            '</table>' +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Shipping Address</h3>' +
            '<p style="color: #2d1b15; font-size: 14px; line-height: 1.7; margin: 0; background: #faf6f0; padding: 14px 16px; border-radius: 8px; border-left: 4px solid #c9a45c;">' +
            adminAddressBlock +
            '</p>' +
            (eNotes ? '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Order Notes</h3><p style="color: #2d1b15; font-size: 14px; line-height: 1.6; margin: 0;">' + eNotes + '</p>' : '') +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Items Ordered (' + validatedItems.reduce((s, i) => s + i.qty, 0) + ' units across ' + validatedItems.length + ' SKUs)</h3>' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<thead><tr><th align="left" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347; font-weight:600;">Item</th><th align="center" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347; font-weight:600;">Qty</th><th align="right" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347; font-weight:600;">Unit</th><th align="right" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347; font-weight:600;">Line Total</th></tr></thead>' +
              '<tbody>' + validatedItems.map((i) =>
                '<tr>' +
                  '<td style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15;">' + escapeHtml(i.name) + '</td>' +
                  '<td align="center" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15;">' + i.qty + '</td>' +
                  '<td align="right" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#6b5347;">Rs ' + i.price + '</td>' +
                  '<td align="right" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15; font-weight:600;">Rs ' + (i.price * i.qty) + '</td>' +
                '</tr>'
              ).join('') + '</tbody>' +
            '</table>' +
            '<div style="text-align: center; margin-top: 32px;">' +
            '<a href="https://annavedahfoods.com/' + (process.env.NEXT_PUBLIC_ADMIN_SLUG || 'n7xk2mq9pf') + '" style="display: inline-block; background-color: #2d1b15; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Dashboard</a>' +
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
