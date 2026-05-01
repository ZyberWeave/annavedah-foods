import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { refundRequests, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const session = await verifySession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const orderId = formData.get('orderId') as string;
    const reason = formData.get('reason') as string;
    const file = formData.get('image') as File | null;

    if (!orderId || !reason) {
      return NextResponse.json({ error: 'Order ID and Reason are required' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      const blob = await put('refunds/' + Date.now() + '-' + file.name, file, {
        access: 'public',
      });
      imageUrl = blob.url;
    }

    const [newRefund] = await db.insert(refundRequests).values({
      userId: session.userId,
      orderId,
      reason,
      imageUrl,
    }).returning();

    // Look up user email for notifications
    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (user && user.email) {
      try {
        // 1. Email to User
        await resend.emails.send({
          from: 'Annavedah Support <support@annavedahfoods.com>',
          to: user.email,
          subject: 'Refund Request Received - Order ' + orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Refund Request Received</h1>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + user.name + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">We have successfully received your refund request for Order <strong>#' + orderId + '</strong>.</p>' +
            '<div style="background-color: #faf6f0; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e8ddd0;">' +
            '<p style="color: #2d1b15; font-size: 14px; margin: 0; font-weight: bold;">Reason for Refund:</p>' +
            '<p style="color: #6b5347; font-size: 15px; margin: 8px 0 0; font-style: italic;">"' + reason + '"</p>' +
            '</div>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">Our team is reviewing the details and will update you on the status shortly. We appreciate your patience.</p>' +
            '</div>' +
            '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
            '<p style="color: #e8ddd0; font-size: 12px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
            '</div></div>',
        });

        // 2. Email to Admin
        const attachmentHtml = imageUrl
          ? '<div style="margin-top: 24px;"><a href="' + imageUrl + '" style="display: inline-block; background-color: #e8ddd0; color: #2d1b15; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">📷 View Attachment</a></div>'
          : '';

        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: ['zyberweave@gmail.com', 'annavedahfoods@gmail.com'],
          subject: '⚠️ ACTION REQUIRED: New Refund Request - ' + orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #d97706; border-radius: 12px; overflow: hidden;">' +
            '<div style="background-color: #d97706; padding: 24px; text-align: center;">' +
            '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Refund Request ⚠️</h1>' +
            '</div>' +
            '<div style="padding: 32px;">' +
            '<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">' +
            '<tr><td style="padding: 8px 0; color: #6b5347; width: 120px;">Order ID:</td><td style="padding: 8px 0; font-weight: bold; color: #2d1b15;">' + orderId + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #6b5347;">Customer:</td><td style="padding: 8px 0; font-weight: bold; color: #2d1b15;">' + user.name + ' (' + user.email + ')</td></tr>' +
            '</table>' +
            '<h3 style="color: #d97706; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Reason:</h3>' +
            '<p style="color: #2d1b15; line-height: 1.6; background-color: #fffbeb; padding: 16px; border-radius: 8px;">' + reason + '</p>' +
            attachmentHtml +
            '<div style="text-align: center; margin-top: 32px;">' +
            '<a href="https://annavedahfoods.com/admin" style="display: inline-block; background-color: #2d1b15; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review in Dashboard</a>' +
            '</div></div></div>',
        });
      } catch (emailErr) {
        console.error('Failed to send refund request emails:', emailErr);
      }
    }

    return NextResponse.json({ success: true, refund: newRefund });
  } catch (error) {
    console.error('Refund request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
