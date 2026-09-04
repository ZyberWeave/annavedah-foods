import { randomBytes } from 'node:crypto';

import bcrypt from 'bcryptjs';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { createSession } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  getGoogleRedirectUri,
  getSafeRedirect,
  GOOGLE_OAUTH_COOKIE_NAMES,
} from '@/lib/google-oauth';
import { normalizeEmail } from '@/lib/normalize-email';
import { claimGuestOrders } from '@/lib/order-records';
import { users } from '@/lib/schema';

const googleKeys = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
);

function oauthError(request: NextRequest, message: string) {
  const response = NextResponse.redirect(
    new URL(`/login?oauth_error=${encodeURIComponent(message)}`, request.url),
  );
  for (const cookieName of Object.values(GOOGLE_OAUTH_COOKIE_NAMES)) {
    response.cookies.delete(cookieName);
  }
  return response;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return oauthError(request, 'Google sign-in is not configured');
  }

  const providerError = request.nextUrl.searchParams.get('error');
  if (providerError) {
    return oauthError(
      request,
      providerError === 'access_denied' ? 'Google sign-in was cancelled' : 'Google sign-in failed',
    );
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(GOOGLE_OAUTH_COOKIE_NAMES.state)?.value;
  const nonce = request.cookies.get(GOOGLE_OAUTH_COOKIE_NAMES.nonce)?.value;
  const verifier = request.cookies.get(GOOGLE_OAUTH_COOKIE_NAMES.verifier)?.value;
  const redirectAfterLogin = getSafeRedirect(
    request.cookies.get(GOOGLE_OAUTH_COOKIE_NAMES.redirect)?.value,
  );

  if (!code || !state || !expectedState || state !== expectedState || !nonce || !verifier) {
    return oauthError(request, 'Google sign-in session expired. Please try again');
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getGoogleRedirectUri(request.nextUrl.origin),
        grant_type: 'authorization_code',
        code_verifier: verifier,
      }),
      cache: 'no-store',
    });

    if (!tokenResponse.ok) {
      console.error('[google-oauth] token exchange failed', tokenResponse.status);
      return oauthError(request, 'Google sign-in could not be completed. Please try again');
    }

    const tokens = (await tokenResponse.json()) as { id_token?: string };
    if (!tokens.id_token) {
      return oauthError(request, 'Google did not return an identity token');
    }

    const { payload } = await jwtVerify(tokens.id_token, googleKeys, {
      algorithms: ['RS256'],
      audience: clientId,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
    });

    if (
      payload.nonce !== nonce ||
      payload.email_verified !== true ||
      typeof payload.email !== 'string'
    ) {
      return oauthError(request, 'Google could not verify this email address');
    }

    const email = normalizeEmail(payload.email);
    const name =
      typeof payload.name === 'string' && payload.name.trim()
        ? payload.name.trim()
        : email.split('@')[0];
    const avatarUrl = typeof payload.picture === 'string' ? payload.picture : null;

    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let created = false;

    if (!user) {
      // OAuth-only accounts receive an unguessable password hash. They can add a
      // normal password later through the existing verified-email reset flow.
      const password = await bcrypt.hash(randomBytes(48).toString('base64url'), 10);
      const inserted = await db
        .insert(users)
        .values({ name, email, password, avatarUrl })
        .onConflictDoNothing({ target: users.email })
        .returning();
      user = inserted[0];
      created = Boolean(user);

      // Another simultaneous callback may have inserted the same email first.
      if (!user) {
        [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      }
    } else if (!user.avatarUrl && avatarUrl) {
      [user] = await db
        .update(users)
        .set({ avatarUrl })
        .where(eq(users.id, user.id))
        .returning();
    }

    if (!user) {
      throw new Error('Google account could not be persisted');
    }

    await createSession(user.id, user.role);

    if (created) {
      try {
        await claimGuestOrders(user.id, user.email);
      } catch (claimError) {
        console.error('[google-oauth] failed to claim guest orders', claimError);
      }
    }

    const response = NextResponse.redirect(new URL(redirectAfterLogin, request.url));
    for (const cookieName of Object.values(GOOGLE_OAUTH_COOKIE_NAMES)) {
      response.cookies.delete(cookieName);
    }
    return response;
  } catch (error) {
    console.error('[google-oauth] callback failed', error);
    return oauthError(request, 'Google sign-in could not be completed. Please try again');
  }
}

