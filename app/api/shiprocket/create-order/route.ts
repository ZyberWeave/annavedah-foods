import { NextRequest, NextResponse } from 'next/server'
import { createShiprocketOrder, type ShiprocketOrderPayload } from '@/lib/shiprocket'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { orders, abandonedCarts, users } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, paymentId, customer, items, total, paymentMethod = 'Prepaid' } = body

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

    const shiprocketResponse = await createShiprocketOrder(payload)

    if (paymentMethod === 'COD') {
      try {
        // Find user by email to link order
        const userRecords = await db.select().from(users).where(eq(users.email, customer.email)).limit(1)
        const userId = userRecords.length > 0 ? userRecords[0].id : null

        // Save Order
        await db.insert(orders).values({
          orderId,
          paymentId: paymentId || 'COD',
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
        console.error('Failed to save COD order or update abandoned cart:', dbErr)
      }

      const itemsHtml = items.map((i: any) => '<li>' + i.qty + 'x ' + i.name + ' - Rs ' + (i.price * i.qty) + '</li>').join('');
      
      try {
        const orderItemsHtml = items.map((i: any) =>
          '<li style="padding: 12px 0; border-bottom: 1px dashed #e8ddd0; display: flex; justify-content: space-between; color: #6b5347;">' +
          '<span>' + i.qty + 'x ' + i.name + '</span>' +
          '<strong style="color: #2d1b15;">Rs ' + (i.price * i.qty) + '</strong>' +
          '</li>'
        ).join('');

        await resend.emails.send({
          from: 'Annavedah Foods <support@annavedahfoods.com>',
          to: customer.email,
          subject: 'Order Confirmation - ' + orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Thank You for Your Order!</h1>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + customer.firstName + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">We have successfully received your COD order. Your order <strong>#' + orderId + '</strong> is now being processed. You will pay <strong>Rs ' + total + '</strong> upon delivery.</p>' +
            '<h3 style="color: #2d1b15; font-size: 18px; margin: 32px 0 16px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Order Summary</h3>' +
            '<ul style="list-style: none; padding: 0; margin: 0;">' + orderItemsHtml +
            '<li style="padding: 16px 0 0; display: flex; justify-content: space-between; font-size: 18px;">' +
            '<span style="color: #6b5347;">Total (COD)</span>' +
            '<strong style="color: #8b1a1a;">Rs ' + total + '</strong>' +
            '</li></ul>' +
            '<h3 style="color: #2d1b15; font-size: 18px; margin: 32px 0 16px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Shipping Details</h3>' +
            '<p style="color: #6b5347; font-size: 14px; line-height: 1.6; margin: 0;">' +
            customer.firstName + ' ' + customer.lastName + '<br/>' +
            customer.address + '<br/>' +
            customer.city + ', ' + customer.state + ' ' + customer.pincode + '<br/>' +
            customer.phone + '</p>' +
            '</div>' +
            '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
            '<p style="color: #e8ddd0; font-size: 12px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
            '</div></div>',
        });

        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: ['zyberweave@gmail.com', 'annavedahfoods@gmail.com'],
          subject: '🚨 NEW COD ORDER RECEIVED - ' + orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #8b1a1a; border-radius: 12px; overflow: hidden;">' +
            '<div style="background-color: #8b1a1a; padding: 24px; text-align: center;">' +
            '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New COD Order Alert 🚨</h1>' +
            '</div>' +
            '<div style="padding: 32px;">' +
            '<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">' +
            '<tr><td style="padding: 8px 0; color: #6b5347; width: 120px;">Order ID:</td><td style="padding: 8px 0; font-weight: bold; color: #2d1b15;">' + orderId + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6b5347;">Total (COD):</td><td style="padding: 8px 0; font-weight: bold; color: #2d1b15;">Rs ' + total + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6b5347;">Customer:</td><td style="padding: 8px 0; font-weight: bold; color: #2d1b15;">' + customer.firstName + ' ' + customer.lastName + ' (' + customer.email + ')</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6b5347;">Phone:</td><td style="padding: 8px 0; font-weight: bold; color: #2d1b15;">' + customer.phone + '</td></tr>' +
            '</table>' +
            '<h3 style="color: #8b1a1a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Items Ordered:</h3>' +
            '<ul style="color: #2d1b15; line-height: 1.6;">' + itemsHtml + '</ul>' +
            '<div style="text-align: center; margin-top: 32px;">' +
            '<a href="https://annavedahfoods.com/admin" style="display: inline-block; background-color: #2d1b15; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Dashboard</a>' +
            '</div></div></div>',
        });
      } catch (emailErr) {
        console.error('Failed to send COD purchase emails:', emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        shipment_id: shiprocketResponse.shipment_id,
        order_id: shiprocketResponse.order_id,
        payment_id: paymentId,
      },
      { status: 201 },
    )
  } catch (err: unknown) {
    console.error('[shiprocket/create-order]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
