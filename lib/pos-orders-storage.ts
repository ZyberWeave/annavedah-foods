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
  shiftId: number | null;
  createdAt: string;
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

export type POSShift = {id:number;businessDate:string;status:string;openedBy:string;openedAt:string;openingFloat:number;cashSales:number;upiSales:number;cardSales:number;totalSales:number;orderCount:number;closingCash:number|null;expectedCash:number|null;cashDifference:number|null;closedAt:string|null};

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "POS request failed");
  }
  return body;
}

export async function getPOSOrders(): Promise<POSOrder[]> {
  const body = await readJson(await fetch("/api/admin/pos/orders", { cache: "no-store" }));
  return Array.isArray(body.orders) ? body.orders : [];
}

export async function savePOSOrder(
  order: Pick<POSOrder, "customerName" | "customerPhone" | "paymentMethod" | "items"> & {
    discountPercent?: number;
  },
): Promise<POSOrder> {
  const body = await readJson(await fetch("/api/admin/pos/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(order),
  }));
  window.dispatchEvent(new Event("pos-sale-completed"));
  return body.order as POSOrder;
}
export async function getCurrentPOSShift():Promise<POSShift|null>{const b=await readJson(await fetch("/api/admin/pos/shifts",{cache:"no-store"}));return b.shift||null}
export async function openPOSShift(openingFloat:number):Promise<POSShift>{const b=await readJson(await fetch("/api/admin/pos/shifts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({openingFloat})}));return b.shift}
export async function closePOSShift(closingCash:number,notes=""):Promise<POSShift>{const b=await readJson(await fetch("/api/admin/pos/shifts",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({closingCash,notes})}));return b.shift}
