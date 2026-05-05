import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { refundRequests, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    const resolvedParams = await params;
    const refundId = parseInt(resolvedParams.id);

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const [updatedRefund] = await db.update(refundRequests)
      .set({ status })
      .where(eq(refundRequests.id, refundId))
      .returning();

    if (!updatedRefund) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }

    // Look up user email to send notification
    const [user] = await db.select().from(users).where(eq(users.id, updatedRefund.userId)).limit(1);

    if (user && user.email) {
      const statusText = status === 'approved' 
        ? 'has been approved and will be processed shortly' 
        : 'was rejected';
      
      const headerBg = status === 'approved' ? '#f0fdf4' : '#fef2f2';
      const headerBorder = status === 'approved' ? '#22c55e' : '#ef4444';
      const headerColor = status === 'approved' ? '#166534' : '#991b1b';
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      const approvedExtra = status === 'approved'
        ? '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; background-color: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 24px 0;"><strong>What\'s Next?</strong><br/>The funds will be credited to your original payment method within 5-7 business days.</p>'
        : '';

      try {
        await resend.emails.send({
          from: 'Annavedah Support <support@annavedahfoods.com>',
          to: user.email,
          subject: 'Refund ' + status.toUpperCase() + ' - Order ' + updatedRefund.orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: ' + headerBg + '; padding: 40px 20px; text-align: center; border-bottom: 2px solid ' + headerBorder + ';">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: ' + headerColor + '; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Refund ' + statusLabel + '</h1>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + user.name + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">Your refund request for Order <strong>#' + updatedRefund.orderId + '</strong> ' + statusText + '.</p>' +
            approvedExtra +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">Thank you for shopping with Annavedah Foods. If you have any questions, feel free to reply to this email.</p>' +
            '</div>' +
            '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
            '<p style="color: #e8ddd0; font-size: 12px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
            '</div></div>',
        });
      } catch (emailErr) {
        console.error('Failed to send refund update email:', emailErr);
      }
    }

    return NextResponse.json({ success: true, refund: updatedRefund });
  } catch (error) {
    console.error('Update refund error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
