export interface Coupon {
  code: string
  type: 'percentage' | 'flat'
  value: number // percentage (e.g., 10 = 10%) or flat amount in ₹
  minOrder: number // minimum cart total required
  maxDiscount?: number // cap on discount for percentage coupons
  description: string
  expiresAt?: Date
  usageLimit?: number // max total uses (not per-user for now)
  active: boolean
  firstOrderOnly?: boolean // if true, only valid when the user has no prior successful orders
}

// ─── Preset Coupons ────────────────────────────────────────────────────────────
// Add, edit, or remove coupons here. In the future, these could come from a DB.
export const coupons: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 499,
    maxDiscount: 200,
    description: '10% off on orders above ₹499 (max ₹200 off) — first order only',
    active: true,
    firstOrderOnly: true,
  },
  {
    code: 'FLAT50',
    type: 'flat',
    value: 50,
    minOrder: 299,
    description: '₹50 off on orders above ₹299',
    active: true,
  },
  {
    code: 'SUPER15',
    type: 'percentage',
    value: 15,
    minOrder: 999,
    maxDiscount: 500,
    description: '15% off on orders above ₹999 (max ₹500 off)',
    active: true,
  },
  {
    code: 'ANNAVEDAH100',
    type: 'flat',
    value: 100,
    minOrder: 799,
    description: '₹100 off on orders above ₹799',
    active: true,
  },
]

export function validateCoupon(
  code: string,
  cartTotal: number
): { valid: true; coupon: Coupon; discount: number } | { valid: false; error: string } {
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase()
  )

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" }
  }

  if (!coupon.active) {
    return { valid: false, error: 'This coupon is no longer active' }
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return { valid: false, error: 'This coupon has expired' }
  }

  if (cartTotal < coupon.minOrder) {
    return {
      valid: false,
      error: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
    }
  }

  let discount = 0
  if (coupon.type === 'percentage') {
    discount = Math.round((cartTotal * coupon.value) / 100)
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount)
    }
  } else {
    discount = coupon.value
  }

  // Never let discount exceed cart total
  discount = Math.min(discount, cartTotal)

  return { valid: true, coupon, discount }
}

/**
 * User-aware coupon validation. Same as `validateCoupon` plus a DB lookup that
 * enforces `firstOrderOnly` coupons against the orders table. Pass
 * `userId: null` for guest carts — those simply can't redeem first-order
 * coupons (since we have no way to know if they've ordered before).
 */
export async function validateCouponForUser(
  code: string,
  cartTotal: number,
  userId: number | null,
): Promise<{ valid: true; coupon: Coupon; discount: number } | { valid: false; error: string }> {
  const baseResult = validateCoupon(code, cartTotal)
  if (!baseResult.valid) return baseResult

  if (baseResult.coupon.firstOrderOnly) {
    if (!userId) {
      return { valid: false, error: 'Sign in to redeem this first-order coupon' }
    }
    // Lazy-import to keep this module usable in the browser bundle when only
    // the synchronous `validateCoupon` is needed.
    const { db } = await import('./db')
    const { orders } = await import('./schema')
    const { and, eq, inArray } = await import('drizzle-orm')
    const { PAID_ORDER_STATUSES } = await import('./order-status')
    // "First order" = no prior paid order in any fulfillment state. A
    // delivered customer has obviously placed an order and shouldn't be
    // re-eligible for a first-order coupon just because admin advanced the
    // fulfillment status past 'success'.
    const prior = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        inArray(orders.status, [...PAID_ORDER_STATUSES]),
      ))
      .limit(1)
    if (prior.length > 0) {
      return { valid: false, error: 'This coupon is valid only on your first order' }
    }
  }

  return baseResult
}
