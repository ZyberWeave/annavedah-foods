import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, otps } from '@/lib/schema';
import { eq, and, gt, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipBlock = await rateLimitOr429(`reset:ip:${ip}`, 10, 600);
    if (ipBlock) return ipBlock;
    const emailBlock = await rateLimitOr429(`reset:email:${String(email).toLowerCase()}`, 5, 600);
    if (emailBlock) return emailBlock;

    // OTPs are stored hashed (bcrypt). Pull all unexpired OTPs for the email
    // and bcrypt-compare in JS — there's at most a small handful per email
    // because the flow deletes them on success.
    const candidates = await db
      .select()
      .from(otps)
      .where(and(eq(otps.email, email), gt(otps.expiresAt, new Date())))
      .orderBy(desc(otps.createdAt))
      .limit(5);

    let validOtp: typeof candidates[number] | null = null;
    for (const row of candidates) {
      // Backward compat: legacy plaintext rows (no $2 prefix).
      const isHashed = row.otp.startsWith('$2');
      const matches = isHashed ? await bcrypt.compare(String(otp), row.otp) : row.otp === String(otp);
      if (matches) { validOtp = row; break; }
    }

    if (!validOtp) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, email));

    // Delete used OTP (and any other OTPs for this email)
    await db.delete(otps).where(eq(otps.email, email));

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
