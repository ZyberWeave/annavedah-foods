export type CODOrderDetails = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  totalAmount: number;
  status: "AWAITING_COD_CONFIRMATION" | "CONFIRMED_ACCEPTED" | "CANCELLED_BY_CUSTOMER";
  createdAt: string;
};

const STORAGE_KEY = "annavedah-cod-orders";

export function getCODOrders(): CODOrderDetails[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveCODOrders(orders: CODOrderDetails[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // fallback
    }
  }
}

/**
 * Formats the exact WhatsApp COD Confirmation Message matching the reference design.
 */
export function buildWhatsAppCODMessage(order: CODOrderDetails, siteUrl: string): string {
  const confirmUrl = `${siteUrl}/cod-confirm?id=${order.orderId}&action=confirm`;
  const cancelUrl = `${siteUrl}/cod-confirm?id=${order.orderId}&action=cancel`;

  const msg = `Hi ${order.customerName}!

Thank you for shopping with us. We are glad you love our range of products!

We have successfully received your order, with ID:
*${order.orderId}*.

Since you have placed your order with (Cash on Delivery) COD option, we need confirmation from you before we process your order and ship it.

*${order.itemsSummary}*
Your Order total is *INR ${order.totalAmount}.00*

Click on the links below to confirm or cancel your order:
✅ *Confirm Order*: ${confirmUrl}
❌ *Cancel Order*: ${cancelUrl}`;

  return encodeURIComponent(msg);
}

/**
 * Triggers automated WhatsApp message dispatch for COD order.
 */
export function dispatchAutomatedCODConfirmation(order: CODOrderDetails) {
  const existing = getCODOrders();
  saveCODOrders([order, ...existing.filter((o) => o.orderId !== order.orderId)]);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://annavedah.com";
  const encodedMsg = buildWhatsAppCODMessage(order, siteUrl);
  const cleanPhone = order.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMsg}`;

  console.log(`[Automated COD Engine] Dispatching WhatsApp confirmation for Order #${order.orderId} to +91${cleanPhone}`);
  
  return whatsappUrl;
}

export function updateCODOrderStatus(orderId: string, action: "confirm" | "cancel"): boolean {
  const orders = getCODOrders();
  const target = orders.find((o) => o.orderId === orderId);
  if (!target) return false;

  const newStatus: CODOrderDetails["status"] = action === "confirm" ? "CONFIRMED_ACCEPTED" : "CANCELLED_BY_CUSTOMER";
  const updated = orders.map((o) =>
    o.orderId === orderId ? { ...o, status: newStatus } : o
  );

  saveCODOrders(updated);
  console.log(`[Automated COD Engine] Order #${orderId} automatically updated to '${newStatus}'!`);
  return true;
}
