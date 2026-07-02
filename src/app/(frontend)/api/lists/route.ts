import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ensureGuestInitialized } from '@/lib/payload-client'

export async function GET(req: NextRequest) {
  const guestId = req.headers.get('x-guest-id')

  if (!guestId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  await ensureGuestInitialized(guestId)

  const { getPayload } = await import('payload')
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const lists = await payload.find({
    collection: 'lists',
    where: { guestId: { equals: guestId } },
    sort: 'sortOrder',
  })

  return NextResponse.json(lists)
}

export async function POST(req: NextRequest) {
  const guestId = req.headers.get('x-guest-id')

  if (!guestId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const body = await req.json()
  const { name, icon, color } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  await ensureGuestInitialized(guestId)

  const { getPayload } = await import('payload')
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const list = await payload.create({
    collection: 'lists',
    data: {
      name: name.trim(),
      icon: icon || 'list',
      color: color || null,
      guestId,
    },
  })

  return NextResponse.json(list, { status: 201 })
}
