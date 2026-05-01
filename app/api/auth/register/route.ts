import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, otps } from '@/lib/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password, otp } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // If no OTP provided, generate one and send it
    if (!otp) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.insert(otps).values({
        email,
        otp: generatedOtp,
        expiresAt,
      });

      try {
        await resend.emails.send({
          from: 'Annavedah Foods <support@annavedahfoods.com>',
          to: email,
          subject: 'Your Annavedah Foods Verification Code',
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 32px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 16px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Verify Your Email</h1>' +
            '</div>' +
            '<div style="padding: 40px 32px; text-align: center;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Please use the secure verification code below to complete your registration. This code expires in 10 minutes.</p>' +
            '<div style="background-color: #faf6f0; padding: 24px; border-radius: 12px; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2d1b15; margin: 32px auto; max-width: 300px; border: 1px dashed #c9a45c;">' +
            generatedOtp +
            '</div>' +
            '<p style="color: #a39189; font-size: 14px; margin-bottom: 0;">If you didn\'t request this code, you can safely ignore this email.</p>' +
            '</div>' +
            '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
            '<p style="color: #e8ddd0; font-size: 12px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
            '</div></div>',
        });
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
      }

      return NextResponse.json({ status: 'pending_otp', email }, { status: 200 });
    }

    // If OTP is provided, verify it
    const validOtp = await db.select().from(otps).where(
      and(
        eq(otps.email, email),
        eq(otps.otp, otp),
        gt(otps.expiresAt, new Date())
      )
    ).limit(1);

    if (validOtp.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    await createSession(newUser.id, newUser.role);

    // Send Welcome Email via Resend
    try {
      await resend.emails.send({
        from: 'Annavedah Foods <support@annavedahfoods.com>',
        to: newUser.email,
        subject: 'Welcome to Annavedah Foods!',
        html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
          '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
          '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
          '<h1 style="color: #8b1a1a; margin: 0; font-size: 32px; letter-spacing: -0.5px;">Welcome to the Family!</h1>' +
          '</div>' +
          '<div style="padding: 40px 32px;">' +
          '<h2 style="color: #2d1b15; font-size: 22px; margin-top: 0;">Hi ' + newUser.name + ',</h2>' +
          '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">We are absolutely thrilled to have you join Annavedah Foods. Our mission is to bring you clean, nutrient-dense traditional foods crafted for daily wellness.</p>' +
          '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Whether you\'re looking for heritage staples or pure organic blends, we promise uncompromising quality in every pack.</p>' +
          '<div style="text-align: center;">' +
          '<a href="https://annavedahfoods.com/products" style="display: inline-block; background-color: #8b1a1a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">Explore Our Collections</a>' +
          '</div></div>' +
          '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
          '<p style="color: #e8ddd0; font-size: 12px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
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
