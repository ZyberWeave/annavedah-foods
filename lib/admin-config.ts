/**
 * Admin route configuration.
 *
 * The slug is low-value obfuscation, NOT security. Real protection is the
 * role check in middleware + per-route requireAdmin() guards.
 *
 * IMPORTANT — the slug cannot be rotated by env var alone. To actually change
 * the admin URL you must:
 *   1. Rename the directory `app/n7xk2mq9pf/` to the new slug.
 *   2. Update the matcher in middleware.ts (Next.js requires a string literal).
 *   3. Optionally set NEXT_PUBLIC_ADMIN_SLUG so links/redirects in app code
 *      pick up the new value too.
 *
 * Until those three are aligned, NEXT_PUBLIC_ADMIN_SLUG only changes link
 * targets — it does not move the actual route or its auth gate.
 */

export const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || 'n7xk2mq9pf';
export const ADMIN_BASE_PATH = `/${ADMIN_SLUG}`;
