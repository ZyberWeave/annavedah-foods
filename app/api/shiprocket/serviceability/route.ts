import { NextRequest, NextResponse } from 'next/server'
import { checkServiceability } from '@/lib/shiprocket'
import { getClientIp, rateLimitOr429 } from '@/lib/rate-limit'
import { getTestServiceabilityResponse, isTestServiceablePincode } from '@/lib/serviceability-overrides'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const block = await rateLimitOr429(`serviceability:ip:${ip}`, 30, 60)
  if (block) return block

  const { searchParams } = new URL(req.url)
  const pickup = searchParams.get('pickup') ?? '411001' // default Pune pincode
  const delivery = searchParams.get('delivery')
  const weight = parseFloat(searchParams.get('weight') ?? '0.5')
  const codFlag = searchParams.get('cod') === '1' ? 1 : 0

  if (!delivery || !/^\d{6}$/.test(delivery)) {
    return NextResponse.json({ error: 'A valid 6-digit delivery pincode is required' }, { status: 400 })
  }
  if (!/^\d{6}$/.test(pickup)) {
    return NextResponse.json({ error: 'pickup must be a 6-digit pincode' }, { status: 400 })
  }
  if (!Number.isFinite(weight) || weight <= 0 || weight > 50) {
    return NextResponse.json({ error: 'weight must be between 0 and 50 kg' }, { status: 400 })
  }

  if (isTestServiceablePincode(delivery)) {
    return NextResponse.json(getTestServiceabilityResponse(delivery, codFlag), {
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  try {
    const data = await checkServiceability(pickup, delivery, weight, codFlag)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' },
    })
  } catch (err: unknown) {
    console.error('[shiprocket/serviceability]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
