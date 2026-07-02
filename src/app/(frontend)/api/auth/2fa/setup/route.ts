import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { generateSecret, generateProvisioningURI, generateBackupCodes } from '@/lib/totp'
import { withRetry } from '@/lib/with-retry'

export async function POST(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
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

    if (session.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
    }

    const secret = generateSecret()
    const uri = generateProvisioningURI(secret, guestId, 'FocusFlow')
    const backupCodes = generateBackupCodes(8)

    await withRetry(() =>
      payload.update({
        collection: 'guest-sessions',
        id: session.id,
        data: {
          twoFactorSecret: secret,
          backupCodes,
        } as Record<string, unknown>,
      }),
    )

    return NextResponse.json({
      secret,
      uri,
      backupCodes,
    })
  } catch (error) {
    console.error('[POST /api/auth/2fa/setup]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
