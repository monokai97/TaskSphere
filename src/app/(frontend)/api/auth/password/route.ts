import { NextRequest, NextResponse } from 'next/server'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import config from '@payload-config'
import { ChangePasswordInput } from '@/lib/schemas'
import { withRetry } from '@/lib/with-retry'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  const derivedKey = scryptSync(password, salt, 64)
  const storedKey = Buffer.from(key, 'hex')
  return derivedKey.length === storedKey.length && timingSafeEqual(derivedKey, storedKey)
}

export async function POST(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = ChangePasswordInput.safeParse(body)
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

    if (session.passwordHash) {
      const isValid = verifyPassword(parsed.data.currentPassword, session.passwordHash as string)
      if (!isValid) {
        return NextResponse.json(
          { error: { currentPassword: ['Current password is incorrect'] } },
          { status: 400 },
        )
      }
    }

    const passwordHash = hashPassword(parsed.data.newPassword)

    await withRetry(() =>
      payload.update({
        collection: 'guest-sessions',
        id: session.id,
        data: { passwordHash } as Record<string, unknown>,
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/password]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
