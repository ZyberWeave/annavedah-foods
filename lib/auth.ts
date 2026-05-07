import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

let cachedKey: Uint8Array | null = null;
function getEncodedKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey || secretKey.length < 32) {
    throw new Error('SESSION_SECRET env var must be set to a value of at least 32 characters');
  }
  cachedKey = new TextEncoder().encode(secretKey);
  return cachedKey;
}

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getEncodedKey());
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: number, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, role, expiresAt });

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

  return { isAuth: true, userId: session.userId as number, role: session.role as string };
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
