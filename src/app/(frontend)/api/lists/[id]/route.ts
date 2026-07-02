import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { withRetry } from '@/lib/with-retry'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { privacy, name, icon, color } = body

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const data: Record<string, unknown> = {}
    if (privacy !== undefined) data.privacy = privacy
    if (name !== undefined) data.name = name
    if (icon !== undefined) data.icon = icon
    if (color !== undefined) data.color = color

    const list = await withRetry(() =>
      payload.update({
        collection: 'lists',
        id: Number(id),
        data,
      }),
    ).catch(() => null)

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    return NextResponse.json(list)
  } catch (error) {
    console.error('[PATCH /api/lists/[id]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const { id } = await params

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    await withRetry(() =>
      payload.delete({
        collection: 'lists',
        id: Number(id),
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/lists/[id]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
