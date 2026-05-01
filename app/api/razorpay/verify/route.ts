import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'

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

    // Payment Verified! Send Confirmation Emails
    if (customer && items && total) {
      const itemsHtml = items.map((i: any) => '<li>' + i.qty + 'x ' + i.name + ' - Rs ' + (i.price * i.qty) + '</li>').join('');
      
      try {
        // 1. Email to Customer
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
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">We have successfully received your payment of <strong>Rs ' + total + '</strong>. Your order <strong>#' + orderId + '</strong> is now being processed.</p>' +
            '<h3 style="color: #2d1b15; font-size: 18px; margin: 32px 0 16px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Order Summary</h3>' +
            '<ul style="list-style: none; padding: 0; margin: 0;">' + orderItemsHtml +
            '<li style="padding: 16px 0 0; display: flex; justify-content: space-between; font-size: 18px;">' +
            '<span style="color: #6b5347;">Total Paid</span>' +
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

        // 2. Email to Admin
        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: ['zyberweave@gmail.com', 'annavedahfoods@gmail.com'],
          subject: '🚨 NEW ORDER RECEIVED - ' + orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #8b1a1a; border-radius: 12px; overflow: hidden;">' +
            '<div style="background-color: #8b1a1a; padding: 24px; text-align: center;">' +
            '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Order Alert 🚨</h1>' +
            '</div>' +
            '<div style="padding: 32px;">' +
            '<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">' +
            '<tr><td style="padding: 8px 0; color: #6b5347; width: 120px;">Order ID:</td><td style="padding: 8px 0; font-weight: bold; color: #2d1b15;">' + orderId + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6b5347;">Total:</td><td style="padding: 8px 0; font-weight: bold; color: #2d1b15;">Rs ' + total + '</td></tr>' +
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
