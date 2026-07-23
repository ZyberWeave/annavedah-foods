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
  mfdDate: string; // YYYY-MM-DD
  manufacturedDate?: string;
  expiryDate: string; // YYYY-MM-DD
  barcode: string; // e.g. 8901234567890
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

const BATCH_STORAGE_KEY = "annavedah-product-batches";

const DEFAULT_BATCHES: ProductBatch[] = [
  {
    id: "BATCH-AV-2026-A1",
    batchId: "BATCH-AV-2026-A1",
    productId: "1",
    productName: "Organic Moringa Leaf Powder 250g",
    mfdDate: "2025-07-10",
    manufacturedDate: "2025-07-10",
    expiryDate: "2026-07-10",
    barcode: "8903001001001",
    initialStock: 100,
    initialQuantity: 100,
    currentStock: 50,
    quantity: 50,
    unitPrice: 299,
    sellingPrice: 299,
    costPrice: 150,
    location: "Aisle 1-A",
  },
  {
    id: "BATCH-AV-2026-A2",
    batchId: "BATCH-AV-2026-A2",
    productId: "1",
    productName: "Organic Moringa Leaf Powder 250g",
    mfdDate: "2026-01-10",
    manufacturedDate: "2026-01-10",
    expiryDate: "2027-01-10",
    barcode: "8903001001002",
    initialStock: 150,
    initialQuantity: 150,
    currentStock: 130,
    quantity: 130,
    unitPrice: 299,
    sellingPrice: 299,
    costPrice: 150,
    location: "Aisle 1-B",
  },
];

export function getBatches(): ProductBatch[] {
  if (typeof window === "undefined") return DEFAULT_BATCHES;
  try {
    const raw = localStorage.getItem(BATCH_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(DEFAULT_BATCHES));
      return DEFAULT_BATCHES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BATCHES;
  }
}

export function saveBatches(batches: ProductBatch[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(batches));
    } catch {
      // fallback
    }
  }
}

export function analyzeExpiry(expiryDateStr: string, mfdDateStr?: string): ExpiryAnalysis {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDateStr);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedMfd = mfdDateStr || "N/A";
  const formattedExp = expiryDateStr;

  if (daysRemaining < 0) {
    return {
      status: "EXPIRED",
      isBlocked: true,
      daysRemaining,
      label: `EXPIRED (${Math.abs(daysRemaining)} days ago)`,
      badgeClass: "bg-red-600 text-white font-extrabold animate-pulse",
      message: `Product expired ${Math.abs(daysRemaining)} days ago! Do not sell or ship.`,
      formattedMfd,
      formattedExp,
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: "EXPIRING_SOON",
      isBlocked: false,
      daysRemaining,
      label: `Expiring Soon (${daysRemaining} days left)`,
      badgeClass: "bg-amber-500 text-white font-bold",
      message: `Product expires in ${daysRemaining} days. Recommended for quick clearance.`,
      formattedMfd,
      formattedExp,
    };
  }

  return {
    status: "FRESH",
    isBlocked: false,
    daysRemaining,
    label: `Fresh (${daysRemaining} days left)`,
    badgeClass: "bg-[#8b1a1a] text-white font-bold",
    message: `Fresh batch in good standing. ${daysRemaining} days remaining.`,
    formattedMfd,
    formattedExp,
  };
}

export function getProductBatches(productIdOrName: string): ProductBatch[] {
  const batches = getBatches();
  const term = productIdOrName.toLowerCase().trim();
  return batches.filter(
    (b) =>
      b.productId === productIdOrName ||
      b.productName.toLowerCase().includes(term) ||
      b.batchId.toLowerCase().includes(term) ||
      b.barcode.includes(term)
  );
}

export function getFEFOBatch(productIdOrName: string): ProductBatch | null {
  const productBatches = getProductBatches(productIdOrName);
  const validBatches = productBatches
    .filter((b) => (b.currentStock || b.quantity || 0) > 0 && !analyzeExpiry(b.expiryDate).isBlocked)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  return validBatches[0] || null;
}

export function lookupByBarcode(barcode: string): ProductBatch | null {
  const batches = getBatches();
  return batches.find((b) => b.barcode.trim() === barcode.trim()) || null;
}

export function deductBatchStock(batchId: string, qty: number): boolean {
  const batches = getBatches();
  const target = batches.find((b) => b.batchId === batchId || b.id === batchId);
  if (!target || (target.currentStock ?? target.quantity ?? 0) < qty) return false;

  target.currentStock = (target.currentStock ?? target.quantity ?? 0) - qty;
  target.quantity = target.currentStock;
  saveBatches(batches);
  return true;
}

export function addBatch(newBatch: Partial<ProductBatch> & { productName: string }): ProductBatch {
  const batches = getBatches();
  const id = newBatch.id || newBatch.batchId || "BATCH-" + Date.now().toString(36).toUpperCase();
  const mfd = newBatch.mfdDate || newBatch.manufacturedDate || new Date().toISOString().split("T")[0];
  const exp = newBatch.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0];
  const stock = newBatch.initialStock || newBatch.initialQuantity || newBatch.quantity || 100;
  const price = newBatch.unitPrice || newBatch.sellingPrice || 100;

  const full: ProductBatch = {
    id,
    batchId: id,
    productId: newBatch.productId || "P-" + Date.now().toString(36),
    productName: newBatch.productName,
    productSlug: newBatch.productSlug || "",
    mfdDate: mfd,
    manufacturedDate: mfd,
    expiryDate: exp,
    barcode: newBatch.barcode || Math.floor(1000000000000 + Math.random() * 9000000000000).toString(),
    initialStock: stock,
    initialQuantity: stock,
    currentStock: stock,
    quantity: stock,
    unitPrice: price,
    sellingPrice: price,
    costPrice: newBatch.costPrice || Math.round(price * 0.6),
    supplier: newBatch.supplier || "Default Nursery Wholesaler",
  };

  saveBatches([full, ...batches]);
  return full;
}
