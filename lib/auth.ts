import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getSessionSecretKey } from './session-secret';
import { db } from './db';
import { users } from './schema';

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSessionSecretKey());
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, getSessionSecretKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: number, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Pin the session to the current passwordChangedAt stamp on the user row.
  // verifySession() compares this against the latest DB value, so any
  // password reset / change invalidates every previously issued cookie.
  const [u] = await db
    .select({ pwc: users.passwordChangedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const pwc = u?.pwc ? new Date(u.pwc).getTime() : 0;

  const session = await encrypt({ userId, role, expiresAt, pwc });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    // strict for admin to harden against CSRF; lax for users (needed for OAuth-style top-level navs)
    sameSite: role === 'admin' ? 'strict' : 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  const userId = session.userId as number;
  const tokenPwc = typeof session.pwc === 'number' ? session.pwc : 0;

  // Cross-check the password-change stamp against the current DB value.
  // If the user has since changed their password (or the row is missing),
  // the cookie is stale and the request is rejected.
  try {
    const [u] = await db
      .select({ pwc: users.passwordChangedAt, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!u) return null;
    const dbPwc = u.pwc ? new Date(u.pwc).getTime() : 0;
    // Allow a 1s skew so that newly-issued tokens with the freshest stamp
    // aren't rejected by sub-second clock drift between processes.
    if (dbPwc - tokenPwc > 1000) return null;
    // Pull role from the DB so a server-side role change (e.g. admin → user)
    // takes effect immediately rather than waiting for the cookie to expire.
    return { isAuth: true, userId, role: u.role };
  } catch (err) {
    console.error('[verifySession] db lookup failed', err);
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function requireAdmin() {
  const session = await verifySession();
  if (!session || session.role !== 'admin') {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, response: null };
}

/**
 * Bump the user's password-change stamp. Call from any flow that mutates
 * the password (change-password, reset-password). After this runs, all
 * previously issued JWTs for this user are rejected by verifySession.
 */
export async function bumpPasswordChangedAt(userId: number) {
  await db
    .update(users)
    .set({ passwordChangedAt: new Date() })
    .where(eq(users.id, userId));
}
