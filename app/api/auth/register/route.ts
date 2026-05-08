import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, otps } from '@/lib/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { Resend } from 'resend';
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/email-utils';
import { claimGuestOrders } from '@/lib/order-records';
import { normalizeEmail } from '@/lib/normalize-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email: rawEmail, password, otp } = await req.json();
    const email = normalizeEmail(rawEmail);

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipBlock = await rateLimitOr429(`register:ip:${ip}`, 5, 600);
    if (ipBlock) return ipBlock;
    const emailBlock = await rateLimitOr429(`register:email:${email}`, 3, 600);
    if (emailBlock) return emailBlock;

    // Server-side validation
    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: 'Password must include an uppercase letter' }, { status: 400 });
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ error: 'Password must include a lowercase letter' }, { status: 400 });
    }
    if (!/\d/.test(password)) {
      return NextResponse.json({ error: 'Password must include a number' }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // If no OTP provided, generate one and send it
    if (!otp) {
      // crypto-strong 6-digit OTP — Math.random() is not suitable for auth secrets.
      const { randomInt } = await import('node:crypto');
      const generatedOtp = randomInt(100000, 1000000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.insert(otps).values({
        email,
        otp: await bcrypt.hash(generatedOtp, 10),
        expiresAt,
      });

      try {
        await resend.emails.send({
          from: 'Annavedah Foods <support@annavedahfoods.com>',
          to: email,
          subject: generatedOtp + ' is your Annavedah Foods verification code',
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 32px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 16px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Verify Your Email</h1>' +
            '<p style="color: #6b5347; font-size: 13px; margin: 8px 0 0;">Final step to activate your account</p>' +
            '</div>' +
            '<div style="padding: 40px 32px; text-align: center;">' +
            '<p style="color: #2d1b15; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + escapeHtml(name) + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 15px; line-height: 1.6;">Welcome to Annavedah Foods! Enter the 6-digit code below on the verification screen to finish creating your account.</p>' +
            '<div style="background-color: #faf6f0; padding: 28px 20px; border-radius: 12px; margin: 28px auto; max-width: 320px; border: 1px dashed #c9a45c;">' +
              '<p style="margin:0 0 8px; color:#a39189; font-size:11px; letter-spacing:1px; text-transform:uppercase;">Your verification code</p>' +
              '<div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2d1b15;">' + generatedOtp + '</div>' +
              '<p style="margin:10px 0 0; color:#a39189; font-size:12px;">Expires in 10 minutes</p>' +
            '</div>' +
            '<div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:14px 16px; text-align:left; font-size:13px; color:#78350f; line-height:1.6;">' +
              '<strong>🔒 Security tips</strong><br/>' +
              '• Annavedah Foods will never ask you for this code over phone, chat, or email.<br/>' +
              '• Codes are valid for one use only and expire in 10 minutes.<br/>' +
              '• If you didn\'t start signing up, ignore this email — your address won\'t be used.' +
            '</div>' +
            '<p style="color: #6b5347; font-size: 13px; margin: 24px 0 0;">Need help? Reply to this email or write to <a href="mailto:support@annavedahfoods.com" style="color:#8b1a1a;">support@annavedahfoods.com</a>.</p>' +
            '</div>' +
            '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
            '<p style="color: #e8ddd0; font-size: 12px; margin: 0 0 4px;">Annavedah Foods &middot; support@annavedahfoods.com</p>' +
            '<p style="color: #a39189; font-size: 11px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
            '</div></div>',
        });
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
      }

      return NextResponse.json({ status: 'pending_otp', email }, { status: 200 });
    }

    // If OTP is provided, verify it (OTPs are stored hashed; legacy plaintext rows tolerated).
    const candidates = await db.select().from(otps).where(
      and(eq(otps.email, email), gt(otps.expiresAt, new Date()))
    ).limit(5);

    let otpOk = false;
    for (const row of candidates) {
      const isHashed = row.otp.startsWith('$2');
      const matches = isHashed ? await bcrypt.compare(String(otp), row.otp) : row.otp === String(otp);
      if (matches) { otpOk = true; break; }
    }
    if (!otpOk) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name: name.trim(),
      email,
      password: hashedPassword,
    }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    await createSession(newUser.id, newUser.role);

    // Stamp any pre-existing guest orders (userId IS NULL) for this email
    // with the new account id, so they show up in the dashboard.
    try {
      await claimGuestOrders(newUser.id, newUser.email);
    } catch (claimErr) {
      console.error('Failed to claim guest orders:', claimErr);
    }

    // Send Welcome Email via Resend
    try {
      await resend.emails.send({
        from: 'Annavedah Foods <support@annavedahfoods.com>',
        to: newUser.email,
        subject: 'Welcome to Annavedah Foods, ' + newUser.name.split(' ')[0] + '! 🌾',
        html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
          '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
          '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
          '<h1 style="color: #8b1a1a; margin: 0; font-size: 32px; letter-spacing: -0.5px;">Welcome to the Family!</h1>' +
          '<p style="color:#6b5347; font-size:14px; margin:10px 0 0;">Account created on ' + new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) + '</p>' +
          '</div>' +
          '<div style="padding: 40px 32px;">' +
          '<h2 style="color: #2d1b15; font-size: 22px; margin-top: 0;">Hi ' + escapeHtml(newUser.name) + ',</h2>' +
          '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">We\'re thrilled to have you with us. Annavedah Foods exists to bring you clean, nutrient-dense, traditionally-crafted foods — sourced directly from heritage farms and packed with zero shortcuts.</p>' +

          '<h3 style="color:#2d1b15; font-size:17px; margin:28px 0 12px; border-bottom:1px solid #e8ddd0; padding-bottom:6px;">Your account</h3>' +
          '<table style="width:100%; border-collapse:collapse; font-size:14px;">' +
            '<tr><td style="padding:6px 0; color:#6b5347; width:140px;">Name</td><td style="padding:6px 0; color:#2d1b15; font-weight:600;">' + escapeHtml(newUser.name) + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#6b5347;">Email</td><td style="padding:6px 0; color:#2d1b15;">' + escapeHtml(newUser.email) + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#6b5347;">Dashboard</td><td style="padding:6px 0;"><a href="https://annavedahfoods.com/dashboard" style="color:#8b1a1a;">annavedahfoods.com/dashboard</a></td></tr>' +
          '</table>' +

          '<h3 style="color:#2d1b15; font-size:17px; margin:28px 0 12px; border-bottom:1px solid #e8ddd0; padding-bottom:6px;">A few things you can do now</h3>' +
          '<ul style="color:#6b5347; font-size:14px; line-height:1.9; padding-left:20px; margin:0;">' +
            '<li>🛍️ <a href="https://annavedahfoods.com/products" style="color:#8b1a1a;">Browse all products</a> — staples, blends, and seasonal specials.</li>' +
            '<li>📦 Track every order and download invoices from your dashboard.</li>' +
            '<li>↩️ File a refund or replacement request with photo evidence in a single click.</li>' +
            '<li>💌 Save delivery addresses for faster future checkouts.</li>' +
          '</ul>' +

          '<div style="background:#faf6f0; border:1px solid #e8ddd0; border-radius:12px; padding:18px 20px; margin:28px 0;">' +
            '<p style="margin:0 0 6px; color:#2d1b15; font-size:14px; font-weight:bold;">Our quality promise</p>' +
            '<p style="margin:0; color:#6b5347; font-size:13px; line-height:1.7;">Every pack is small-batch, no preservatives, no artificial colours. If anything ever falls short, we make it right — no questions asked.</p>' +
          '</div>' +

          '<div style="text-align: center; margin-top:8px;">' +
          '<a href="https://annavedahfoods.com/products" style="display: inline-block; background-color: #8b1a1a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">Explore Our Collections</a>' +
          '</div>' +

          '<p style="color:#6b5347; font-size:13px; line-height:1.6; margin-top:32px; text-align:center;">Questions? Just reply to this email or write to <a href="mailto:support@annavedahfoods.com" style="color:#8b1a1a;">support@annavedahfoods.com</a>.</p>' +
          '</div>' +
          '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
          '<p style="color: #e8ddd0; font-size: 12px; margin: 0 0 4px;">Annavedah Foods &middot; support@annavedahfoods.com</p>' +
          '<p style="color: #a39189; font-size: 11px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
          '</div></div>',
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
