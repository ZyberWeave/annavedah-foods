/**
 * Coerce a value to a positive integer ID. Returns null if invalid so the
 * caller can short-circuit with a 400.
 */
export function toPositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}
