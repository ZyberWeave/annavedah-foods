import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code || typeof cartTotal !== 'number') {
      return NextResponse.json({ error: 'Coupon code and cart total are required' }, { status: 400 });
    }

    const result = validateCoupon(code, cartTotal);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: result.coupon.code,
      description: result.coupon.description,
      discount: result.discount,
      type: result.coupon.type,
      value: result.coupon.value,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
