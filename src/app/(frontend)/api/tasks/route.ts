import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ensureGuestInitialized } from '@/lib/payload-client'
import { CreateTaskInput } from '@/lib/schemas'
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

    const listParam = req.nextUrl.searchParams.get('list')
    const statusParam = req.nextUrl.searchParams.get('status')
    const importantParam = req.nextUrl.searchParams.get('important')
    const hasDueDateParam = req.nextUrl.searchParams.get('hasDueDate')
    const excludeDueTodayParam = req.nextUrl.searchParams.get('excludeDueToday')
    const additionalGuestId = req.nextUrl.searchParams.get('additionalGuestId')
    const searchParam = req.nextUrl.searchParams.get('search')

    const guestIds = additionalGuestId
      ? { in: [guestId, additionalGuestId] }
      : { equals: guestId }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      guestId: guestIds,
      ...(listParam ? { list: { equals: listParam } } : {}),
      ...(statusParam ? { status: { equals: statusParam } } : {}),
      ...(importantParam ? { important: { equals: true } } : {}),
      ...(hasDueDateParam ? { dueDate: { exists: true } } : {}),
    }

    const orConditions: Record<string, unknown>[] = []

    if (excludeDueTodayParam) {
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString()
      orConditions.push(
        { dueDate: { less_than: todayStart } },
        { dueDate: { greater_than: todayEnd } },
      )
    }

    if (searchParam) {
      orConditions.push(
        { title: { like: searchParam } },
        { description: { like: searchParam } },
      )
    }

    if (orConditions.length > 0) {
      where.or = orConditions
    }

    const tasks = await withRetry(() =>
      payload.find({
        collection: 'tasks',
        where,
        sort: 'sortOrder',
        depth: 1,
      }),
    )

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('[GET /api/tasks]', error)
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
    const parsed = CreateTaskInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const task = await withRetry(() =>
      payload.create({
        collection: 'tasks',
        data: { ...parsed.data, guestId, status: 'pending' },
        draft: false,
      }),
    )

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('[POST /api/tasks]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
