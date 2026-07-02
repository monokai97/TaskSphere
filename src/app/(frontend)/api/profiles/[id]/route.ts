import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { UpdateProfileInput } from '@/lib/schemas'
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
    const parsed = UpdateProfileInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const profile = await withRetry(() =>
      payload.update({
        collection: 'profiles',
        id: Number(id),
        data: parsed.data,
      }),
    ).catch(() => null)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[PATCH /api/profiles/[id]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
