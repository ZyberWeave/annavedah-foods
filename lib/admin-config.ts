/**
 * Admin route configuration.
 * Slug is treated as low-value obfuscation, not security. Real protection is
 * the role check in middleware + per-route requireAdmin().
 *
 * Set NEXT_PUBLIC_ADMIN_SLUG in env to rotate. The middleware matcher reads
 * the same env var at build time.
 */

export const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || 'n7xk2mq9pf';
export const ADMIN_BASE_PATH = `/${ADMIN_SLUG}`;
