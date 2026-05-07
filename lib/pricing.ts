import { getProductBySlug } from './products';
import { validateCoupon } from './coupons';

export type CartLineInput = { slug: unknown; packSize?: unknown; qty: unknown };

export type PricedItem = {
  slug: string;
  name: string;
  packSize: string | null;
  qty: number;
  price: number;
};

export type PricingResult = {
  items: PricedItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  codCharge: number;
  total: number;
};

const COD_CHARGE = 99;

/**
 * Server-authoritative pricing. Takes a thin cart shape ({slug, packSize, qty})
 * and computes everything from the products table — clients cannot influence
 * line prices, line totals, the order total, or the discount amount.
 */
export async function priceCart(
  rawCart: unknown,
  opts: { couponCode?: string | null; paymentMethod?: 'Prepaid' | 'COD' } = {},
): Promise<PricingResult> {
  if (!Array.isArray(rawCart) || rawCart.length === 0) {
    throw new Error('cart must be a non-empty array');
  }
  if (rawCart.length > 50) {
    throw new Error('cart has too many lines');
  }

  const items: PricedItem[] = [];
  for (const [idx, raw] of rawCart.entries()) {
    const line = raw as CartLineInput;
    const slug = typeof line?.slug === 'string' ? line.slug.trim() : '';
    const packSize = typeof line?.packSize === 'string' ? line.packSize.trim() : '';
    const qty = Number(line?.qty);

    if (!slug) throw new Error(`cart[${idx}].slug is required`);
    if (!Number.isInteger(qty) || qty <= 0 || qty > 100) {
      throw new Error(`cart[${idx}].qty must be an integer between 1 and 100`);
    }

    const product = await getProductBySlug(slug);
    if (!product) throw new Error(`cart[${idx}]: unknown product "${slug}"`);

    let price: number;
    let resolvedPackSize: string | null = null;
    let displayName = product.name;

    if (product.packPrices && product.packPrices.length > 0) {
      // Pack-priced product: client must specify a packSize that exists.
      const pack = packSize
        ? product.packPrices.find((p) => p.size === packSize)
        : product.packPrices[0];
      if (!pack) {
        throw new Error(`cart[${idx}]: unknown pack size "${packSize}" for ${slug}`);
      }
      price = pack.price;
      resolvedPackSize = pack.size;
      displayName = `${product.name} (${pack.size})`;
    } else {
      price = product.price;
    }

    items.push({ slug, name: displayName, packSize: resolvedPackSize, qty, price });
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  let discount = 0;
  let appliedCode: string | null = null;
  const couponCode = typeof opts.couponCode === 'string' ? opts.couponCode.trim() : '';
  if (couponCode) {
    const result = validateCoupon(couponCode, subtotal);
    if (!result.valid) throw new Error(result.error);
    discount = result.discount;
    appliedCode = result.coupon.code;
  }

  const codCharge = opts.paymentMethod === 'COD' ? COD_CHARGE : 0;
  const total = Math.max(0, subtotal - discount + codCharge);

  return { items, subtotal, discount, couponCode: appliedCode, codCharge, total };
}
