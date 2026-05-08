/**
 * Reject email values that would let the caller smuggle CR/LF or commas into
 * downstream mail headers. Resend likely sanitizes already, but cheap to be
 * defensive at the boundary.
 */
export function isSafeHeaderValue(value: unknown): value is string {
  return typeof value === 'string' && !/[\r\n,;]/.test(value);
}

export function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DEFAULT_ADMIN_EMAILS = ['zyberweave@gmail.com', 'annavedahfoods@gmail.com'];

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return DEFAULT_ADMIN_EMAILS;
  const parsed = raw.split(',').map((e) => e.trim()).filter(Boolean);
  return parsed.length ? parsed : DEFAULT_ADMIN_EMAILS;
}

export type OrderItemInput = { name: unknown; qty: unknown; price: unknown; slug?: unknown };
export type ValidatedItem = { name: string; qty: number; price: number; slug?: string };

export function validateOrderItems(items: unknown): ValidatedItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }
  return items.map((raw, idx) => {
    const i = raw as OrderItemInput;
    const qty = Number(i?.qty);
    const price = Number(i?.price);
    const name = typeof i?.name === 'string' ? i.name.trim() : '';
    const slug = typeof i?.slug === 'string' ? i.slug.trim() : '';
    if (!name) throw new Error(`items[${idx}].name is required`);
    if (!Number.isInteger(qty) || qty <= 0) throw new Error(`items[${idx}].qty must be a positive integer`);
    if (!Number.isFinite(price) || price < 0) throw new Error(`items[${idx}].price must be a non-negative number`);
    return slug ? { name, qty, price, slug } : { name, qty, price };
  });
}
