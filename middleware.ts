import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'super-secret-key-please-change-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

// Obfuscated admin route prefix — no "admin" keyword
const ADMIN_SLUG = 'n7xk2mq9pf';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith(`/${ADMIN_SLUG}`);
  const isAdminRoute = path.startsWith(`/${ADMIN_SLUG}`);
  const isAdminLogin = path === `/${ADMIN_SLUG}/login`;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Allow the admin login page to be accessed without auth
  if (isAdminLogin) {
    const cookie = req.cookies.get('session')?.value;
    if (cookie) {
      try {
        const { payload } = await jwtVerify(cookie, encodedKey, {
          algorithms: ['HS256'],
        });
        // If already authenticated as admin, redirect to dashboard
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
      // Redirect to the separate admin login
      return NextResponse.redirect(new URL(`/${ADMIN_SLUG}/login`, req.nextUrl));
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ['HS256'],
    });

    if (isAdminRoute && payload.role !== 'admin') {
      // Non-admin users get a 404-like experience (redirect to dashboard)
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    if (isAdminRoute) {
      return NextResponse.redirect(new URL(`/${ADMIN_SLUG}/login`, req.nextUrl));
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/n7xk2mq9pf/:path*'],
};
