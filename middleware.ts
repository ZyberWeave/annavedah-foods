import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || 'n7xk2mq9pf';

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

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith(`/${ADMIN_SLUG}`);
  const isAdminRoute = path.startsWith(`/${ADMIN_SLUG}`);
  const isAdminLogin = path === `/${ADMIN_SLUG}/login`;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (isAdminLogin) {
    const cookie = req.cookies.get('session')?.value;
    if (cookie) {
      try {
        const { payload } = await jwtVerify(cookie, getEncodedKey(), {
          algorithms: ['HS256'],
        });
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL(`/${ADMIN_SLUG}`, req.nextUrl));
        }
      } catch {
        // Invalid token, allow login page
      }
    }
    return NextResponse.next();
  }

  const cookie = req.cookies.get('session')?.value;

  if (!cookie) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL(`/${ADMIN_SLUG}/login`, req.nextUrl));
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  try {
    const { payload } = await jwtVerify(cookie, getEncodedKey(), {
      algorithms: ['HS256'],
    });

    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return NextResponse.next();
  } catch (error) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL(`/${ADMIN_SLUG}/login`, req.nextUrl));
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/n7xk2mq9pf/:path*'],
};
