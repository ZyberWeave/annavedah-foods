import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'super-secret-key-please-change-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/admin');
  const isAdminRoute = path.startsWith('/admin');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('session')?.value;
  
  if (!cookie) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ['HS256'],
    });

    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
