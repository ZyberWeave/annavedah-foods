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

    const requestedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'Unknown device';

    // Send email via Resend
    await resend.emails.send({
      from: 'Annavedah Foods <noreply@annavedahfoods.com>',
      to: email,
      subject: otp + ' is your Annavedah Foods password reset code',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#fff; border:1px solid #e8ddd0; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.04);">
          <div style="background:#faf6f0; padding:32px 20px; text-align:center; border-bottom:2px solid #c9a45c;">
            <img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods" style="height:54px; margin-bottom:14px;" />
            <h1 style="color:#8b1a1a; margin:0; font-size:26px;">Reset Your Password</h1>
            <p style="color:#6b5347; font-size:13px; margin:8px 0 0;">Requested ${requestedAt}</p>
          </div>
          <div style="padding:36px 32px;">
            <p style="color:#2d1b15; font-size:16px; margin:0 0 12px;">Hi ${user.name || 'there'},</p>
            <p style="color:#6b5347; font-size:15px; line-height:1.6;">We received a request to reset the password for the Annavedah Foods account linked to <strong>${email}</strong>. Use the 6-digit code below to continue.</p>

            <div style="background:#faf6f0; border:1px dashed #c9a45c; border-radius:12px; padding:24px; text-align:center; margin:24px 0;">
              <p style="margin:0 0 8px; color:#a39189; font-size:11px; letter-spacing:1px; text-transform:uppercase;">Your reset code</p>
              <div style="font-size:34px; font-weight:800; letter-spacing:8px; color:#8b1a1a;">${otp}</div>
              <p style="margin:10px 0 0; color:#a39189; font-size:12px;">Expires in 15 minutes</p>
            </div>

            <h3 style="color:#2d1b15; font-size:15px; margin:24px 0 8px; border-bottom:1px solid #e8ddd0; padding-bottom:6px;">Request details</h3>
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <tr><td style="padding:5px 0; color:#6b5347; width:120px;">Time</td><td style="padding:5px 0; color:#2d1b15;">${requestedAt}</td></tr>
              <tr><td style="padding:5px 0; color:#6b5347;">IP address</td><td style="padding:5px 0; color:#2d1b15; font-family:monospace;">${ip}</td></tr>
              <tr><td style="padding:5px 0; color:#6b5347; vertical-align:top;">Device</td><td style="padding:5px 0; color:#2d1b15; word-break:break-word;">${userAgent}</td></tr>
            </table>

            <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:14px 16px; margin-top:24px; font-size:13px; color:#991b1b; line-height:1.6;">
              <strong>🔒 Didn't request this?</strong><br/>
              You can safely ignore this email — your password won't change. If you see repeated requests you didn't make, please write to <a href="mailto:support@annavedahfoods.com" style="color:#991b1b;">support@annavedahfoods.com</a> so we can secure your account.
            </div>

            <p style="color:#6b5347; font-size:13px; margin:24px 0 0;">Need help? Reach us at <a href="mailto:support@annavedahfoods.com" style="color:#8b1a1a;">support@annavedahfoods.com</a>.</p>
          </div>
          <div style="background:#2d1b15; padding:18px; text-align:center;">
            <p style="color:#e8ddd0; font-size:12px; margin:0 0 4px;">Annavedah Foods &middot; support@annavedahfoods.com</p>
            <p style="color:#a39189; font-size:11px; margin:0;">© ${new Date().getFullYear()} Annavedah Foods. All rights reserved.</p>
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
