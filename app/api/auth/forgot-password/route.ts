import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, otps } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      // Don't reveal whether the email exists — always return success
      return NextResponse.json({ message: 'If that email exists, a reset code has been sent.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in database
    await db.insert(otps).values({
      email,
      otp,
      expiresAt,
    });

    // Send email via Resend
    await resend.emails.send({
      from: 'Annavedah Foods <noreply@annavedahfoods.com>',
      to: email,
      subject: 'Password Reset Code — Annavedah Foods',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b1a1a; font-size: 24px; margin: 0;">Annavedah Foods</h1>
            <p style="color: #6b5347; font-size: 14px; margin-top: 4px;">Password Reset</p>
          </div>
          <div style="background: #faf6f0; border: 1px solid #e8ddd0; border-radius: 16px; padding: 30px; text-align: center;">
            <p style="color: #2d1b15; font-size: 16px; margin: 0 0 20px;">Your verification code is:</p>
            <div style="background: white; border: 2px solid #c9a45c; border-radius: 12px; padding: 20px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8b1a1a;">${otp}</span>
            </div>
            <p style="color: #6b5347; font-size: 13px; margin-top: 20px;">This code expires in 15 minutes.</p>
            <p style="color: #6b5347; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
