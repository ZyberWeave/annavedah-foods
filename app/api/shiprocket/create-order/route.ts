import { NextRequest, NextResponse } from 'next/server'
import { createShiprocketOrder, type ShiprocketOrderPayload } from '@/lib/shiprocket'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, paymentId, customer, items, total } = body

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
      payment_method: 'Prepaid',
      sub_total: total,
      length: 15,
      breadth: 10,
      height: 10,
      weight: 0.5,
    }

    const shiprocketResponse = await createShiprocketOrder(payload)

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
