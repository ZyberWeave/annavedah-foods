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

import { buildWhatsAppMessage } from "@/lib/whatsapp-automation";

export function buildWhatsAppCODMessage(order: CODOrderDetails, siteUrl: string): string {
  const msg = buildWhatsAppMessage('cod_order_confirmation', {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderId: order.orderId,
    productList: order.itemsSummary,
    orderTotal: order.totalAmount,
    websiteLink: siteUrl,
  }, siteUrl);

  return encodeURIComponent(msg);
}

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
  return true;
}
