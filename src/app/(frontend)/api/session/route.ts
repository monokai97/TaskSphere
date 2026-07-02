import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { getSession } from '@/lib/iron-session'
import { ensureGuestInitialized } from '@/lib/payload-client'
import { withRetry } from '@/lib/with-retry'

interface SessionResponse {
  guestId: string
  createdAt: string
  locale: string | null
  theme: string | null
  accent: string | null
  density: string | null
  notificationsEnabled: boolean | null
  twoFactorEnabled: boolean | null
  desktopAlertPreferences: Record<string, unknown> | null
  emailSummaryPreferences: Record<string, unknown> | null
  pushNotificationPreferences: Record<string, unknown> | null
  dateTimePreferences: Record<string, unknown> | null
  backgroundPreferences: Record<string, unknown> | null
  integrations: Record<string, unknown> | null
}

export async function GET(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    await ensureGuestInitialized(guestId)

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const result = await payload.find({
      collection: 'guest-sessions',
      where: { guestId: { equals: guestId } },
      limit: 1,
      depth: 0,
    })

    const session = result.docs[0]
    return NextResponse.json<SessionResponse>({
      guestId: session.guestId,
      createdAt: session.createdAt,
      locale: session.locale ?? null,
      theme: session.theme ?? null,
      accent: session.accent ?? null,
      density: session.density ?? null,
      notificationsEnabled: session.notificationsEnabled ?? null,
      twoFactorEnabled: session.twoFactorEnabled ?? null,
      desktopAlertPreferences: (session.desktopAlertPreferences ?? null) as Record<string, unknown> | null,
      emailSummaryPreferences: (session.emailSummaryPreferences ?? null) as Record<string, unknown> | null,
      pushNotificationPreferences: (session.pushNotificationPreferences ?? null) as Record<string, unknown> | null,
      dateTimePreferences: (session.dateTimePreferences ?? null) as Record<string, unknown> | null,
      backgroundPreferences: (session.backgroundPreferences ?? null) as Record<string, unknown> | null,
      integrations: (session.integrations ?? null) as Record<string, unknown> | null,
    })
  } catch (error) {
    console.error('[GET /api/session]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const body = await req.json()

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

    const allowedFields = [
      'locale',
      'theme',
      'accent',
      'density',
      'notificationsEnabled',
      'desktopAlertPreferences',
      'emailSummaryPreferences',
      'pushNotificationPreferences',
      'dateTimePreferences',
      'backgroundPreferences',
      'integrations',
    ]

    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field]
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await withRetry(() =>
      payload.update({
        collection: 'guest-sessions',
        id: session.id,
        data,
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/session]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    await payload.delete({ collection: 'tasks', where: { guestId: { equals: guestId } } })
    await payload.delete({ collection: 'task-logs', where: { guestId: { equals: guestId } } })
    await payload.delete({ collection: 'lists', where: { guestId: { equals: guestId } } })
    await payload.delete({ collection: 'categories', where: { guestId: { equals: guestId } } })
    await payload.delete({ collection: 'focus-sessions', where: { guestId: { equals: guestId } } })
    await payload.delete({ collection: 'profiles', where: { guestId: { equals: guestId } } })
    await payload.delete({ collection: 'sessions', where: { guestId: { equals: guestId } } })
    await payload.delete({ collection: 'guest-sessions', where: { guestId: { equals: guestId } } })

    const res = NextResponse.json({ success: true })
    const session = await getSession(req, res)
    session.destroy()
    await session.save()

    return res
  } catch (error) {
    console.error('[DELETE /api/session]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
