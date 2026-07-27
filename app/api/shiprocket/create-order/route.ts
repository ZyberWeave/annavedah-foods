import { NextRequest, NextResponse } from 'next/server'
import { checkServiceability, createShiprocketOrder, type ShiprocketOrderPayload } from '@/lib/shiprocket'
import { Resend } from 'resend'
import { findOrderByOrderId, persistOrderRecord, userOwnsOrder } from '@/lib/order-records'
import { verifySession } from '@/lib/auth'
import { escapeHtml, getAdminEmails, isSafeHeaderValue, validateOrderItems } from '@/lib/email-utils'
import { db } from '@/lib/db'
import { orders, users } from '@/lib/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit'
import { priceCart } from '@/lib/pricing'
import { PAID_ORDER_STATUSES } from '@/lib/order-status'
import { isTestServiceablePincode } from '@/lib/serviceability-overrides'
import { deductInventoryForOrder, restoreInventoryForRefund } from '@/lib/inventory'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(req)
    const rl = await rateLimitOr429(`shiprocket:user:${session.userId}:${ip}`, 20, 60)
    if (rl) return rl

    const body = await req.json()
    const { orderId, paymentId, customer, cart, couponCode, paymentMethod = 'Prepaid' } = body

    if (!orderId || !customer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/^\d{6}$/.test(String(customer.pincode ?? ''))) {
      return NextResponse.json({ error: 'A valid 6-digit pincode is required' }, { status: 400 })
    }

    // Server-side serviceability check. The client already gates the pay
    // button on this, but a determined caller can submit anyway. Do the
    // authoritative check here against the *correct* COD flag for the
    // chosen payment method.
    try {
      const codFlag = paymentMethod === 'COD' ? 1 : 0
      if (!isTestServiceablePincode(String(customer.pincode))) {
        const svc = await checkServiceability('411001', String(customer.pincode), 0.5, codFlag)
        const couriers = svc?.data?.available_courier_companies ?? []
        if (!Array.isArray(couriers) || couriers.length === 0) {
          return NextResponse.json(
            { error: paymentMethod === 'COD'
                ? 'Cash on Delivery is not available at this pincode.'
                : 'Sorry, we don\'t deliver to this pincode yet.' },
            { status: 400 },
          )
        }
      }
    } catch (svcErr) {
      // Don't block the order on a Shiprocket API outage — log and continue.
      // The actual createShiprocketOrder call below will fail loudly if the
      // pincode is truly bad, and the COD path soft-fails to manual review.
      console.error('[shiprocket/create-order] serviceability precheck failed', svcErr)
    }

    // Server-priced lines/total. For Prepaid, this is overwritten below by
    // whatever was persisted at razorpay/verify time (defense in depth).
    let validatedItems: { name: string; qty: number; price: number; slug?: string }[]
    let numericTotal: number

    if (paymentMethod === 'COD') {
      if (!cart) return NextResponse.json({ error: 'cart is required' }, { status: 400 })
      try {
        const pricing = await priceCart(cart, { couponCode, paymentMethod: 'COD', userId: session.userId })
        validatedItems = pricing.items
        numericTotal = pricing.total
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Invalid cart'
        return NextResponse.json({ error: msg }, { status: 400 })
      }
    } else {
      // Will be replaced from DB row below.
      validatedItems = []
      numericTotal = 0
    }

    // Resolve session email for ownership checks.
    const [sessionUser] = await db.select({ email: users.email }).from(users).where(eq(users.id, session.userId)).limit(1)
    const sessionEmail = sessionUser?.email ?? null
    if (!sessionEmail) {
      return NextResponse.json({ error: 'Session user not found' }, { status: 401 })
    }

    // Look up the existing order. For Prepaid, this MUST exist (created by
    // /api/razorpay/verify). For COD, it may or may not exist — if it does,
    // ownership must match.
    const existing = await findOrderByOrderId(orderId)

    if (paymentMethod !== 'COD') {
      // Treat any paid fulfillment state as eligible — admin advancing the
      // order to processing/shipped/delivered shouldn't break a re-sync.
      if (!existing || !(PAID_ORDER_STATUSES as readonly string[]).includes(existing.status)) {
        return NextResponse.json({ error: 'Order not found or unverified' }, { status: 404 })
      }
      if (!userOwnsOrder(existing, session, sessionEmail)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Trust the DB's totals/items, not whatever the client just sent.
      const dbItemsRaw = (() => { try { return JSON.parse(existing.items) } catch { return [] } })()
      try {
        validatedItems = validateOrderItems(dbItemsRaw)
      } catch {
        return NextResponse.json({ error: 'Stored order items are invalid' }, { status: 500 })
      }
      numericTotal = existing.total
    }

    let codAlreadyProcessed = false
    if (paymentMethod === 'COD') {
      if (existing) {
        if (!userOwnsOrder(existing, session, sessionEmail)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        if ((PAID_ORDER_STATUSES as readonly string[]).includes(existing.status)) {
          codAlreadyProcessed = true
        }
      }
    }

    // Idempotency for the Shiprocket call itself. The shippingId column has
    // three meaningful states:
    //   - NULL: never synced
    //   - 'IN_PROGRESS_<uuid>': another request is in the middle of calling
    //     Shiprocket (claim-sentinel pattern)
    //   - any other value: the real shipment id from a successful prior call
    //
    // Real shipment id → return cached. Sentinel → tell the client to wait.
    const SHIPROCKET_SENTINEL_PREFIX = 'IN_PROGRESS_'
    if (existing?.shippingId && !existing.shippingId.startsWith(SHIPROCKET_SENTINEL_PREFIX)) {
      return NextResponse.json(
        {
          success: true,
          shipment_id: existing.shippingId,
          order_id: orderId,
          payment_id: existing.paymentId ?? null,
          duplicate: true,
        },
        { status: 200 },
      )
    }
    if (existing?.shippingId?.startsWith(SHIPROCKET_SENTINEL_PREFIX)) {
      return NextResponse.json(
        {
          success: false,
          inProgress: true,
          error: 'Shipping sync is already in progress for this order. Please retry shortly.',
        },
        { status: 409 },
      )
    }

    const now = new Date()
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const payload: ShiprocketOrderPayload = {
      order_id: orderId,
      order_date: orderDate,
      pickup_location: 'Primary',
      billing_customer_name: customer.firstName,
      billing_last_name: customer.lastName ?? '',
      billing_address: customer.address,
      billing_city: customer.city,
      billing_pincode: customer.pincode,
      billing_state: customer.state,
      billing_country: 'India',
      billing_email: customer.email,
      billing_phone: customer.phone,
      shipping_is_billing: true,
      order_items: validatedItems.map((item, idx) => ({
        name: item.name,
        sku: `SKU-${idx + 1}`,
        units: item.qty,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 0,
      })),
      payment_method: paymentMethod,
      sub_total: numericTotal,
      length: 15,
      breadth: 10,
      height: 10,
      weight: 0.5,
    }

    if (paymentMethod === 'COD' && !codAlreadyProcessed) {
      const inventoryItems = validatedItems
        .filter((item): item is typeof item & { slug: string } => typeof item.slug === 'string')
        .map((item) => ({ slug: item.slug, qty: item.qty }))
      const deduction = await deductInventoryForOrder(inventoryItems)
      if (!deduction.success) {
        return NextResponse.json({ error: 'One or more items are out of stock' }, { status: 409 })
      }
      try {
        await persistOrderRecord({
          orderId,
          paymentId: paymentId || 'COD',
          // Bind the order to the verified account email, not the client-supplied
          // shipping-form email — keeps ownership/recovery consistent with the
          // prepaid path and prevents arbitrary-recipient abuse.
          customerEmail: sessionEmail,
          total: numericTotal,
          items: validatedItems,
          status: 'success',
          userId: session.userId,
        })
      } catch (persistError) {
        await restoreInventoryForRefund(inventoryItems)
        throw persistError
      }
    }

    // Claim the row atomically BEFORE calling Shiprocket. This pattern
    // prevents a "shipment created at the gateway but DB stamp failed →
    // retry creates a duplicate shipment" race. After this, three outcomes:
    //   1) Shiprocket call succeeds → replace sentinel with real shipment_id
    //   2) Shiprocket call fails    → clear sentinel so a future retry can try
    //   3) Shiprocket call succeeds but the stamp UPDATE fails → leave the
    //      sentinel in place; next request returns 409 'in progress' and
    //      ops must reconcile manually (we have a Shiprocket id we couldn't
    //      record, so re-trying would double-create at the gateway)
    const sentinel = SHIPROCKET_SENTINEL_PREFIX + crypto.randomUUID()
    const claim = await db
      .update(orders)
      .set({ shippingId: sentinel })
      .where(and(eq(orders.orderId, orderId), isNull(orders.shippingId)))
      .returning({ id: orders.id })
    if (claim.length === 0) {
      // Lost the race to a concurrent caller.
      return NextResponse.json(
        {
          success: false,
          inProgress: true,
          error: 'Shipping sync is already in progress for this order. Please retry shortly.',
        },
        { status: 409 },
      )
    }

    let shiprocketResponse: Awaited<ReturnType<typeof createShiprocketOrder>> | null = null
    let shiprocketError: string | null = null

    try {
      shiprocketResponse = await createShiprocketOrder(payload)
    } catch (shiprocketErr) {
      shiprocketError = shiprocketErr instanceof Error ? shiprocketErr.message : 'Shiprocket sync failed'
      console.error('[shiprocket/create-order] sync failure', shiprocketErr)

      // Gateway never created a shipment — clear the sentinel so a future
      // attempt is not permanently blocked.
      await db
        .update(orders)
        .set({ shippingId: null })
        .where(and(eq(orders.orderId, orderId), eq(orders.shippingId, sentinel)))
        .catch(() => {})

      if (paymentMethod !== 'COD') {
        throw shiprocketErr
      }
    }

    // Replace the sentinel with the real shipment id. We bind the WHERE to
    // OUR sentinel so a foreign rollback can't clobber another concurrent
    // request's claim.
    if (shiprocketResponse?.shipment_id) {
      try {
        await db
          .update(orders)
          .set({ shippingId: String(shiprocketResponse.shipment_id) })
          .where(and(eq(orders.orderId, orderId), eq(orders.shippingId, sentinel)))
      } catch (stampErr) {
        // Critical: gateway created the shipment but we can't record the id.
        // Do NOT clear the sentinel — leave it stuck so retries return 409
        // and ops investigate. Otherwise we'd risk a duplicate shipment.
        console.error('[shiprocket/create-order] gateway created shipment but DB stamp failed — manual reconcile required', {
          orderId,
          shipmentId: shiprocketResponse.shipment_id,
          stampErr,
        })
      }
    }

    if (paymentMethod === 'COD' && !codAlreadyProcessed) {
      const eFirst = escapeHtml(customer.firstName)
      const eLast = escapeHtml(customer.lastName)
      const eAddress = escapeHtml(customer.address)
      const eLandmark = customer.landmark ? escapeHtml(customer.landmark) : ''
      const eCity = escapeHtml(customer.city)
      const eState = escapeHtml(customer.state)
      const ePincode = escapeHtml(customer.pincode)
      const ePhone = escapeHtml(customer.phone)
      const eEmail = escapeHtml(customer.email)
      const eOrderId = escapeHtml(orderId)
      const eTotal = escapeHtml(numericTotal)
      const eShipmentId = shiprocketResponse?.shipment_id ? escapeHtml(shiprocketResponse.shipment_id) : ''

      try {
        const orderItemsHtml = validatedItems.map((i) =>
          '<li style="padding: 12px 0; border-bottom: 1px dashed #e8ddd0; display: flex; justify-content: space-between; color: #6b5347;">' +
          '<span>' + i.qty + 'x ' + escapeHtml(i.name) + '</span>' +
          '<strong style="color: #2d1b15;">Rs ' + (i.price * i.qty) + '</strong>' +
          '</li>'
        ).join('');

        const itemCount = validatedItems.reduce((s, i) => s + i.qty, 0);
        const placedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
        const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const etaRange = fmtDate(new Date(Date.now() + 3 * 86400000)) + ' – ' + fmtDate(new Date(Date.now() + 6 * 86400000));

        await resend.emails.send({
          // Authoritative account email, never the client-supplied one.
          from: 'Annavedah Foods <support@annavedahfoods.com>',
          to: sessionEmail,
          subject: 'COD Order Confirmed — ' + orderId + ' (Pay Rs ' + numericTotal + ' on delivery)',
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Your COD Order is Confirmed!</h1>' +
            '<p style="color: #6b5347; font-size: 13px; margin: 8px 0 0;">Order ' + eOrderId + ' &middot; placed ' + placedAt + '</p>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + eFirst + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">Your Cash-on-Delivery order is locked in. Please keep <strong>Rs ' + eTotal + '</strong> ready for the courier when they arrive at your doorstep.</p>' +

            '<div style="background-color: #fffbeb; padding: 18px 20px; border-radius: 12px; border: 1px solid #fde68a; margin: 24px 0;">' +
              '<p style="margin: 0 0 4px; color: #78350f; font-size: 14px; font-weight: bold;">Amount due on delivery</p>' +
              '<p style="margin: 0; color: #78350f; font-size: 24px; font-weight: 700;">Rs ' + eTotal + '</p>' +
              '<p style="margin: 8px 0 0; color: #78350f; font-size: 13px;">Cash only. The courier may not carry change for very large notes.</p>' +
            '</div>' +

            '<div style="background-color: #f0fdf4; padding: 18px 20px; border-radius: 12px; border: 1px solid #bbf7d0; margin: 24px 0;">' +
              '<p style="margin: 0 0 4px; color: #166534; font-size: 14px; font-weight: bold;">Estimated delivery</p>' +
              '<p style="margin: 0; color: #166534; font-size: 18px; font-weight: 600;">' + etaRange + '</p>' +
              '<p style="margin: 8px 0 0; color: #166534; font-size: 13px;">A separate tracking email follows once your parcel is dispatched.</p>' +
            '</div>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Order Details</h3>' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<tr><td style="padding: 6px 0; color: #6b5347; width: 160px;">Order ID</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">' + eOrderId + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Payment Method</td><td style="padding: 6px 0; color: #2d1b15;">Cash on Delivery</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Items</td><td style="padding: 6px 0; color: #2d1b15;">' + itemCount + ' item' + (itemCount === 1 ? '' : 's') + '</td></tr>' +
            '</table>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Order Summary</h3>' +
            '<ul style="list-style: none; padding: 0; margin: 0;">' + orderItemsHtml +
            '<li style="padding: 12px 0; display: flex; justify-content: space-between; color: #6b5347; border-bottom: 1px dashed #e8ddd0;">' +
              '<span>Shipping</span><strong style="color:#166534;">FREE</strong>' +
            '</li>' +
            '<li style="padding: 16px 0 0; display: flex; justify-content: space-between; font-size: 18px;">' +
            '<span style="color: #6b5347;">Total (COD)</span>' +
            '<strong style="color: #8b1a1a;">Rs ' + eTotal + '</strong>' +
            '</li></ul>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 32px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Shipping To</h3>' +
            '<p style="color: #6b5347; font-size: 14px; line-height: 1.7; margin: 0; background:#faf6f0; padding:14px 16px; border-radius:8px; border-left:4px solid #c9a45c;">' +
            '<strong style="color:#2d1b15;">' + eFirst + ' ' + eLast + '</strong><br/>' +
            eAddress + '<br/>' +
            (eLandmark ? eLandmark + '<br/>' : '') +
            eCity + ', ' + eState + ' ' + ePincode + '<br/>' +
            'Phone: ' + ePhone + '<br/>' +
            'Email: ' + eEmail +
            '</p>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 32px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Need to Change Something?</h3>' +
            '<ul style="color: #6b5347; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">' +
              '<li>Track or cancel from your <a href="https://annavedahfoods.com/dashboard" style="color:#8b1a1a;">dashboard</a> within 12 hours.</li>' +
              '<li>Wrong address? Reply to this email immediately.</li>' +
              '<li>Help: <a href="mailto:support@annavedahfoods.com" style="color:#8b1a1a;">support@annavedahfoods.com</a></li>' +
            '</ul>' +

            '<p style="color: #6b5347; font-size: 14px; line-height: 1.6; margin-top: 28px;">With gratitude,<br/><strong style="color:#2d1b15;">Team Annavedah</strong></p>' +
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
          'Phone: ' + ePhone + '<br/>' +
          'Email: ' + eEmail;

        const adminItemsTable = '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
          '<thead><tr><th align="left" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347;">Item</th><th align="center" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347;">Qty</th><th align="right" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347;">Unit</th><th align="right" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347;">Line</th></tr></thead>' +
          '<tbody>' + validatedItems.map((i) =>
            '<tr><td style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15;">' + escapeHtml(i.name) + '</td>' +
            '<td align="center" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15;">' + i.qty + '</td>' +
            '<td align="right" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#6b5347;">Rs ' + i.price + '</td>' +
            '<td align="right" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15; font-weight:600;">Rs ' + (i.price * i.qty) + '</td></tr>'
          ).join('') + '</tbody></table>';

        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: getAdminEmails(),
          subject: '🚨 NEW COD ORDER - ' + orderId + ' (Rs ' + numericTotal + ' to collect)',
          ...(isSafeHeaderValue(customer.email) ? { replyTo: customer.email } : {}),
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 2px solid #8b1a1a; border-radius: 12px; overflow: hidden;">' +
            '<div style="background-color: #8b1a1a; padding: 24px; text-align: center;">' +
            '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New COD Order Alert 🚨</h1>' +
            '<p style="color: #ffe4e6; font-size: 13px; margin: 6px 0 0;">' + eOrderId + ' &middot; ' + placedAt + '</p>' +
            '</div>' +
            '<div style="padding: 28px 32px;">' +
              '<div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:14px 16px; margin-bottom:20px;">' +
                '<p style="margin:0; color:#78350f; font-size:13px; font-weight:bold;">⚠️ COD — Rs ' + eTotal + ' to be collected on delivery</p>' +
              '</div>' +

              '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top:0;">Order Details</h3>' +
              '<table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">' +
                '<tr><td style="padding: 6px 0; color: #6b5347; width: 140px;">Order ID:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + eOrderId + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Payment Method:</td><td style="padding: 6px 0; color: #2d1b15;">Cash on Delivery</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Total to Collect:</td><td style="padding: 6px 0; font-weight: bold; color: #8b1a1a; font-size: 18px;">Rs ' + eTotal + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Placed at:</td><td style="padding: 6px 0; color: #2d1b15;">' + placedAt + '</td></tr>' +
                (eShipmentId ? '<tr><td style="padding: 6px 0; color: #6b5347;">Shiprocket Shipment:</td><td style="padding: 6px 0; color: #2d1b15;">' + eShipmentId + '</td></tr>' : '') +
              '</table>' +

              '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Customer</h3>' +
              '<table style="width: 100%; border-collapse: collapse;">' +
                '<tr><td style="padding: 6px 0; color: #6b5347; width: 140px;">Name:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + eFirst + ' ' + eLast + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Email:</td><td style="padding: 6px 0;"><a href="mailto:' + eEmail + '" style="color:#8b1a1a;">' + eEmail + '</a></td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Phone:</td><td style="padding: 6px 0;"><a href="tel:' + ePhone + '" style="color:#8b1a1a;">' + ePhone + '</a></td></tr>' +
              '</table>' +

              '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Shipping Address</h3>' +
              '<p style="color: #2d1b15; font-size: 14px; line-height: 1.7; margin: 0; background:#faf6f0; padding:14px 16px; border-radius:8px; border-left:4px solid #c9a45c;">' + adminAddressBlock + '</p>' +

              '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Items Ordered (' + itemCount + ' units across ' + validatedItems.length + ' SKUs)</h3>' +
              adminItemsTable +

              '<div style="text-align: center; margin-top: 32px;">' +
              '<a href="https://annavedahfoods.com/' + (process.env.NEXT_PUBLIC_ADMIN_SLUG || 'n7xk2mq9pf') + '" style="display: inline-block; background-color: #2d1b15; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Dashboard</a>' +
              '</div></div></div>',
        });
      } catch (emailErr) {
        console.error('Failed to send COD purchase emails:', emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        shipment_id: shiprocketResponse?.shipment_id ?? null,
        order_id: shiprocketResponse?.order_id ?? orderId,
        payment_id: paymentId ?? null,
        shippingSyncFailed: Boolean(shiprocketError),
        shippingSyncError: shiprocketError,
        duplicate: codAlreadyProcessed,
      },
      { status: shiprocketError ? 202 : 201 },
    )
  } catch (err: unknown) {
    console.error('[shiprocket/create-order]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
