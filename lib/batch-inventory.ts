import { products as staticProducts, type Product } from "./content";

export type ProductBatch = {
  id: string;
  barcode: string;
  productSlug: string;
  productName: string;
  manufacturedDate: string; // ISO YYYY-MM-DD
  expiryDate: string;       // ISO YYYY-MM-DD
  quantity: number;
  initialQuantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  createdAt: string;
};

export type ExpiryStatus = "VALID" | "NEAR_EXPIRY" | "EXPIRED";

export type ExpiryAnalysis = {
  status: ExpiryStatus;
  daysRemaining: number;
  formattedMfd: string;
  formattedExp: string;
  isBlocked: boolean;
  message: string;
};

const STORAGE_KEY = "annavedah-batches";

const INITIAL_BATCHES: ProductBatch[] = [
  {
    id: "BATCH-AV-202607-001",
    barcode: "8903003003001",
    productSlug: "moringa-powder",
    productName: "Organic Moringa Powder",
    manufacturedDate: "2026-04-10",
    expiryDate: "2027-04-10",
    quantity: 40,
    initialQuantity: 50,
    costPrice: 120,
    sellingPrice: 249,
    supplier: "Annavedah Farm Organics",
    createdAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "BATCH-AV-202607-002",
    barcode: "8903003003002",
    productSlug: "turmeric-powder",
    productName: "Lakadong Turmeric Powder",
    manufacturedDate: "2025-05-01",
    expiryDate: "2026-07-10", // Expired batch demo!
    quantity: 15,
    initialQuantity: 40,
    costPrice: 90,
    sellingPrice: 180,
    supplier: "Annavedah Spices Co",
    createdAt: "2025-05-01T10:00:00Z",
  },
];

export function getBatches(): ProductBatch[] {
  if (typeof window === "undefined") return INITIAL_BATCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_BATCHES;
}

export function saveBatches(batches: ProductBatch[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch {
      // fallback
    }
  }
}

export function addBatch(batchInput: Omit<ProductBatch, "id" | "barcode" | "createdAt">): ProductBatch {
  const batches = getBatches();
  const timestamp = Date.now();
  const randomBarcodeSuffix = Math.floor(10000 + Math.random() * 90000);
  const barcode = `890${timestamp.toString().slice(-8)}${randomBarcodeSuffix.toString().slice(0, 2)}`;
  const id = `BATCH-AV-${new Date().toISOString().slice(0, 7).replace("-", "")}-${(batches.length + 1).toString().padStart(3, "0")}`;

  const newBatch: ProductBatch = {
    ...batchInput,
    id,
    barcode,
    createdAt: new Date().toISOString(),
  };

  saveBatches([newBatch, ...batches]);
  console.log(`[Batch Manager] Added new batch '${id}' for '${batchInput.productSlug}' with Barcode: ${barcode}`);
  return newBatch;
}

export function lookupByBarcode(barcode: string): ProductBatch | undefined {
  const cleanCode = barcode.trim();
  const batches = getBatches();
  return batches.find((b) => b.barcode === cleanCode || b.id === cleanCode);
}

export function analyzeExpiry(expiryDateStr: string, mfdDateStr: string): ExpiryAnalysis {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expiryDateStr);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedExp = dateFormatter.format(expDate);
  const formattedMfd = mfdDateStr ? dateFormatter.format(new Date(mfdDateStr)) : "N/A";

  if (daysRemaining < 0) {
    return {
      status: "EXPIRED",
      daysRemaining,
      formattedMfd,
      formattedExp,
      isBlocked: true,
      message: `🚨 EXPIRED BATCH! Item expired ${Math.abs(daysRemaining)} days ago on ${formattedExp}. DO NOT SHIP OR SELL!`,
    };
  }

  if (daysRemaining <= 15) {
    return {
      status: "NEAR_EXPIRY",
      daysRemaining,
      formattedMfd,
      formattedExp,
      isBlocked: false,
      message: `⚠️ NEAR EXPIRY WARNING: Item expires in ${daysRemaining} days on ${formattedExp}. Prioritize for immediate sale.`,
    };
  }

  return {
    status: "VALID",
    daysRemaining,
    formattedMfd,
    formattedExp,
    isBlocked: false,
    message: `✅ FRESH & VALID: Expires on ${formattedExp} (${daysRemaining} days remaining).`,
  };
}

export function deductBatchStock(barcode: string, qty: number): boolean {
  const batches = getBatches();
  const target = batches.find((b) => b.barcode === barcode || b.id === barcode);
  if (!target) return false;

  const updated = batches.map((b) =>
    b.id === target.id ? { ...b, quantity: Math.max(0, b.quantity - qty) } : b
  );

  saveBatches(updated);
  console.log(`[Batch Stock] Deducted ${qty} units from batch '${target.id}'. Remaining: ${Math.max(0, target.quantity - qty)}`);
  return true;
}
