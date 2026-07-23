export type ShipmentDetails = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl: string;
  itemsSummary: string;
  totalAmount: number;
};

export function buildOrderConfirmedMessage(customerName: string, orderId: string, itemsSummary: string, totalAmount: number): string {
  const msg = `ORDER CONFIRMED

Hi ${customerName},

Thank you for shopping with us. Your order *#${orderId}* has been successfully confirmed. We are preparing your items for packaging.

Order Details:
${itemsSummary}
Total Amount: *INR ${totalAmount}.00*

Current Status: Order Confirmed -> Packaging -> In Transit -> Out for Delivery

Regards,
Team Annavedah Foods`;

  return encodeURIComponent(msg);
}

export function buildShipmentDispatchedMessage(shipment: ShipmentDetails): string {
  const trackingUrl = shipment.trackingUrl || `https://annavedah.shiprocket.co/tracking/${shipment.trackingNumber}`;

  const msg = `SHIPMENT DISPATCH NOTICE

Hi ${shipment.customerName},

Your order *#${shipment.orderId}* has been shipped and is on its way.

Shipment Information:
Courier Partner: *${shipment.courierName || "Shiprocket Express"}*
Tracking Number: *${shipment.trackingNumber}*

Live Tracking Link:
${trackingUrl}

Progress: Confirmed -> Packed -> Dispatched -> Out for Delivery

Regards,
Team Annavedah Foods`;

  return encodeURIComponent(msg);
}

export function dispatchShipmentTrackingWhatsApp(shipment: ShipmentDetails) {
  const encodedMsg = buildShipmentDispatchedMessage(shipment);
  const cleanPhone = shipment.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMsg}`;

  console.log(`[Shipment Engine] Dispatching tracking notification for Order #${shipment.orderId} to +91${cleanPhone}`);
  return whatsappUrl;
}
