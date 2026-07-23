export type PersonalCoupon = {
  code: string;
  discountPercent: number;
  boundEmail: string;
  used: boolean;
  createdAt: string;
};

const STORAGE_KEY = "annavedah-personal-coupons";

export function getPersonalCoupons(): PersonalCoupon[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function savePersonalCoupons(coupons: PersonalCoupon[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    } catch {
      // fallback
    }
  }
}

/**
 * Generates a unique, single-use 5% OFF coupon bound to the user's email/account.
 */
export function generateFirstPurchaseCoupon(email: string): PersonalCoupon {
  const cleanEmail = email.trim().toLowerCase();
  const existing = getPersonalCoupons().find((c) => c.boundEmail === cleanEmail);
  if (existing) return existing;

  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const newCoupon: PersonalCoupon = {
    code: `FIRST5-${randomSuffix}`,
    discountPercent: 5,
    boundEmail: cleanEmail,
    used: false,
    createdAt: new Date().toISOString(),
  };

  const current = getPersonalCoupons();
  savePersonalCoupons([...current, newCoupon]);
  console.log(`[Personal Coupon] Generated 5% OFF code '${newCoupon.code}' for '${cleanEmail}'`);
  return newCoupon;
}

export function validatePersonalCoupon(
  code: string,
  userEmail?: string
): { valid: true; coupon: PersonalCoupon; discountPercent: number } | { valid: false; error: string } {
  const cleanCode = code.trim().toUpperCase();
  const allCoupons = getPersonalCoupons();
  const found = allCoupons.find((c) => c.code === cleanCode);

  if (!found) {
    return { valid: false, error: "Invalid coupon code." };
  }

  if (found.used) {
    return { valid: false, error: "This first-time coupon has already been redeemed." };
  }

  if (userEmail && found.boundEmail !== userEmail.trim().toLowerCase()) {
    return { valid: false, error: "This personalized coupon belongs to another account." };
  }

  return { valid: true, coupon: found, discountPercent: found.discountPercent };
}

export function markPersonalCouponUsed(code: string) {
  const cleanCode = code.trim().toUpperCase();
  const allCoupons = getPersonalCoupons();
  const updated = allCoupons.map((c) =>
    c.code === cleanCode ? { ...c, used: true } : c
  );
  savePersonalCoupons(updated);
}
