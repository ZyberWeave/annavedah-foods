import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { verifySession } from '@/lib/auth'
import { db } from '@/lib/db'
import type { SavedAddress } from '@/lib/saved-address'
import { users } from '@/lib/schema'
import { validateCity } from '@/lib/validations'

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function parseAddress(value: unknown): SavedAddress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const input = value as Record<string, unknown>
  const address: SavedAddress = {
    firstName: cleanText(input.firstName, 80),
    lastName: cleanText(input.lastName, 80),
    phone: cleanText(input.phone, 10).replace(/\D/g, ''),
    address: cleanText(input.address, 500),
    city: cleanText(input.city, 100),
    state: cleanText(input.state, 100),
    pincode: cleanText(input.pincode, 6).replace(/\D/g, ''),
  }

  if (
    address.firstName.length < 2 ||
    !/^\d{10}$/.test(address.phone) ||
    address.address.length < 5 ||
    !validateCity(address.city).valid ||
    address.state.length < 2 ||
    !/^\d{6}$/.test(address.pincode)
  ) {
    return null
  }

  return address
}

export async function PUT(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const address = parseAddress(await request.json())
    if (!address) {
      return NextResponse.json({ error: 'Please enter a complete, valid delivery address' }, { status: 400 })
    }

    const updated = await db
      .update(users)
      .set({ savedAddress: address })
      .where(eq(users.id, session.userId))
      .returning({ id: users.id })

    if (updated.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, address })
  } catch (error) {
    console.error('[auth/address]', error)
    return NextResponse.json({ error: 'Could not save the delivery address' }, { status: 500 })
  }
}
