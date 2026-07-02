import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { VerifyTwoFactorInput } from '@/lib/schemas'
import { verifyTOTP } from '@/lib/totp'
import { withRetry } from '@/lib/with-retry'

export async function POST(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = VerifyTwoFactorInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const result = await withRetry(() =>
      payload.find({
        collection: 'guest-sessions',
        where: { guestId: { equals: guestId } },
        limit: 1,
        depth: 0,
      }),
    )

    if (result.totalDocs === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const session = result.docs[0]

    if (!session.twoFactorSecret) {
      return NextResponse.json({ error: '2FA not set up. Generate a secret first.' }, { status: 400 })
    }

    if (session.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
    }

    const isValid = verifyTOTP(parsed.data.token, session.twoFactorSecret as string)
    if (!isValid) {
      return NextResponse.json({ error: { token: ['Invalid code. Try again.'] } }, { status: 400 })
    }

    await withRetry(() =>
      payload.update({
        collection: 'guest-sessions',
        id: session.id,
        data: { twoFactorEnabled: true } as Record<string, unknown>,
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/2fa/verify]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
