import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { UpdateCategoryInput } from '@/lib/schemas'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guestId = req.headers.get('x-guest-id')
  if (!guestId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = UpdateCategoryInput.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { getPayload } = await import('payload')
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const category = await payload.update({
    collection: 'categories',
    id: Number(id),
    data: parsed.data,
  }).catch(() => null)

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  return NextResponse.json(category)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guestId = req.headers.get('x-guest-id')
  if (!guestId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const { id } = await params

  const { getPayload } = await import('payload')
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  await payload.delete({
    collection: 'categories',
    id: Number(id),
  })

  return NextResponse.json({ success: true })
}
