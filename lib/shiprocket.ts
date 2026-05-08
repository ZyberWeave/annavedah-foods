import axios from 'axios'

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external'

let cachedToken: string | null = null
let tokenExpiry: number = 0

/** Authenticate and return a Shiprocket bearer token (cached for ~9 days) */
export async function getShiprocketToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const { data } = await axios.post(`${SHIPROCKET_BASE}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  })

  cachedToken = data.token as string
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000 // 9 days
  return cachedToken
}

export interface ShiprocketOrderPayload {
  order_id: string
  order_date: string // "YYYY-MM-DD HH:MM"
  pickup_location: string
  billing_customer_name: string
  billing_last_name: string
  billing_address: string
  billing_city: string
  billing_pincode: string
  billing_state: string
  billing_country: string
  billing_email: string
  billing_phone: string
  shipping_is_billing: boolean
  order_items: {
    name: string
    sku: string
    units: number
    selling_price: number
    discount?: number
    tax?: number
    hsn?: number
  }[]
  payment_method: 'Prepaid' | 'COD'
  sub_total: number
  length: number
  breadth: number
  height: number
  weight: number
}

export async function createShiprocketOrder(payload: ShiprocketOrderPayload) {
  const token = await getShiprocketToken()
  const { data } = await axios.post(`${SHIPROCKET_BASE}/orders/create/adhoc`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function generateAWB(shipmentId: number) {
  const token = await getShiprocketToken()
  const { data } = await axios.post(
    `${SHIPROCKET_BASE}/courier/assign/awb`,
    { shipment_id: shipmentId },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data
}

export async function trackShipment(orderId: string) {
  const token = await getShiprocketToken()
  const { data } = await axios.get(
    `${SHIPROCKET_BASE}/orders/show/${orderId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data
}

export async function checkServiceability(
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  cod: 0 | 1 = 0,
) {
  const token = await getShiprocketToken()
  const { data } = await axios.get(`${SHIPROCKET_BASE}/courier/serviceability/`, {
    params: {
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight,
      cod,
    },
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}
