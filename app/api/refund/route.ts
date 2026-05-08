import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { refundRequests, users, orders } from '@/lib/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { Resend } from 'resend';
import { escapeHtml, getAdminEmails, isSafeHeaderValue } from '@/lib/email-utils';
import { rateLimitOr429 } from '@/lib/rate-limit';
import { userOwnsOrder } from '@/lib/order-records';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const session = await verifySession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const block = await rateLimitOr429(`refund:user:${session.userId}`, 5, 600);
  if (block) return block;

  try {
    const formData = await req.formData();
    const orderId = formData.get('orderId') as string;
    const reason = formData.get('reason') as string;
    const file = formData.get('image') as File | null;

    if (!orderId || !reason) {
      return NextResponse.json({ error: 'Order ID and Reason are required' }, { status: 400 });
    }
    if (typeof reason !== 'string' || reason.trim().length < 10 || reason.length > 2000) {
      return NextResponse.json({ error: 'Reason must be 10–2000 characters' }, { status: 400 });
    }

    // Ownership check BEFORE the blob upload — prevents storage-cost abuse via
    // unauthorized refund attempts on someone else's order.
    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (!userOwnsOrder(order, { userId: session.userId }, user?.email ?? null)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Only allow refund requests against orders that actually completed.
    // 'success' is set by Razorpay verify and the Shiprocket-COD path; admin
    // fulfillment transitions (processing/shipped/delivered) also count as
    // paid. 'pending' and 'cancelled' orders are not refundable.
    const refundableStatuses = ['success', 'processing', 'shipped', 'delivered'];
    if (!refundableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: 'This order is not eligible for a refund.' },
        { status: 400 },
      );
    }

    // One open refund per order. Reject if there's already a pending or
    // approved request for this order.
    const openRefunds = await db
      .select({ id: refundRequests.id, status: refundRequests.status })
      .from(refundRequests)
      .where(and(
        eq(refundRequests.orderId, orderId),
        inArray(refundRequests.status, ['pending', 'approved']),
      ))
      .limit(1);
    if (openRefunds.length > 0) {
      return NextResponse.json(
        { error: 'A refund request for this order is already in progress.' },
        { status: 409 },
      );
    }

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 });
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return NextResponse.json({ error: 'Image must be JPEG, PNG, or WebP' }, { status: 400 });
      }
      // Strip path separators / control chars from the filename, prepend a
      // UUID so concurrent uploads can't collide, and clamp the length.
      const safeName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
      const blob = await put('refunds/' + crypto.randomUUID() + '-' + safeName, file, {
        access: 'public',
      });
      imageUrl = blob.url;
    }

    let newRefund: typeof refundRequests.$inferSelect | null = null;
    try {
      const inserted = await db.insert(refundRequests).values({
        userId: session.userId,
        orderId,
        reason,
        imageUrl,
      }).returning();
      newRefund = inserted[0] ?? null;
    } catch (insertErr: any) {
      // Partial unique index `refund_requests_open_per_order_idx` enforces
      // "one pending/approved refund per order" at the DB layer. Translate
      // the race-condition collision into the same 409 the application
      // check returns above.
      const msg = String(insertErr?.message ?? '');
      if (msg.includes('refund_requests_open_per_order_idx') || insertErr?.code === '23505') {
        return NextResponse.json(
          { error: 'A refund request for this order is already in progress.' },
          { status: 409 },
        );
      }
      throw insertErr;
    }
    if (!newRefund) {
      return NextResponse.json({ error: 'Could not create refund request' }, { status: 500 });
    }

    let orderItems: Array<{ name: string; qty: number; price: number }> = [];
    if (order?.items) {
      try { orderItems = JSON.parse(order.items); } catch { orderItems = []; }
    }
    const orderTotal = order?.total ?? null;
    const orderPaymentId = order?.paymentId ?? null;
    const orderPlacedAt = order?.createdAt
      ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
      : 'Not available';
    const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    const refundIdStr = newRefund?.id ? '#RR-' + newRefund.id : 'pending';

    const safeReason = escapeHtml(reason);
    const safeOrderId = escapeHtml(orderId);
    const safeUserName = user ? escapeHtml(user.name) : '';

    const itemsRowsHtml = orderItems.length
      ? orderItems.map((i) =>
          '<tr>' +
            '<td style="padding: 10px 0; border-bottom: 1px dashed #e8ddd0; color: #2d1b15;">' + i.qty + 'x ' + escapeHtml(i.name) + '</td>' +
            '<td style="padding: 10px 0; border-bottom: 1px dashed #e8ddd0; color: #6b5347; text-align: right;">Rs ' + (i.price * i.qty) + '</td>' +
          '</tr>'
        ).join('')
      : '<tr><td colspan="2" style="padding: 10px 0; color: #a39189; font-style: italic;">Original order line items unavailable.</td></tr>';

    if (user && user.email) {
      try {
        // 1. Email to User — receipt of refund submission with timeline + summary
        await resend.emails.send({
          from: 'Annavedah Support <support@annavedahfoods.com>',
          to: user.email,
          subject: 'We\'ve received your refund request (' + refundIdStr + ') for Order ' + orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: #8b1a1a; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Refund Request Received</h1>' +
            '<p style="color: #6b5347; font-size: 13px; margin: 8px 0 0;">Reference ' + refundIdStr + ' &middot; ' + submittedAt + '</p>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + safeUserName + '</strong>,</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">Thank you for letting us know. We\'ve logged your refund request for Order <strong>#' + safeOrderId + '</strong> and our customer-care team is on it.</p>' +
            '<h3 style="color: #2d1b15; font-size: 16px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Request Summary</h3>' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<tr><td style="padding: 6px 0; color: #6b5347; width: 160px;">Refund Reference</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">' + refundIdStr + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Order ID</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">' + safeOrderId + '</td></tr>' +
              (orderTotal !== null ? '<tr><td style="padding: 6px 0; color: #6b5347;">Order Total</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">Rs ' + orderTotal + '</td></tr>' : '') +
              (orderPlacedAt !== 'Not available' ? '<tr><td style="padding: 6px 0; color: #6b5347;">Order Placed</td><td style="padding: 6px 0; color: #2d1b15;">' + orderPlacedAt + '</td></tr>' : '') +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Submitted</td><td style="padding: 6px 0; color: #2d1b15;">' + submittedAt + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Photo Evidence</td><td style="padding: 6px 0; color: #2d1b15;">' + (imageUrl ? 'Attached ✓' : 'Not provided') + '</td></tr>' +
            '</table>' +
            '<div style="background-color: #faf6f0; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e8ddd0;">' +
              '<p style="color: #2d1b15; font-size: 14px; margin: 0; font-weight: bold;">Your reason</p>' +
              '<p style="color: #6b5347; font-size: 15px; margin: 8px 0 0; font-style: italic; line-height: 1.6;">"' + safeReason + '"</p>' +
            '</div>' +
            (orderItems.length ? '<h3 style="color: #2d1b15; font-size: 16px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Items in this Order</h3>' +
              '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' + itemsRowsHtml + '</table>' : '') +
            '<h3 style="color: #2d1b15; font-size: 16px; margin: 32px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">What Happens Next</h3>' +
            '<ol style="color: #6b5347; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">' +
              '<li><strong>Within 24 hours</strong> — our team reviews your request and any photos provided.</li>' +
              '<li><strong>1–2 business days</strong> — you\'ll receive a decision email (approved / rejected) with reasoning.</li>' +
              '<li><strong>5–7 business days</strong> — if approved, the refund is credited back to your original payment method.</li>' +
            '</ol>' +
            '<p style="color: #6b5347; font-size: 14px; line-height: 1.6; margin-top: 24px;">If you have anything else to add (more photos, an updated reason, urgency), simply reply to this email and quote reference <strong>' + refundIdStr + '</strong>.</p>' +
            '<p style="color: #6b5347; font-size: 14px; line-height: 1.6;">Need help sooner? Reach us at <a href="mailto:support@annavedahfoods.com" style="color: #8b1a1a;">support@annavedahfoods.com</a>.</p>' +
            '</div>' +
            '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
            '<p style="color: #e8ddd0; font-size: 12px; margin: 0 0 4px;">Annavedah Foods &middot; support@annavedahfoods.com</p>' +
            '<p style="color: #a39189; font-size: 11px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
            '</div></div>',
        });

        // 2. Email to Admin — full operational context
        const attachmentBlock = imageUrl
          ? '<div style="margin-top: 20px; padding: 16px; background:#fffbeb; border:1px solid #fde68a; border-radius: 8px;">' +
              '<p style="margin:0 0 10px; color:#78350f; font-size: 13px; font-weight: 600;">Customer Attachment</p>' +
              '<a href="' + imageUrl + '" style="display: inline-block;"><img src="' + imageUrl + '" alt="Refund evidence" style="max-width:100%; max-height:280px; border-radius: 8px; border: 1px solid #fde68a;" /></a>' +
              '<div style="margin-top:10px;"><a href="' + imageUrl + '" style="display: inline-block; background-color: #2d1b15; color: #ffffff; padding: 8px 14px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">Open full-size attachment</a></div>' +
            '</div>'
          : '<p style="margin: 16px 0 0; color: #a39189; font-size: 13px; font-style: italic;">No photo evidence was attached by the customer.</p>';

        const adminItemsRows = orderItems.length
          ? orderItems.map((i) =>
              '<tr>' +
                '<td style="padding: 8px 0; border-bottom: 1px dashed #e8ddd0; color: #2d1b15;">' + i.qty + ' &times; ' + escapeHtml(i.name) + '</td>' +
                '<td style="padding: 8px 0; border-bottom: 1px dashed #e8ddd0; color: #6b5347; text-align: right;">Rs ' + (i.price * i.qty) + '</td>' +
              '</tr>'
            ).join('')
          : '<tr><td colspan="2" style="padding: 8px 0; color:#a39189; font-style: italic;">Order not found in DB — manual lookup needed.</td></tr>';

        await resend.emails.send({
          from: 'Annavedah System <support@annavedahfoods.com>',
          to: getAdminEmails(),
          subject: '⚠️ ACTION REQUIRED: Refund Request ' + refundIdStr + ' on Order ' + orderId,
          ...(isSafeHeaderValue(user.email) ? { replyTo: user.email } : {}),
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 2px solid #d97706; border-radius: 12px; overflow: hidden;">' +
            '<div style="background-color: #d97706; padding: 24px; text-align: center;">' +
            '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Refund Request ⚠️</h1>' +
            '<p style="color: #fff7ed; font-size: 13px; margin: 6px 0 0;">' + refundIdStr + ' &middot; submitted ' + submittedAt + '</p>' +
            '</div>' +
            '<div style="padding: 28px 32px;">' +
              '<h3 style="color: #d97706; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top:0;">Refund Details</h3>' +
              '<table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">' +
                '<tr><td style="padding: 6px 0; color: #6b5347; width: 160px;">Refund Reference:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + refundIdStr + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Order ID:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + safeOrderId + '</td></tr>' +
                (orderPaymentId ? '<tr><td style="padding: 6px 0; color: #6b5347;">Payment ID:</td><td style="padding: 6px 0; color: #2d1b15;">' + escapeHtml(orderPaymentId) + '</td></tr>' : '') +
                (orderTotal !== null ? '<tr><td style="padding: 6px 0; color: #6b5347;">Order Total:</td><td style="padding: 6px 0; color: #8b1a1a; font-weight: bold; font-size: 16px;">Rs ' + orderTotal + '</td></tr>' : '<tr><td style="padding: 6px 0; color: #6b5347;">Order Total:</td><td style="padding: 6px 0; color: #a39189; font-style: italic;">Order not found in DB</td></tr>') +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Order Placed:</td><td style="padding: 6px 0; color: #2d1b15;">' + orderPlacedAt + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Submitted:</td><td style="padding: 6px 0; color: #2d1b15;">' + submittedAt + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Status:</td><td style="padding: 6px 0; color: #d97706; font-weight: bold;">PENDING REVIEW</td></tr>' +
              '</table>' +

              '<h3 style="color: #d97706; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Customer</h3>' +
              '<table style="width: 100%; border-collapse: collapse;">' +
                '<tr><td style="padding: 6px 0; color: #6b5347; width: 160px;">Name:</td><td style="padding: 6px 0; font-weight: bold; color: #2d1b15;">' + safeUserName + '</td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Email:</td><td style="padding: 6px 0; color: #2d1b15;"><a href="mailto:' + encodeURIComponent(user.email) + '" style="color: #8b1a1a;">' + escapeHtml(user.email) + '</a></td></tr>' +
                '<tr><td style="padding: 6px 0; color: #6b5347;">Account ID:</td><td style="padding: 6px 0; color: #2d1b15;">#' + user.id + '</td></tr>' +
              '</table>' +

              '<h3 style="color: #d97706; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Reason Provided</h3>' +
              '<p style="color: #2d1b15; line-height: 1.6; background-color: #fffbeb; padding: 16px; border-radius: 8px; border-left: 4px solid #d97706; margin: 0;">' + safeReason + '</p>' +

              '<h3 style="color: #d97706; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Original Order Items</h3>' +
              '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' + adminItemsRows + '</table>' +

              '<h3 style="color: #d97706; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 24px;">Evidence</h3>' +
              attachmentBlock +

              '<div style="text-align: center; margin-top: 32px; display:flex; gap:12px; justify-content:center;">' +
              '<a href="https://annavedahfoods.com/' + (process.env.NEXT_PUBLIC_ADMIN_SLUG || 'n7xk2mq9pf') + '" style="display: inline-block; background-color: #2d1b15; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review in Dashboard</a>' +
              '<a href="mailto:' + encodeURIComponent(user.email) + '?subject=Re%3A%20Refund%20' + encodeURIComponent(refundIdStr) + '%20%E2%80%94%20Order%20' + encodeURIComponent(orderId) + '" style="display: inline-block; background-color: #ffffff; color: #2d1b15; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; border: 1px solid #2d1b15; margin-left:8px;">Reply to Customer</a>' +
              '</div>' +
            '</div></div>',
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
