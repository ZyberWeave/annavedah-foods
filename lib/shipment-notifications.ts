import { buildWhatsAppMessage } from "@/lib/whatsapp-automation";

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
  const msg = buildWhatsAppMessage('order_confirmed', {
    customerName,
    orderId,
    productList: itemsSummary,
    orderTotal: totalAmount,
  });

  return encodeURIComponent(msg);
}

export function buildShipmentDispatchedMessage(shipment: ShipmentDetails): string {
  const trackingUrl = shipment.trackingUrl || `https://annavedah.shiprocket.co/tracking/${shipment.trackingNumber}`;

  const msg = buildWhatsAppMessage('order_shipped', {
    customerName: shipment.customerName,
    customerPhone: shipment.customerPhone,
    orderId: shipment.orderId,
    trackingLink: trackingUrl,
    productList: shipment.itemsSummary,
    orderTotal: shipment.totalAmount,
  });

  return encodeURIComponent(msg);
}

export function dispatchShipmentTrackingWhatsApp(shipment: ShipmentDetails) {
  const encodedMsg = buildShipmentDispatchedMessage(shipment);
  const cleanPhone = shipment.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMsg}`;

  console.log(`[Shipment Engine] Dispatching tracking notification for Order #${shipment.orderId} to +91${cleanPhone}`);
  return whatsappUrl;
}
