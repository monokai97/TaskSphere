import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { UpdateTaskInput } from '@/lib/schemas'
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
    const parsed = UpdateTaskInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const task = await withRetry(() =>
      payload.update({
        collection: 'tasks',
        id: Number(id),
        data: parsed.data,
      }),
    ).catch(() => null)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('[PATCH /api/tasks/[id]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

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
        collection: 'tasks',
        id: Number(id),
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/tasks/[id]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
