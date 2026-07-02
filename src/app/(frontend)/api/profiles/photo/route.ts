import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import config from '@payload-config'
import { ensureGuestInitialized } from '@/lib/payload-client'
import { withRetry } from '@/lib/with-retry'

export async function POST(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    await ensureGuestInitialized(guestId)

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 })
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const pathname = `profiles/${guestId}_${Date.now()}_${fileName}`

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: file.type,
    })

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const profileResult = await withRetry(() =>
      payload.find({
        collection: 'profiles',
        where: { guestId: { equals: guestId } },
        limit: 1,
        depth: 0,
      }),
    )

    let profile
    const avatarUrl = blob.url
    if (profileResult.totalDocs > 0) {
      profile = await withRetry(() =>
        payload.update({
          collection: 'profiles',
          id: profileResult.docs[0].id,
          data: { avatar: avatarUrl },
        }),
      )
    } else {
      profile = await withRetry(() =>
        payload.create({
          collection: 'profiles',
          data: { guestId, avatar: avatarUrl },
        }),
      )
    }

    return NextResponse.json({ url: avatarUrl, profile }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/profiles/photo]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    await ensureGuestInitialized(guestId)

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const profileResult = await withRetry(() =>
      payload.find({
        collection: 'profiles',
        where: { guestId: { equals: guestId } },
        limit: 1,
        depth: 0,
      }),
    )

    if (profileResult.totalDocs === 0) {
      return NextResponse.json({ success: true })
    }

    const prevAvatar = profileResult.docs[0].avatar as string | null
    if (prevAvatar?.startsWith('https://')) {
      await del(prevAvatar).catch(() => {})
    }

    await withRetry(() =>
      payload.update({
        collection: 'profiles',
        id: profileResult.docs[0].id,
        data: { avatar: null },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/profiles/photo]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
