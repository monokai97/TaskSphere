import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ensureGuestInitialized } from '@/lib/payload-client'
import { CreateProfileInput } from '@/lib/schemas'
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

    const result = await withRetry(() =>
      payload.find({
        collection: 'profiles',
        where: { guestId: { equals: guestId } },
        limit: 1,
        depth: 0,
      }),
    )

    const profile = result.docs[0] ?? null
    return NextResponse.json(profile)
  } catch (error) {
    console.error('[GET /api/profiles]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    await ensureGuestInitialized(guestId)

    const body = await req.json()
    const parsed = CreateProfileInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const existing = await withRetry(() =>
      payload.find({
        collection: 'profiles',
        where: { guestId: { equals: guestId } },
        limit: 1,
        depth: 0,
      }),
    )

    let profile
    if (existing.totalDocs > 0) {
      profile = await withRetry(() =>
        payload.update({
          collection: 'profiles',
          id: existing.docs[0].id,
          data: { ...parsed.data, guestId },
        }),
      )
    } else {
      profile = await withRetry(() =>
        payload.create({
          collection: 'profiles',
          data: { ...parsed.data, guestId },
        }),
      )
    }

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('[POST /api/profiles]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
