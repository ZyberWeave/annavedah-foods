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
    description: '10% off on orders above ₹499 (max ₹200 off)',
    active: true,
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
    return { valid: false, error: 'Invalid coupon code' }
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
