import { NextRequest, NextResponse } from 'next/server'
import { createShiprocketOrder, type ShiprocketOrderPayload } from '@/lib/shiprocket'
import { Resend } from 'resend'
import { persistOrderRecord } from '@/lib/order-records'
import { verifySession } from '@/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, paymentId, customer, items, total, paymentMethod = 'Prepaid' } = body
    const session = await verifySession()

    if (!orderId || !customer || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
      order_items: items.map((item: { name: string; qty: number; price: number }, idx: number) => ({
        name: item.name,
        sku: `SKU-${idx + 1}`,
        units: item.qty,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 0,
      })),
      payment_method: paymentMethod,
      sub_total: total,
      length: 15,
      breadth: 10,
      height: 10,
      weight: 0.5,
    }

    if (paymentMethod === 'COD') {
      await persistOrderRecord({
        orderId,
        paymentId: paymentId || 'COD',
        customerEmail: customer.email,
        total: Number(total),
        items,
        status: 'success',
        userId: session?.userId ?? null,
      })
    }

    let shiprocketResponse: Awaited<ReturnType<typeof createShiprocketOrder>> | null = null
    let shiprocketError: string | null = null

    try {
      shiprocketResponse = await createShiprocketOrder(payload)
    } catch (shiprocketErr) {
      shiprocketError = shiprocketErr instanceof Error ? shiprocketErr.message : 'Shiprocket sync failed'
      console.error('[shiprocket/create-order] sync failure', shiprocketErr)

      if (paymentMethod !== 'COD') {
        throw shiprocketErr
      }
    }

    if (paymentMethod === 'COD') {
      try {
        const orderItemsHtml = items.map((i: any) =>
          '<li style="padding: 12px 0; border-bottom: 1px dashed #e8ddd0; display: flex; justify-content: space-between; color: #6b5347;">' +
          '<span>' + i.qty + 'x ' + i.name + '</span>' +
          '<strong style="color: #2d1b15;">Rs ' + (i.price * i.qty) + '</strong>' +
          '</li>'
        ).join('');

        const itemCount = items.reduce((s: number, i: any) => s + i.qty, 0);
        const placedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
        const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const etaRange = fmtDate(new Date(Date.now() + 3 * 86400000)) + ' – ' + fmtDate(new Date(Date.now() + 6 * 86400000));

        await resend.emails.send({
          from: 'Annavedah Foods <support@annavedahfoods.com>',
          to: customer.email,
          subject: 'COD Order Confirmed — ' + orderId + ' (Pay Rs ' + total + ' on delivery)',
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Your COD Order is Confirmed!</h1>' +
            '<p style="color: #6b5347; font-size: 13px; margin: 8px 0 0;">Order ' + orderId + ' &middot; placed ' + placedAt + '</p>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + customer.firstName + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">Your Cash-on-Delivery order is locked in. Please keep <strong>Rs ' + total + '</strong> ready for the courier when they arrive at your doorstep.</p>' +

            '<div style="background-color: #fffbeb; padding: 18px 20px; border-radius: 12px; border: 1px solid #fde68a; margin: 24px 0;">' +
              '<p style="margin: 0 0 4px; color: #78350f; font-size: 14px; font-weight: bold;">Amount due on delivery</p>' +
              '<p style="margin: 0; color: #78350f; font-size: 24px; font-weight: 700;">Rs ' + total + '</p>' +
              '<p style="margin: 8px 0 0; color: #78350f; font-size: 13px;">Cash only. The courier may not carry change for very large notes.</p>' +
            '</div>' +

            '<div style="background-color: #f0fdf4; padding: 18px 20px; border-radius: 12px; border: 1px solid #bbf7d0; margin: 24px 0;">' +
              '<p style="margin: 0 0 4px; color: #166534; font-size: 14px; font-weight: bold;">Estimated delivery</p>' +
              '<p style="margin: 0; color: #166534; font-size: 18px; font-weight: 600;">' + etaRange + '</p>' +
              '<p style="margin: 8px 0 0; color: #166534; font-size: 13px;">A separate tracking email follows once your parcel is dispatched.</p>' +
            '</div>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Order Details</h3>' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<tr><td style="padding: 6px 0; color: #6b5347; width: 160px;">Order ID</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">' + orderId + '</td></tr>' +
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
            '<strong style="color: #8b1a1a;">Rs ' + total + '</strong>' +
            '</li></ul>' +

            '<h3 style="color: #2d1b15; font-size: 17px; margin: 32px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Shipping To</h3>' +
            '<p style="color: #6b5347; font-size: 14px; line-height: 1.7; margin: 0; background:#faf6f0; padding:14px 16px; border-radius:8px; border-left:4px solid #c9a45c;">' +
            '<strong style="color:#2d1b15;">' + customer.firstName + ' ' + customer.lastName + '</strong><br/>' +
            customer.address + '<br/>' +
            (customer.landmark ? customer.landmark + '<br/>' : '') +
            customer.city + ', ' + customer.state + ' ' + customer.pincode + '<br/>' +
            'Phone: ' + customer.phone + '<br/>' +
            'Email: ' + customer.email +
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
          customer.firstName + ' ' + customer.lastName + '<br/>' +
          customer.address + '<br/>' +
          (customer.landmark ? customer.landmark + '<br/>' : '') +
          customer.city + ', ' + customer.state + ' - ' + customer.pincode + '<br/>' +
          'Phone: ' + customer.phone + '<br/>' +
          'Email: ' + customer.email;

        const adminItemsTable = '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
          '<thead><tr><th align="left" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347;">Item</th><th align="center" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347;">Qty</th><th align="right" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347;">Unit</th><th align="right" style="padding:8px 0; border-bottom:1px solid #e8ddd0; color:#6b5347;">Line</th></tr></thead>' +
          '<tbody>' + items.map((i: any) =>
            '<tr><td style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15;">' + i.name + '</td>' +
            '<td align="center" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15;">' + i.qty + '</td>' +
            '<td align="right" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#6b5347;">Rs ' + i.price + '</td>' +
            '<td align="right" style="padding:8px 0; border-bottom:1px dashed #e8ddd0; color:#2d1b15; font-weight:600;">Rs ' + (i.price * i.qty) + '</td></tr>'
          ).join('') + '</tbody></table>';

        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: ['zyberweave@gmail.com', 'annavedahfoods@gmail.com'],
          subject: '🚨 NEW COD ORDER - ' + orderId + ' (Rs ' + total + ' to collect)',
          replyTo: customer.email,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 2px solid #8b1a1a; border-radius: 12px; overflow: hidden;">' +
            '<div style="background-color: #8b1a1a; padding: 24px; text-align: center;">' +
            '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New COD Order Alert 🚨</h1>' +
            '<p style="color: #ffe4e6; font-size: 13px; margin: 6px 0 0;">' + orderId + ' &middot; ' + placedAt + '</p>' +
            '</div>' +
            '<div style="padding: 28px 32px;">' +
              '<div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:14px 16px; margin-bottom:20px;">' +
                '<p style="margin:0; color:#78350f; font-size:13px; font-weight:bold;">⚠️ COD — Rs ' + total + ' to be collected on delivery</p>' +
              '</div>' +

              '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top:0;">Order Details</h3>' +
              '<table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">' +
                '<tr><td style="padding: 6px 0; color: #6b5347; width: 140px;">Order ID:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + orderId + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Payment Method:</td><td style="padding: 6px 0; color: #2d1b15;">Cash on Delivery</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Total to Collect:</td><td style="padding: 6px 0; font-weight: bold; color: #8b1a1a; font-size: 18px;">Rs ' + total + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Placed at:</td><td style="padding: 6px 0; color: #2d1b15;">' + placedAt + '</td></tr>' +
                (shiprocketResponse?.shipment_id ? '<tr><td style="padding: 6px 0; color: #6b5347;">Shiprocket Shipment:</td><td style="padding: 6px 0; color: #2d1b15;">' + shiprocketResponse.shipment_id + '</td></tr>' : '') +
              '</table>' +

              '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Customer</h3>' +
              '<table style="width: 100%; border-collapse: collapse;">' +
                '<tr><td style="padding: 6px 0; color: #6b5347; width: 140px;">Name:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + customer.firstName + ' ' + customer.lastName + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Email:</td><td style="padding: 6px 0;"><a href="mailto:' + customer.email + '" style="color:#8b1a1a;">' + customer.email + '</a></td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Phone:</td><td style="padding: 6px 0;"><a href="tel:' + customer.phone + '" style="color:#8b1a1a;">' + customer.phone + '</a></td></tr>' +
              '</table>' +

              '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Shipping Address</h3>' +
              '<p style="color: #2d1b15; font-size: 14px; line-height: 1.7; margin: 0; background:#faf6f0; padding:14px 16px; border-radius:8px; border-left:4px solid #c9a45c;">' + adminAddressBlock + '</p>' +

              '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Items Ordered (' + itemCount + ' units across ' + items.length + ' SKUs)</h3>' +
              adminItemsTable +

              '<div style="text-align: center; margin-top: 32px;">' +
              '<a href="https://annavedahfoods.com/n7xk2mq9pf" style="display: inline-block; background-color: #2d1b15; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Dashboard</a>' +
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
      },
      { status: shiprocketError ? 202 : 201 },
    )
  } catch (err: unknown) {
    console.error('[shiprocket/create-order]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
