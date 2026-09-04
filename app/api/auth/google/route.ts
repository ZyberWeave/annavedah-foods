import { NextRequest, NextResponse } from 'next/server';

import {
  createCodeChallenge,
  createOAuthSecret,
  getGoogleRedirectUri,
  getSafeRedirect,
  GOOGLE_OAUTH_COOKIE_NAMES,
  GOOGLE_OAUTH_COOKIE_OPTIONS,
} from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL('/login?oauth_error=Google%20sign-in%20is%20not%20configured', request.url),
    );
  }

  const state = createOAuthSecret();
  const nonce = createOAuthSecret();
  const verifier = createOAuthSecret(48);
  const redirectAfterLogin = getSafeRedirect(request.nextUrl.searchParams.get('redirect'));

  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorizationUrl.searchParams.set('client_id', clientId);
  authorizationUrl.searchParams.set('redirect_uri', getGoogleRedirectUri(request.nextUrl.origin));
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid email profile');
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('nonce', nonce);
  authorizationUrl.searchParams.set('code_challenge', createCodeChallenge(verifier));
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');
  authorizationUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(GOOGLE_OAUTH_COOKIE_NAMES.state, state, GOOGLE_OAUTH_COOKIE_OPTIONS);
  response.cookies.set(GOOGLE_OAUTH_COOKIE_NAMES.nonce, nonce, GOOGLE_OAUTH_COOKIE_OPTIONS);
  response.cookies.set(GOOGLE_OAUTH_COOKIE_NAMES.verifier, verifier, GOOGLE_OAUTH_COOKIE_OPTIONS);
  response.cookies.set(
    GOOGLE_OAUTH_COOKIE_NAMES.redirect,
    redirectAfterLogin,
    GOOGLE_OAUTH_COOKIE_OPTIONS,
  );
  return response;
}
