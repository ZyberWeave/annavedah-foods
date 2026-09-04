import { createHash, randomBytes } from 'node:crypto';

export const GOOGLE_OAUTH_COOKIE_NAMES = {
  state: 'google_oauth_state',
  nonce: 'google_oauth_nonce',
  verifier: 'google_oauth_verifier',
  redirect: 'google_oauth_redirect',
} as const;

export const GOOGLE_OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 10 * 60,
};

export function createOAuthSecret(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function createCodeChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url');
}

export function getGoogleRedirectUri(origin: string) {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;
}

export function getSafeRedirect(value: string | null | undefined) {
  if (value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) {
    return value;
  }
  return '/dashboard';
}

