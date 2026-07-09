import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { orders } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { findOrderByOrderId } from '@/lib/order-records'
import { escapeHtml, getAdminEmails } from '@/lib/email-utils'

/**
 * Razorpay webhook handler — fallback reconciliation path.
 *
 * The live checkout flow is: client → /api/razorpay/verify → success.
 * If the customer pays but loses the page before /verify fires (browser
 * crash, lost network, etc.), the order would otherwise stay 'pending'
 * forever. This webhook is Razorpay's async server-to-server notification
 * and brings the local DB back in sync.
 *
 * Setup:
 *   1. Configure RAZORPAY_WEBHOOK_SECRET in env.
 *   2. In the Razorpay dashboard, register the webhook URL pointing here and
 *      subscribe to at least: `payment.captured`, `order.paid`.
 *
 * Idempotency: identical to /api/razorpay/verify — same razorpay_order_id +
 * payment_id pair is a no-op; mismatched bindings are rejected.
 */

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[razorpay/webhook] RAZORPAY_WEBHOOK_SECRET not configured')
    return new NextResponse('Webhook not configured', { status: 503 })
  }

  // Read the raw body. Signature is computed over the raw bytes Razorpay sent.
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const sigBuf = Buffer.from(expected, 'hex')
  const givenBuf = Buffer.from(signature, 'hex')
  const sigOk = sigBuf.length === givenBuf.length && crypto.timingSafeEqual(sigBuf, givenBuf)
  if (!sigOk) {
    console.warn('[razorpay/webhook] signature mismatch')
    return new NextResponse('Invalid signature', { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 })
  }

  try {
    const eventType: string = event?.event ?? ''
    // We only act on captured-payment events. Both `payment.captured` and
    // `order.paid` carry the data we need; either one is enough to reconcile.
    if (eventType !== 'payment.captured' && eventType !== 'order.paid') {
      return NextResponse.json({ received: true, ignored: eventType }, { status: 200 })
    }

    const paymentEntity = event?.payload?.payment?.entity
    if (!paymentEntity) {
      return NextResponse.json({ received: true, error: 'no payment entity' }, { status: 200 })
    }

    const razorpayOrderId: string | undefined = paymentEntity.order_id
    const razorpayPaymentId: string | undefined = paymentEntity.id
    const capturedAmountPaise = Number(paymentEntity.amount)
    const capturedCurrency: string = paymentEntity.currency
    const capturedStatus: string = paymentEntity.status
    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ received: true, error: 'missing ids' }, { status: 200 })
    }

    // Razorpay only emits payment.captured when the payment is in 'captured'
    // state, but webhooks can be replayed against fixtures or re-fired. Defend
    // by checking the entity status explicitly.
    if (capturedStatus !== 'captured') {
      return NextResponse.json({ received: true, ignored: 'not captured' }, { status: 200 })
    }
    if (capturedCurrency !== 'INR') {
      console.error('[razorpay/webhook] unexpected currency', { razorpayOrderId, capturedCurrency })
      return NextResponse.json({ received: true, error: 'wrong currency' }, { status: 200 })
    }

    const existing = await findOrderByOrderId(razorpayOrderId)
    if (!existing) {
      // Pending row should have been created by /api/razorpay/create-order.
      // If we get a webhook for an unknown order, it's not necessarily fraud
      // — could be an order created via a different env or an old record.
      console.warn('[razorpay/webhook] unknown order_id', razorpayOrderId)
      return NextResponse.json({ received: true, error: 'unknown order' }, { status: 200 })
    }

    // Captured amount must match what we priced. Razorpay sends amount in
    // paise; orders.total is rupees. Underpayment / overpayment / currency
    // mismatch all land here.
    const expectedPaise = Number(existing.total) * 100
    if (!Number.isFinite(capturedAmountPaise) || capturedAmountPaise !== expectedPaise) {
      console.error('[razorpay/webhook] amount mismatch', {
        orderId: razorpayOrderId,
        expectedPaise,
        capturedAmountPaise,
      })
      return NextResponse.json({ received: true, error: 'amount mismatch' }, { status: 200 })
    }

    // Already finalised with this payment — no-op.
    if (existing.paymentId === razorpayPaymentId && existing.status !== 'pending') {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
    }

    // Existing row is bound to a different payment id — refuse.
    if (existing.paymentId && existing.paymentId !== razorpayPaymentId) {
      console.error('[razorpay/webhook] order/payment mismatch', {
        orderId: razorpayOrderId,
        existingPaymentId: existing.paymentId,
        incoming: razorpayPaymentId,
      })
      return NextResponse.json({ received: true, error: 'mismatch' }, { status: 200 })
    }

    // Same payment-replay safety as the verify route: if this paymentId is
    // already bound to a different order in our DB, refuse.
    const otherBinding = await db
      .select({ orderId: orders.orderId })
      .from(orders)
      .where(eq(orders.paymentId, razorpayPaymentId))
      .limit(1)
    if (otherBinding[0] && otherBinding[0].orderId !== razorpayOrderId) {
      console.error('[razorpay/webhook] payment replay attempt', {
        incomingOrderId: razorpayOrderId,
        alreadyBoundTo: otherBinding[0].orderId,
      })
      return NextResponse.json({ received: true, error: 'replay' }, { status: 200 })
    }

    // Atomic flip: only update rows still in 'pending'.
    const flipped = await db
      .update(orders)
      .set({ paymentId: razorpayPaymentId, status: 'success' })
      .where(and(eq(orders.orderId, razorpayOrderId), eq(orders.status, 'pending')))
      .returning()

    let justFlipped = flipped.length > 0

    // Zero rows updated → re-read and surface the actual state. If the row
    // was admin-cancelled before payment landed, we need to alert ops, not
    // silently 200 like everything is fine.
    if (!justFlipped) {
      const after = await findOrderByOrderId(razorpayOrderId)
      const isPaidDuplicate =
        after &&
        after.paymentId === razorpayPaymentId &&
        ((['success', 'processing', 'shipped', 'delivered'] as readonly string[]).includes(after.status))
      if (!isPaidDuplicate) {
        console.error('[razorpay/webhook] zero-row flip without paid duplicate — likely cancelled-before-pay', {
          orderId: razorpayOrderId,
          razorpayPaymentId,
          afterStatus: after?.status,
          afterPaymentId: after?.paymentId,
        })
        try {
          await resend.emails.send({
            from: 'Annavedah System <support@annavedahfoods.com>',
            to: getAdminEmails(),
            subject: '⚠️ MANUAL RECONCILE: payment captured for non-pending order ' + razorpayOrderId,
            html:
              '<div style="font-family: Helvetica, Arial, sans-serif; padding: 16px;">' +
                '<h2>Razorpay webhook fired but the local order is not pending.</h2>' +
                '<p>Likely an admin-cancellation race. Investigate and refund manually if needed.</p>' +
                '<ul>' +
                  '<li>Order ID: <code>' + escapeHtml(razorpayOrderId) + '</code></li>' +
                  '<li>Payment ID: <code>' + escapeHtml(razorpayPaymentId) + '</code></li>' +
                  '<li>Local status: <code>' + escapeHtml(after?.status ?? 'missing') + '</code></li>' +
                  '<li>Local paymentId: <code>' + escapeHtml(after?.paymentId ?? 'null') + '</code></li>' +
                '</ul>' +
              '</div>',
          })
        } catch (alertErr) {
          console.error('[razorpay/webhook] failed to send manual-reconcile alert', alertErr)
        }
        return NextResponse.json({ received: true, reconcile: 'manual' }, { status: 200 })
      }
      // Legitimate duplicate — verify already finalised this. Skip emails.
      justFlipped = false
    }

    if (justFlipped) {
      // Send a minimal confirmation email. We don't have the rich shipping
      // address (that came from the checkout form which wasn't persisted),
      // so this email is intentionally lighter than the verify-route emails.
      try {
        let parsedItems: Array<{ name: string; qty: number; price: number }> = []
        try { parsedItems = JSON.parse(existing.items) } catch {}
        const itemsHtml = parsedItems
          .map((i) =>
            '<li style="padding: 8px 0; border-bottom: 1px dashed #e8ddd0; display: flex; justify-content: space-between; color: #6b5347;">' +
              '<span>' + (Number(i.qty) || 0) + 'x ' + escapeHtml(i.name) + '</span>' +
              '<strong style="color: #2d1b15;">Rs ' + (Number(i.price) * Number(i.qty) || 0) + '</strong>' +
            '</li>',
          )
          .join('')

        const eOrderId = escapeHtml(razorpayOrderId)
        const ePaymentId = escapeHtml(razorpayPaymentId)
        const eEmail = escapeHtml(existing.customerEmail)
        const eTotal = escapeHtml(existing.total)

        await resend.emails.send({
          from: 'Annavedah Foods <support@annavedahfoods.com>',
          to: existing.customerEmail,
          subject: 'Payment Received — Order ' + razorpayOrderId,
          html:
            '<div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e8ddd0; border-radius: 12px; padding: 32px;">' +
              '<h1 style="color: #8b1a1a; margin: 0 0 16px;">Payment received</h1>' +
              '<p style="color: #6b5347;">Hi,</p>' +
              '<p style="color: #6b5347;">We have received your payment of <strong>Rs ' + eTotal + '</strong> for order <strong>' + eOrderId + '</strong>. ' +
                'If you didn\'t see the confirmation page, this email is your receipt.</p>' +
              '<p style="color: #6b5347; font-size: 13px;">Payment ID: <code>' + ePaymentId + '</code></p>' +
              (itemsHtml ? '<h3 style="color: #2d1b15; margin-top: 24px;">Order Summary</h3><ul style="list-style: none; padding: 0; margin: 0;">' + itemsHtml + '</ul>' : '') +
              '<p style="color: #6b5347; margin-top: 24px;">Reach us at <a href="mailto:support@annavedahfoods.com" style="color: #8b1a1a;">support@annavedahfoods.com</a> with this order id if you need any help.</p>' +
              '<p style="color: #6b5347;">Email on file: ' + eEmail + '</p>' +
            '</div>',
        })

        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: getAdminEmails(),
          subject: '🚨 WEBHOOK-RECONCILED ORDER ' + razorpayOrderId,
          html:
            '<div style="font-family: Helvetica, Arial, sans-serif; padding: 16px;">' +
              '<h2>Webhook reconciled an order</h2>' +
              '<p>The customer paid but the live verify path did not fire (likely closed browser). ' +
                'The order has been moved to <strong>success</strong> via the Razorpay webhook.</p>' +
              '<ul>' +
                '<li>Order ID: <code>' + eOrderId + '</code></li>' +
                '<li>Payment ID: <code>' + ePaymentId + '</code></li>' +
                '<li>Customer: ' + eEmail + '</li>' +
                '<li>Total: Rs ' + eTotal + '</li>' +
              '</ul>' +
              '<p>Shipping address was NOT captured. Please coordinate with the customer for delivery details.</p>' +
            '</div>',
        })
      } catch (emailErr) {
        console.error('[razorpay/webhook] email send failed', emailErr)
      }
    }

    return NextResponse.json({ received: true, flipped: justFlipped }, { status: 200 })
  } catch (err: unknown) {
    // Always return 200 to Razorpay so they don't aggressively retry on bugs;
    // log the failure for our own attention.
    console.error('[razorpay/webhook] handler error', err)
    return NextResponse.json({ received: true, error: 'internal' }, { status: 200 })
  }
}
