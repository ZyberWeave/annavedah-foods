import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Stricter cap on the admin endpoint.
    const ip = getClientIp(req);
    const ipBlock = await rateLimitOr429(`admin-login:ip:${ip}`, 5, 300);
    if (ipBlock) return ipBlock;
    const emailBlock = await rateLimitOr429(`admin-login:email:${String(email).toLowerCase()}`, 5, 900);
    if (emailBlock) return emailBlock;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // Reject *before* issuing a session if the account isn't an admin. This
    // closes the leak where the shared /api/auth/login would set a cookie
    // for any valid user even when they tried to log in via the admin page.
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(user.id, user.role);

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
