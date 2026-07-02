import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ensureGuestInitialized } from '@/lib/payload-client'
import { CreateCategoryInput } from '@/lib/schemas'

export async function GET(req: NextRequest) {
  const guestId = req.headers.get('x-guest-id')

  if (!guestId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  await ensureGuestInitialized(guestId)

  const { getPayload } = await import('payload')
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const categories = await payload.find({
    collection: 'categories',
    where: { guestId: { equals: guestId } },
    sort: 'sortOrder',
  })

  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const guestId = req.headers.get('x-guest-id')

  if (!guestId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateCategoryInput.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await ensureGuestInitialized(guestId)

  const { getPayload } = await import('payload')
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const category = await payload.create({
    collection: 'categories',
    data: {
      name: parsed.data.name,
      color: parsed.data.color || '#004ac6',
      icon: parsed.data.icon || 'label',
      guestId,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
