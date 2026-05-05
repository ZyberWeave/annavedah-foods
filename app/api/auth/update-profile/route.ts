import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    // Check if email is already taken by another user
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser && existingUser.id !== session.userId) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
    }

    await db
      .update(users)
      .set({ name: name.trim(), email: email.trim() })
      .where(eq(users.id, session.userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[update-profile]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
