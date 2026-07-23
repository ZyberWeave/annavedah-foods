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
  const msg = `🎉 *ORDER CONFIRMED!*

Hi ${customerName},

Thank you for shopping with us! Your order *#${orderId}* has been successfully confirmed. We are carefully preparing your farm-fresh traditional foods for packaging.

📋 *Order Details*:
${itemsSummary}
Total Amount: *₹${totalAmount}.00*

📊 *Current Progress*:
✅ 🛒 Order Confirmed
⚪ 📦 Quality Check & Packaging
⚪ ✈️ Dispatched & In Transit
⚪ 🚚 Out for Delivery

Regards,
*Team Annavedah Foods* 🌾`;

  return encodeURIComponent(msg);
}

export function buildShipmentDispatchedMessage(shipment: ShipmentDetails): string {
  const trackingUrl = shipment.trackingUrl || `https://annavedah.shiprocket.co/tracking/${shipment.trackingNumber}`;

  const msg = `✈️ *YOUR ORDER IS ON ITS WAY!*

Hi ${shipment.customerName},

Great news! Your order *#${shipment.orderId}* has been shipped and will be delivered to your address soon.

📦 *Shipment Info*:
Courier Partner: *${shipment.courierName || "Shiprocket Express"}*
Tracking Number: *${shipment.trackingNumber}*

🔗 *Live Shipment Tracking Link*:
${trackingUrl}

📊 *Delivery Progress*:
✅ 🛒 Confirmed ── ✅ 📦 Packed ── ✅ ✈️ Shipped ── ⚪ 🚚 Out for Delivery

Thank you for choosing Annavedah Foods!
Regards,
*Team Annavedah Foods* 🌾`;

  return encodeURIComponent(msg);
}

export function dispatchShipmentTrackingWhatsApp(shipment: ShipmentDetails) {
  const encodedMsg = buildShipmentDispatchedMessage(shipment);
  const cleanPhone = shipment.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMsg}`;

  console.log(`[Shipment Engine] Dispatching tracking notification for Order #${shipment.orderId} to +91${cleanPhone}`);
  return whatsappUrl;
}
