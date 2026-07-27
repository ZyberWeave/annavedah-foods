import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { refundRequests, users, orders } from '@/lib/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { Resend } from 'resend';
import { getRazorpay } from '@/lib/razorpay';
import { toPositiveInt } from '@/lib/validate-id';
import { restoreInventoryForRefundOnce, type OrderItem } from '@/lib/inventory';

const resend = new Resend(process.env.RESEND_API_KEY);

async function restoreRefundInventory(refundId: number, orderId: string): Promise<boolean> {
  try {
    const [ord] = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
    if (!ord?.items) return false;
    const parsedItems: OrderItem[] = JSON.parse(ord.items);
    const restored = await restoreInventoryForRefundOnce(refundId, parsedItems);
    return restored.success;
  } catch (error) {
    console.error('[Refund Stock Restoration] Error restoring inventory:', error);
    return false;
  }
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { status } = await req.json();
    const resolvedParams = await params;
    const refundId = toPositiveInt(resolvedParams.id);
    if (!refundId) {
      return NextResponse.json({ error: 'Valid refund id required' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Look up the existing refund first so we can guard against double-refunds.
    const [existing] = await db
      .select()
      .from(refundRequests)
      .where(eq(refundRequests.id, refundId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: `Refund already ${existing.status}. Cannot change.` },
        { status: 409 }
      );
    }

    // Concurrency guard for the gateway call. We claim the refund row by
    // atomically setting razorpay_refund_id from NULL to an IN_PROGRESS
    // sentinel. If the WHERE clause matches zero rows, another concurrent
    // approval already claimed it — return 409 instead of double-charging.
    if (existing.razorpayRefundId?.startsWith('IN_PROGRESS_')) {
      return NextResponse.json(
        { error: 'A previous gateway attempt is unresolved. Reconcile it before retrying.' },
        { status: 409 },
      );
    }
    // A real id means the gateway already refunded successfully but a later
    // local step failed. Reuse it and never call Razorpay twice.
    let razorpayRefundId: string | null = existing.razorpayRefundId;
    if (status === 'approved') {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderId, existing.orderId))
        .limit(1);

      const isCod = order?.paymentId === 'COD' || (order?.paymentId ?? '').startsWith('COD');
      const needsGatewayCall = !!(order && order.paymentId && !isCod);

      if (needsGatewayCall && !razorpayRefundId) {
        const sentinel = 'IN_PROGRESS_' + crypto.randomUUID();
        // Claim must require BOTH "no gateway call yet" AND "still pending".
        // Without the status check, a concurrent reject could flip status to
        // 'rejected' first, and we'd then call Razorpay anyway.
        const claim = await db
          .update(refundRequests)
          .set({ razorpayRefundId: sentinel })
          .where(and(
            eq(refundRequests.id, refundId),
            eq(refundRequests.status, 'pending'),
            isNull(refundRequests.razorpayRefundId),
          ))
          .returning({ id: refundRequests.id });
        if (claim.length === 0) {
          return NextResponse.json(
            { error: 'Refund is already being processed. Please refresh.' },
            { status: 409 },
          );
        }

        // Two distinct failure modes — we MUST NOT collapse them into one
        // try/catch, because clearing the sentinel after gateway success
        // would let the next admin retry double-charge Razorpay.
        let gatewayRefund: { id: string } | null = null;
        try {
          const razorpay = getRazorpay();
          // amount in paise; orders.total is stored in rupees
          gatewayRefund = await razorpay.payments.refund(order!.paymentId!, {
            amount: Math.round(order!.total * 100),
            speed: 'normal',
            notes: { refundRequestId: String(refundId), orderId: existing.orderId },
          });
        } catch (rzpErr: any) {
          // Gateway never moved money — clear the sentinel so the next
          // admin attempt can retry cleanly.
          await db
            .update(refundRequests)
            .set({ razorpayRefundId: null })
            .where(and(eq(refundRequests.id, refundId), eq(refundRequests.razorpayRefundId, sentinel)))
            .catch(() => {});
          console.error('Razorpay refund failed:', rzpErr);
          return NextResponse.json(
            { error: 'Payment gateway refund failed. Refund not approved.', detail: rzpErr?.error?.description || rzpErr?.message },
            { status: 502 }
          );
        }

        // Gateway succeeded. Persist the real refund id atomically — but
        // CRITICALLY: from this point on, a DB failure must NEVER clear
        // the sentinel. Razorpay has already moved money; clearing would
        // let a retry double-charge.
        razorpayRefundId = gatewayRefund!.id;
        try {
          await db
            .update(refundRequests)
            .set({ razorpayRefundId })
            .where(and(
              eq(refundRequests.id, refundId),
              eq(refundRequests.razorpayRefundId, sentinel),
            ));
        } catch (dbErr) {
          console.error('[refund] DB write failed AFTER gateway success — manual reconcile required', {
            refundId,
            razorpayRefundId,
            dbErr,
          });
          return NextResponse.json(
            {
              error:
                'Refund processed at the gateway, but local record failed to save. ' +
                'Do NOT retry. Reference id: ' + razorpayRefundId,
              razorpayRefundId,
              reconcile: 'manual',
            },
            { status: 500 },
          );
        }
      }
      // For COD or missing paymentId, no gateway call — operator handles cash-side.
    }

    // Inventory is part of refund completion, not a best-effort side effect.
    // If it fails, leave the request pending. A retry reuses the stored
    // gateway refund id and only retries inventory/finalization.
    if (status === 'approved' && !(await restoreRefundInventory(refundId, existing.orderId))) {
      return NextResponse.json(
        {
          error: 'Payment refund is recorded, but inventory restoration failed. Retry approval to finish reconciliation.',
          razorpayRefundId,
          retryInventory: true,
        },
        { status: 503 },
      );
    }

    // Final state flip is atomic. We additionally refuse to flip if a
    // gateway refund is already in flight or completed (razorpayRefundId set
    // to something OTHER than null). For the gateway-approval path above, we
    // already populated razorpayRefundId — match against the value we just
    // wrote so the flip and the gateway record stay coherent. For the no-
    // gateway path (COD / rejected), require razorpayRefundId IS NULL so a
    // concurrent reject can't blow away an in-flight approval.
    let updateQuery
    if (razorpayRefundId) {
      // Gateway-approval path: bind to the refund id we just stored.
      updateQuery = db.update(refundRequests)
        .set({ status })
        .where(and(
          eq(refundRequests.id, refundId),
          eq(refundRequests.status, 'pending'),
          eq(refundRequests.razorpayRefundId, razorpayRefundId),
        ))
    } else {
      // Reject path or COD-approval path: nothing should be in flight.
      updateQuery = db.update(refundRequests)
        .set({ status })
        .where(and(
          eq(refundRequests.id, refundId),
          eq(refundRequests.status, 'pending'),
          isNull(refundRequests.razorpayRefundId),
        ))
    }
    const [updatedRefund] = await updateQuery.returning();
    if (!updatedRefund) {
      return NextResponse.json(
        { error: 'Refund state changed concurrently. Please refresh.' },
        { status: 409 },
      );
    }

    // Look up user email to send notification
    const [user] = await db.select().from(users).where(eq(users.id, updatedRefund.userId)).limit(1);

    if (user && user.email) {
      const headerBg = status === 'approved' ? '#f0fdf4' : '#fef2f2';
      const headerBorder = status === 'approved' ? '#22c55e' : '#ef4444';
      const headerColor = status === 'approved' ? '#166534' : '#991b1b';
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      const refundIdStr = '#RR-' + updatedRefund.id;
      const decidedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const submittedAt = updatedRefund.createdAt
        ? new Date(updatedRefund.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
        : '—';

      const safeName = escapeHtml(user.name);
      const safeOrderId = escapeHtml(updatedRefund.orderId);
      const safeReason = escapeHtml(updatedRefund.reason);

      const headline = status === 'approved'
        ? 'Good news — your refund has been approved.'
        : 'Update on your refund request.';

      const bodyMessage = status === 'approved'
        ? 'After reviewing the details you provided, we\'ve approved your refund for Order <strong>#' + safeOrderId + '</strong>. The amount will be credited back to your original payment method shortly.'
        : 'After carefully reviewing the details you provided, we are unable to approve a refund for Order <strong>#' + safeOrderId + '</strong> at this time. We understand this may be disappointing — please see the next-steps below.';

      const nextStepsBlock = status === 'approved'
        ? '<div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; border: 1px solid #bbf7d0; margin: 24px 0;">' +
            '<p style="margin: 0 0 8px; color: #166534; font-size: 15px; font-weight: bold;">What happens next</p>' +
            '<ul style="margin: 0; padding-left: 18px; color: #166534; font-size: 14px; line-height: 1.7;">' +
              '<li>Refunds typically arrive in <strong>5–7 business days</strong>, depending on your bank.</li>' +
              '<li>The refund will appear on the same card / UPI / wallet used at checkout.</li>' +
              '<li>You\'ll see the original payment ID referenced on your bank statement.</li>' +
            '</ul>' +
          '</div>'
        : '<div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; border: 1px solid #fecaca; margin: 24px 0;">' +
            '<p style="margin: 0 0 8px; color: #991b1b; font-size: 15px; font-weight: bold;">What you can do next</p>' +
            '<ul style="margin: 0; padding-left: 18px; color: #991b1b; font-size: 14px; line-height: 1.7;">' +
              '<li>Reply to this email with additional photos or details and we\'ll re-review.</li>' +
              '<li>Write to <a href="mailto:support@annavedahfoods.com" style="color: #991b1b;">support@annavedahfoods.com</a> quoting reference <strong>' + refundIdStr + '</strong>.</li>' +
              '<li>Our customer-care team is happy to walk you through the decision.</li>' +
            '</ul>' +
          '</div>';

      try {
        await resend.emails.send({
          from: 'Annavedah Support <support@annavedahfoods.com>',
          to: user.email,
          subject: 'Refund ' + status.toUpperCase() + ' (' + refundIdStr + ') — Order ' + updatedRefund.orderId,
          html: '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">' +
            '<div style="background-color: ' + headerBg + '; padding: 40px 20px; text-align: center; border-bottom: 2px solid ' + headerBorder + ';">' +
            '<img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />' +
            '<h1 style="color: ' + headerColor + '; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Refund ' + statusLabel + '</h1>' +
            '<p style="color: #6b5347; font-size: 13px; margin: 8px 0 0;">Reference ' + refundIdStr + ' &middot; decided ' + decidedAt + '</p>' +
            '</div>' +
            '<div style="padding: 40px 32px;">' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>' + safeName + '</strong>,</p>' +
            '<p style="color: #2d1b15; font-size: 17px; line-height: 1.5; font-weight: 600; margin: 0 0 12px;">' + headline + '</p>' +
            '<p style="color: #6b5347; font-size: 16px; line-height: 1.6;">' + bodyMessage + '</p>' +

            '<h3 style="color: #2d1b15; font-size: 16px; margin: 28px 0 12px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px;">Decision Summary</h3>' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<tr><td style="padding: 6px 0; color: #6b5347; width: 180px;">Refund Reference</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">' + refundIdStr + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Order ID</td><td style="padding: 6px 0; color: #2d1b15; font-weight: 600;">' + safeOrderId + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Status</td><td style="padding: 6px 0; color: ' + headerColor + '; font-weight: 700; text-transform: uppercase;">' + statusLabel + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Submitted</td><td style="padding: 6px 0; color: #2d1b15;">' + submittedAt + '</td></tr>' +
              '<tr><td style="padding: 6px 0; color: #6b5347;">Decision Made</td><td style="padding: 6px 0; color: #2d1b15;">' + decidedAt + '</td></tr>' +
            '</table>' +

            '<div style="background-color: #faf6f0; padding: 16px 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e8ddd0;">' +
              '<p style="margin: 0; color: #2d1b15; font-size: 13px; font-weight: bold;">Reason on file</p>' +
              '<p style="margin: 6px 0 0; color: #6b5347; font-size: 14px; font-style: italic; line-height: 1.6;">"' + safeReason + '"</p>' +
            '</div>' +

            nextStepsBlock +

            '<p style="color: #6b5347; font-size: 14px; line-height: 1.6;">Thank you for shopping with Annavedah Foods. If you have any questions about this decision, just reply to this email — we\'re here to help.</p>' +
            '<p style="color: #6b5347; font-size: 14px; line-height: 1.6; margin-bottom: 0;">Warm regards,<br/><strong style="color: #2d1b15;">Team Annavedah</strong><br/><a href="mailto:support@annavedahfoods.com" style="color: #8b1a1a;">support@annavedahfoods.com</a></p>' +
            '</div>' +
            '<div style="background-color: #2d1b15; padding: 24px; text-align: center;">' +
            '<p style="color: #e8ddd0; font-size: 12px; margin: 0 0 4px;">Annavedah Foods &middot; support@annavedahfoods.com</p>' +
            '<p style="color: #a39189; font-size: 11px; margin: 0;">© ' + new Date().getFullYear() + ' Annavedah Foods. All rights reserved.</p>' +
            '</div></div>',
        });
      } catch (emailErr) {
        console.error('Failed to send refund update email:', emailErr);
      }
    }

    return NextResponse.json({ success: true, refund: updatedRefund, razorpayRefundId });
  } catch (error) {
    console.error('Update refund error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
