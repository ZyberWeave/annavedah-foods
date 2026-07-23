export type POSCartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  batchId: string;
  mfdDate: string;
  expiryDate: string;
  barcode: string;
};

export type POSOrder = {
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  subtotal: number;
  gstAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: "CASH" | "UPI" | "CARD";
  items: POSCartItem[];
};

const STORAGE_KEY = "annavedah-pos-orders-history";

const INITIAL_POS_ORDERS: POSOrder[] = [
  {
    invoiceNo: "INV-AV-594530",
    date: new Date(Date.now() - 3600000).toLocaleString("en-IN"),
    customerName: "Walk-in Customer",
    customerPhone: "9876543210",
    subtotal: 299,
    gstAmount: 15,
    discountAmount: 0,
    total: 314,
    paymentMethod: "UPI",
    items: [
      {
        productId: "p1",
        name: "Organic Moringa Leaf Powder 250g",
        price: 299,
        qty: 1,
        batchId: "BATCH-AV-2026-A2",
        mfdDate: "2026-01-10",
        expiryDate: "2027-01-10",
        barcode: "8901234567890",
      },
    ],
  },
  {
    invoiceNo: "INV-AV-482910",
    date: new Date(Date.now() - 7200000).toLocaleString("en-IN"),
    customerName: "Rohan Sharma",
    customerPhone: "9123456789",
    subtotal: 899,
    gstAmount: 45,
    discountAmount: 45,
    total: 899,
    paymentMethod: "CASH",
    items: [
      {
        productId: "p2",
        name: "Superfood Wellness Gift Box",
        price: 899,
        qty: 1,
        batchId: "BATCH-AV-2026-B1",
        mfdDate: "2026-05-01",
        expiryDate: "2027-05-01",
        barcode: "8909876543210",
      },
    ],
  },
];

export function getPOSOrders(): POSOrder[] {
  if (typeof window === "undefined") return INITIAL_POS_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POS_ORDERS));
      return INITIAL_POS_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_POS_ORDERS;
  }
}

export function savePOSOrder(order: POSOrder): POSOrder[] {
  const existing = getPOSOrders();
  const updated = [order, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save POS order", e);
    }
  }
  return updated;
}
