import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({ error: 'New password must include an uppercase letter' }, { status: 400 });
    }
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json({ error: 'New password must include a lowercase letter' }, { status: 400 });
    }
    if (!/\d/.test(newPassword)) {
      return NextResponse.json({ error: 'New password must include a number' }, { status: 400 });
    }

    const [user] = await db
      .select({ id: users.id, password: users.password })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedNew, passwordChangedAt: new Date() })
      .where(eq(users.id, session.userId));

    // Note: this invalidates the *current* session too. The caller will
    // need to re-authenticate on the next request. That's deliberate — it's
    // the safest default after a password change.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[change-password]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
