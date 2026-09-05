import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    avatarUrl: users.avatarUrl,
    phone: users.phone,
    savedAddress: users.savedAddress,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, session.userId)).limit(1);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
