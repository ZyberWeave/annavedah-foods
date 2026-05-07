let cachedKey: Uint8Array | null = null;

export function getSessionSecretKey(): Uint8Array {
  if (cachedKey) return cachedKey;

  const secretKey = process.env.SESSION_SECRET;
  const isValidSecret = typeof secretKey === 'string' && secretKey.length >= 32;

  if (isValidSecret) {
    cachedKey = new TextEncoder().encode(secretKey);
    return cachedKey;
  }

  // Keep local development unblocked, but never allow weak/missing secret in production.
  if (process.env.NODE_ENV !== 'production') {
    cachedKey = new TextEncoder().encode('dev-session-secret-change-this-before-production-2026');
    return cachedKey;
  }

  throw new Error(
    'SESSION_SECRET env var must be set to a value of at least 32 characters in production'
  );
}
