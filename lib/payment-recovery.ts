import 'server-only';
import { inArray, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { getRazorpay } from '@/lib/razorpay';

const RECOVERABLE = ['stock_failed', 'persist_failed'] as const;

export async function retryFailedPaymentRecoveries(limit = 25) {
  const candidates = await db
    .select()
    .from(orders)
    .where(inArray(orders.status, [...RECOVERABLE]))
    .limit(Math.max(1, Math.min(limit, 100)));
  const results: Array<{ orderId: string; recovered: boolean; error?: string }> = [];

  for (const order of candidates) {
    const successStatus = order.status === 'stock_failed'
      ? 'refunded_stock_failure'
      : 'refunded_persist_failure';
    if (!order.paymentId || order.paymentId === 'COD') {
      results.push({ orderId: order.orderId, recovered: false, error: 'Missing gateway payment id' });
      continue;
    }
    try {
      const payment = await getRazorpay().payments.fetch(order.paymentId);
      const expectedPaise = Math.round(Number(order.total) * 100);
      const refundedPaise = Number(payment.amount_refunded || 0);
      if (refundedPaise < expectedPaise) {
        await getRazorpay().payments.refund(order.paymentId, {
          amount: expectedPaise - refundedPaise,
          speed: 'normal',
          notes: { reason: 'durable_payment_recovery', orderId: order.orderId },
        });
      }
      await db.update(orders)
        .set({ status: successStatus })
        .where(eq(orders.id, order.id));
      results.push({ orderId: order.orderId, recovered: true });
    } catch (error) {
      console.error('[payment-recovery]', order.orderId, error);
      results.push({
        orderId: order.orderId,
        recovered: false,
        error: error instanceof Error ? error.message : 'Gateway recovery failed',
      });
    }
  }
  return results;
}
