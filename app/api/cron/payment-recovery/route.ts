import { NextResponse } from 'next/server';
import { retryFailedPaymentRecoveries } from '@/lib/payment-recovery';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const results = await retryFailedPaymentRecoveries();
  return NextResponse.json({
    examined: results.length,
    recovered: results.filter((result) => result.recovered).length,
    results,
  });
}
