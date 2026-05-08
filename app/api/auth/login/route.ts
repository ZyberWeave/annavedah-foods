import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/normalize-email';

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password } = await req.json();
    const email = normalizeEmail(rawEmail);

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipBlock = await rateLimitOr429(`login:ip:${ip}`, 10, 60);
    if (ipBlock) return ipBlock;
    const emailBlock = await rateLimitOr429(`login:email:${email}`, 5, 60);
    if (emailBlock) return emailBlock;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(user.id, user.role);

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
