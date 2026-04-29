import { NextRequest, NextResponse } from 'next/server'
import { checkServiceability } from '@/lib/shiprocket'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pickup = searchParams.get('pickup') ?? '411001' // default Pune pincode
  const delivery = searchParams.get('delivery')
  const weight = parseFloat(searchParams.get('weight') ?? '0.5')

  if (!delivery) {
    return NextResponse.json({ error: 'delivery pincode required' }, { status: 400 })
  }

  try {
    const data = await checkServiceability(pickup, delivery, weight)
    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[shiprocket/serviceability]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
