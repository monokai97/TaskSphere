import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ensureGuestInitialized } from '@/lib/payload-client'
import { withRetry } from '@/lib/with-retry'

export async function GET(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    await ensureGuestInitialized(guestId)

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const sessions = await withRetry(() =>
      payload.find({
        collection: 'sessions',
        where: { guestId: { equals: guestId } },
        sort: '-lastActiveAt',
        depth: 0,
      }),
    )

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('[GET /api/sessions]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    await withRetry(() =>
      payload.delete({
        collection: 'sessions',
        where: {
          and: [
            { guestId: { equals: guestId } },
            { isCurrent: { not_equals: true } },
          ],
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/sessions]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
