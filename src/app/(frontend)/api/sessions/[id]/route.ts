import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { withRetry } from '@/lib/with-retry'

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
        collection: 'sessions',
        id: Number(id),
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/sessions/[id]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
