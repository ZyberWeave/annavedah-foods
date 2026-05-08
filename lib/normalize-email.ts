/**
 * Canonical email form for storage and lookup. Lowercases and trims so
 * `User@x.com` and `user@x.com  ` collapse to the same row.
 *
 * Returns an empty string for non-strings; callers should validate non-empty
 * separately if the field is required.
 */
export function normalizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().toLowerCase();
}
