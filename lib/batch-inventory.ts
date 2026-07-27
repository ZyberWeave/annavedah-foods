export type ExpiryAnalysis = {
  status: "FRESH" | "EXPIRING_SOON" | "NEAR_EXPIRY" | "EXPIRED";
  isBlocked: boolean;
  daysRemaining: number;
  label: string;
  badgeClass: string;
  message?: string;
  formattedMfd?: string;
  formattedExp?: string;
};

export type ProductBatch = {
  id?: string;
  batchId: string;
  productId: string;
  productName: string;
  productSlug?: string;
  mfdDate: string;
  manufacturedDate?: string;
  expiryDate: string;
  barcode: string;
  initialStock: number;
  initialQuantity?: number;
  currentStock: number;
  quantity?: number;
  unitPrice: number;
  sellingPrice?: number;
  costPrice?: number;
  location?: string;
  supplier?: string;
};

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Inventory request failed");
  return body;
}

export async function getBatches(): Promise<ProductBatch[]> {
  const body = await readJson(await fetch("/api/admin/pos/batches", { cache: "no-store" }));
  return Array.isArray(body.batches) ? body.batches : [];
}

export function analyzeExpiry(expiryDateStr: string, mfdDateStr?: string): ExpiryAnalysis {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(`${expiryDateStr}T00:00:00`);
  const daysRemaining = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
  const base = { daysRemaining, formattedMfd: mfdDateStr || "N/A", formattedExp: expiryDateStr };
  if (daysRemaining < 0) return {
    ...base, status: "EXPIRED", isBlocked: true,
    label: `EXPIRED (${Math.abs(daysRemaining)} days ago)`,
    badgeClass: "bg-red-600 text-white font-extrabold animate-pulse",
    message: `Product expired ${Math.abs(daysRemaining)} days ago! Do not sell or ship.`,
  };
  if (daysRemaining <= 30) return {
    ...base, status: "EXPIRING_SOON", isBlocked: false,
    label: `Expiring Soon (${daysRemaining} days left)`,
    badgeClass: "bg-amber-500 text-white font-bold",
    message: `Product expires in ${daysRemaining} days. Recommended for quick clearance.`,
  };
  return {
    ...base, status: "FRESH", isBlocked: false,
    label: `Fresh (${daysRemaining} days left)`,
    badgeClass: "bg-emerald-600 text-white font-bold",
    message: `Fresh batch in good standing. ${daysRemaining} days remaining.`,
  };
}

export async function getProductBatches(termValue: string): Promise<ProductBatch[]> {
  const batches = await getBatches();
  const term = termValue.toLowerCase().trim();
  return batches.filter((b) =>
    b.productId === termValue ||
    b.productName.toLowerCase().includes(term) ||
    b.batchId.toLowerCase().includes(term) ||
    b.barcode.includes(term));
}

export async function getFEFOBatch(term: string): Promise<ProductBatch | null> {
  const batches = await getProductBatches(term);
  return batches
    .filter((b) => b.currentStock > 0 && !analyzeExpiry(b.expiryDate).isBlocked)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0] || null;
}

export async function lookupByBarcode(barcode: string): Promise<ProductBatch | null> {
  const batches = await getBatches();
  return batches.find((b) => b.barcode.trim() === barcode.trim() || b.batchId === barcode.trim()) || null;
}

export async function addBatch(batch: Partial<ProductBatch> & { productName: string }): Promise<ProductBatch> {
  const body = await readJson(await fetch("/api/admin/pos/batches", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(batch),
  }));
  return body.batch as ProductBatch;
}
