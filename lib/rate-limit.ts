import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from './db';
import { rateLimits } from './schema';

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  limit: number;
  retryAfterSeconds: number;
};

/**
 * Fixed-window rate limiter backed by Postgres. One INSERT ... ON CONFLICT per
 * request — fine for low/medium traffic auth and payment endpoints.
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });

  const count = row?.count ?? 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStart.getTime() + windowMs - now) / 1000));

  return { allowed: count <= limit, count, limit, retryAfterSeconds };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

/**
 * Convenience wrapper: enforce a limit and return a 429 response if over.
 * Caller passes the bucket key and limits. Returns null if allowed.
 */
export async function rateLimitOr429(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<NextResponse | null> {
  let result: RateLimitResult;
  try {
    result = await enforceRateLimit(key, limit, windowSeconds);
  } catch (err) {
    // Fail-open: if the limiter itself errors, don't block legitimate traffic.
    console.error('[rate-limit] error', err);
    return null;
  }
  if (result.allowed) return null;
  return NextResponse.json(
    { error: 'Too many requests. Please try again shortly.', retryAfterSeconds: result.retryAfterSeconds },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSeconds) } },
  );
}
