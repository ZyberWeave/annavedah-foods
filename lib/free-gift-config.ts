import { products as staticProducts, type Product } from "./content";

export type FreeGiftConfig = {
  enabled: boolean;
  thresholdPrice: number;
  giftProductSlug: string;
  customMessage: string;
};

const DEFAULT_CONFIG: FreeGiftConfig = {
  enabled: true,
  thresholdPrice: 899,
  giftProductSlug: "moringa-powder",
  customMessage: "Free Organic Moringa Powder on orders above ₹899!",
};

const STORAGE_KEY = "annavedah-free-gift-config";

export function getFreeGiftConfig(): FreeGiftConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_CONFIG;
}

export function saveFreeGiftConfig(config: Partial<FreeGiftConfig>): FreeGiftConfig {
  const current = getFreeGiftConfig();
  const updated = { ...current, ...config };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // quota fallback
    }
  }
  return updated;
}

export function getFreeGiftProduct(config: FreeGiftConfig): Product | undefined {
  if (!config.enabled || !config.giftProductSlug) return undefined;
  return staticProducts.find((p) => p.slug === config.giftProductSlug);
}
