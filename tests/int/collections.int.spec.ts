import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

const TEST_GUEST = 'test-guest-' + Date.now()
const OTHER_GUEST = 'other-guest-' + Date.now()

function mockReq(guestId?: string): Request {
  const headers: Record<string, string> = {}
  if (guestId) headers['x-guest-id'] = guestId
  return new Request('http://localhost:3000', { headers })
}

let payload: Payload

function createAny(collection: string, data: Record<string, unknown>, req?: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (payload as any).create({ collection, data, ...(req ? { req } : {}) })
}

function updateAny(collection: string, id: number | string, data: Record<string, unknown>, req?: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (payload as any).update({ collection, id, data, ...(req ? { req } : {}) })
}

function deleteAny(collection: string, id: number | string, req?: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (payload as any).delete({ collection, id, ...(req ? { req } : {}) })
}

describe('Collections: Lists', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  describe('Schema & Validation', () => {
    it('creates a list with required fields', async () => {
      const list = await createAny('lists', { name: 'Test List', guestId: TEST_GUEST })
      expect(list.name).toBe('Test List')
      expect(list.guestId).toBe(TEST_GUEST)
      expect(list.icon).toBe('list')
      expect(list.isDefault).toBe(false)
      await deleteAny('lists', list.id)
    })

    it('rejects list without name (required)', async () => {
      await expect(
        createAny('lists', { guestId: TEST_GUEST }),
      ).rejects.toThrow()
    })

    it('rejects list without guestId (required)', async () => {
      await expect(
        createAny('lists', { name: 'No Guest' }),
      ).rejects.toThrow()
    })

    it('stores optional icon and color', async () => {
      const list = await createAny('lists', {
        name: 'Colored List',
        guestId: TEST_GUEST,
        icon: 'star',
        color: '#ff0000',
        sortOrder: 1,
      })
      expect(list.icon).toBe('star')
      expect(list.color).toBe('#ff0000')
      expect(list.sortOrder).toBe(1)
      await deleteAny('lists', list.id)
    })
  })

  describe('Access Control', () => {
    it('creates list only with x-guest-id header', async () => {
      const list = await createAny('lists', { name: 'Other Guest List', guestId: OTHER_GUEST }, mockReq(OTHER_GUEST))
      expect(list.guestId).toBe(OTHER_GUEST)
      await deleteAny('lists', list.id)
    })

    it('filters lists by guestId on read', async () => {
      const list = await createAny('lists', { name: 'Read Test', guestId: TEST_GUEST })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (payload as any).find({
        collection: 'lists',
        where: { guestId: { equals: TEST_GUEST } },
        req: mockReq(TEST_GUEST),
      })
      for (const l of result.docs) {
        expect(l.guestId).toBe(TEST_GUEST)
      }
      await deleteAny('lists', list.id)
    })
  })
})

describe('Collections: Tasks', () => {
  let taskListId: number

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    const list = await createAny('lists', { name: 'Task Test List', guestId: TEST_GUEST })
    taskListId = list.id
  })

  afterAll(async () => {
    const tasks = await payload.find({
      collection: 'tasks',
      where: { guestId: { equals: TEST_GUEST } },
    })
    for (const t of tasks.docs) {
      try { await deleteAny('tasks', t.id) } catch { /* ignore */ }
    }
    try { await deleteAny('lists', taskListId) } catch { /* ignore */ }
  })

  describe('Schema & Validation', () => {
    it('creates a task with required fields', async () => {
      const task = await createAny('tasks', {
        title: 'Test Task',
        guestId: TEST_GUEST,
        list: taskListId,
      })
      expect(task.title).toBe('Test Task')
      expect(task.guestId).toBe(TEST_GUEST)
      expect(task.status).toBe('pending')
      expect(task.important).toBe(false)
      await deleteAny('tasks', task.id)
    })

    it('rejects task without title', async () => {
      await expect(
        createAny('tasks', { guestId: TEST_GUEST, list: taskListId }),
      ).rejects.toThrow()
    })

    it('rejects task without list relationship', async () => {
      await expect(
        createAny('tasks', { title: 'No List', guestId: TEST_GUEST }),
      ).rejects.toThrow()
    })

    it('rejects task without guestId', async () => {
      await expect(
        createAny('tasks', { title: 'No Guest', list: taskListId }),
      ).rejects.toThrow()
    })

    it('stores optional fields: description, dueDate, sortOrder, completedAt', async () => {
      const task = await createAny('tasks', {
        title: 'Full Task',
        guestId: TEST_GUEST,
        list: taskListId,
        description: 'A description',
        dueDate: '2026-07-01T12:00:00.000Z',
        sortOrder: 5,
        completedAt: '2026-06-19T10:00:00.000Z',
        important: true,
        status: 'completed',
      })
      expect(task.description).toBe('A description')
      expect(task.important).toBe(true)
      expect(task.status).toBe('completed')
      expect(task.sortOrder).toBe(5)
      await deleteAny('tasks', task.id)
    })

    it('stores subtasks array', async () => {
      const task = await createAny('tasks', {
        title: 'Task with Subtasks',
        guestId: TEST_GUEST,
        list: taskListId,
        subtasks: [
          { title: 'Step 1', completed: false },
          { title: 'Step 2', completed: true },
        ],
      })
      expect(task.subtasks).toHaveLength(2)
      expect(task.subtasks[0].title).toBe('Step 1')
      expect(task.subtasks[1].completed).toBe(true)
      await deleteAny('tasks', task.id)
    })

    it('rejects subtask without title', async () => {
      await expect(
        createAny('tasks', {
          title: 'Bad Subtask',
          guestId: TEST_GUEST,
          list: taskListId,
          subtasks: [{ completed: true }],
        }),
      ).rejects.toThrow()
    })
  })

  describe('Hooks: TaskLogs', () => {
    let hookTaskId: number

    afterAll(async () => {
      if (hookTaskId) {
        await deleteAny('tasks', hookTaskId)
      }
    })

    it('creates a TaskLog on task creation (afterChange)', async () => {
      const task = await createAny('tasks', {
        title: 'Hook Create Test',
        guestId: TEST_GUEST,
        list: taskListId,
      }, mockReq(TEST_GUEST))
      hookTaskId = task.id

      const allLogs = await payload.find({ collection: 'task-logs', limit: 100 })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const logs = allLogs.docs.filter((l: any) => String(l.task) === String(task.id))
      expect(logs.length).toBeGreaterThanOrEqual(1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const log = logs.find((l: any) => l.operation === 'CREATE')!
      expect(log).toBeDefined()
      expect(log.guestId).toBe(TEST_GUEST)
    })

    it('creates a TaskLog on task update (afterChange)', async () => {
      await updateAny('tasks', hookTaskId, { title: 'Updated Title' }, mockReq(TEST_GUEST))

      const allLogs = await payload.find({ collection: 'task-logs', limit: 100 })
      const logs = allLogs.docs.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (l: any) => String(l.task) === String(hookTaskId) && l.operation === 'UPDATE',
      )
      expect(logs.length).toBeGreaterThanOrEqual(1)
      const log = logs[0]!
      expect(log.operation).toBe('UPDATE')
      expect(log.previousState).toBeTruthy()
      expect(log.newState).toBeTruthy()
    })

    it('creates a TaskLog on task delete (afterDelete)', async () => {
      const task = await createAny('tasks', {
        title: 'To Be Deleted',
        guestId: TEST_GUEST,
        list: taskListId,
      })
      const deleteId = task.id

      await deleteAny('tasks', deleteId, mockReq(TEST_GUEST))

      const allLogs = await payload.find({ collection: 'task-logs', limit: 100 })
      const logs = allLogs.docs.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (l: any) => String(l.task) === String(deleteId) && l.operation === 'DELETE',
      )
      expect(logs.length).toBeGreaterThanOrEqual(1)
      const log = logs[0]
      expect(log.operation).toBe('DELETE')
      expect(log.previousState).toBeTruthy()
      expect(log.newState).toBeNull()
    })
  })
})

describe('Collections: TaskLogs', () => {
  let tempTaskId: number

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    const list = await createAny('lists', { name: 'Log Test List', guestId: TEST_GUEST })
    const task = await createAny('tasks', { title: 'Log Test Task', guestId: TEST_GUEST, list: list.id })
    tempTaskId = task.id
  })

  describe('Access Control', () => {
    it('allows create', async () => {
      const log = await createAny('task-logs', {
        task: String(tempTaskId),
        guestId: TEST_GUEST,
        operation: 'CREATE',
        timestamp: new Date().toISOString(),
      })
      expect(log.id).toBeDefined()
      expect(log.operation).toBe('CREATE')
    })

    it('stores previousState and newState as JSON', async () => {
      const log = await createAny('task-logs', {
        task: String(tempTaskId),
        guestId: TEST_GUEST,
        operation: 'UPDATE',
        previousState: JSON.stringify({ title: 'Old' }),
        newState: JSON.stringify({ title: 'New' }),
        timestamp: new Date().toISOString(),
      })
      expect(log.previousState).toBe(JSON.stringify({ title: 'Old' }))
      expect(log.newState).toBe(JSON.stringify({ title: 'New' }))
    })
  })
})

describe('Collections: GuestSessions', () => {
  let sessionId: number

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    if (sessionId) {
      await deleteAny('guest-sessions', sessionId)
    }
  })

  describe('Schema & Validation', () => {
    it('creates a guest session', async () => {
      const session = await createAny('guest-sessions', {
        guestId: TEST_GUEST,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      sessionId = session.id
      expect(session.guestId).toBe(TEST_GUEST)
      expect(session.theme).toBe('system')
      expect(session.notificationsEnabled).toBe(true)
    })

    it('rejects duplicate guestId (unique)', async () => {
      await expect(
        createAny('guest-sessions', {
          guestId: TEST_GUEST,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ).rejects.toThrow()
    })

    it('stores locale, theme, notifications, integrations, focusSettings', async () => {
      const session2 = await createAny('guest-sessions', {
        guestId: TEST_GUEST + '-settings',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        locale: 'es',
        theme: 'dark',
        notificationsEnabled: false,
        integrations: { googleCalendar: { connected: false } },
        focusSettings: { pomodoroDuration: 25 },
      })
      expect(session2.locale).toBe('es')
      expect(session2.theme).toBe('dark')
      expect(session2.notificationsEnabled).toBe(false)
      expect(session2.integrations).toEqual({ googleCalendar: { connected: false } })
      expect(session2.focusSettings).toEqual({ pomodoroDuration: 25 })
      await deleteAny('guest-sessions', session2.id)
    })
  })

  describe('Hook: beforeChange extends expiresAt', () => {
    it('extends expiresAt by 7 days when lastActiveAt changes', async () => {
      const originalExpires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      const session = await createAny('guest-sessions', {
        guestId: TEST_GUEST + '-hook',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: originalExpires,
      })

      const newLastActive = new Date(Date.now() + 60 * 1000).toISOString()
      const updated = await updateAny('guest-sessions', session.id, { lastActiveAt: newLastActive }, mockReq(TEST_GUEST + '-hook'))

      const expectedExpires = new Date(new Date(newLastActive).getTime() + 7 * 24 * 60 * 60 * 1000)
      const actualExpires = new Date(updated.expiresAt)
      expect(actualExpires.getTime()).toBeCloseTo(expectedExpires.getTime(), -3)

      await deleteAny('guest-sessions', session.id)
    })

    it('does not extend expiresAt when lastActiveAt is unchanged', async () => {
      const fixedExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const session = await createAny('guest-sessions', {
        guestId: TEST_GUEST + '-hook2',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: fixedExpires,
      })

      const updated = await updateAny('guest-sessions', session.id, { notificationsEnabled: false }, mockReq(TEST_GUEST + '-hook2'))

      expect(updated.expiresAt).toBe(fixedExpires)
      await deleteAny('guest-sessions', session.id)
    })
  })
})

describe('Collections: FocusSessions', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  describe('Schema & Validation', () => {
    it('creates a focus session', async () => {
      const session = await createAny('focus-sessions', {
        guestId: TEST_GUEST,
        duration: 25,
      })
      expect(session.guestId).toBe(TEST_GUEST)
      expect(session.duration).toBe(25)
      expect(session.completed).toBe(false)
      expect(session.date).toMatch(/^\d{4}-\d{2}-\d{2}/)
      await deleteAny('focus-sessions', session.id)
    })

    it('rejects duration < 1', async () => {
      await expect(
        createAny('focus-sessions', { guestId: TEST_GUEST, duration: 0 }),
      ).rejects.toThrow()
    })

    it('rejects duration > 120', async () => {
      await expect(
        createAny('focus-sessions', { guestId: TEST_GUEST, duration: 121 }),
      ).rejects.toThrow()
    })

    it('stores completed and completedAt', async () => {
      const session = await createAny('focus-sessions', {
        guestId: TEST_GUEST,
        duration: 30,
        completed: true,
        completedAt: new Date().toISOString(),
      })
      expect(session.completed).toBe(true)
      expect(session.completedAt).toBeTruthy()
      await deleteAny('focus-sessions', session.id)
    })
  })
})
