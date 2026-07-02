import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest'
import { CreateTaskInput, UpdateTaskInput } from '@/lib/schemas'
import { withRetry } from '@/lib/with-retry'

const TEST_GUEST = 'test-tasks-' + Date.now()
const OTHER_GUEST = 'other-tasks-' + Date.now()

function mockReq(guestId?: string): Request {
  const headers: Record<string, string> = {}
  if (guestId) headers['x-guest-id'] = guestId
  return new Request('http://localhost:3000', { headers })
}

let payload: Payload

function createAny(collection: string, data: Record<string, unknown>, req?: Request) {
  return (payload as any).create({ collection, data, ...(req ? { req } : {}) })
}

function updateAny(collection: string, id: number | string, data: Record<string, unknown>, req?: Request) {
  return (payload as any).update({ collection, id, data, ...(req ? { req } : {}) })
}

function deleteAny(collection: string, id: number | string, req?: Request) {
  return (payload as any).delete({ collection, id, ...(req ? { req } : {}) })
}

// ---------------------------------------------------------------------------
// Zod Validation (T1–T8)
// ---------------------------------------------------------------------------
describe('Tasks API — Zod Schemas', () => {
  describe('CreateTaskInput', () => {
    it('T1: rechaza título vacío', () => {
      const result = CreateTaskInput.safeParse({ title: '', list: 1 })
      expect(result.success).toBe(false)
      if (!result.success) {
        const flat = result.error.flatten()
        const titleErrs = flat.fieldErrors.title ?? []
        expect(titleErrs.length).toBeGreaterThan(0)
      }
    })

    it('T2: rechaza título < 3 chars', () => {
      const result = CreateTaskInput.safeParse({ title: 'ab', list: 1 })
      expect(result.success).toBe(false)
    })

    it('T3: acepta título válido', () => {
      const result = CreateTaskInput.safeParse({ title: 'Comprar leche', list: 1 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('Comprar leche')
      }
    })

    it('T4: trimea título', () => {
      const result = CreateTaskInput.safeParse({ title: '  test  ', list: 1 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('test')
      }
    })

    it('T5: asigna important default false', () => {
      const result = CreateTaskInput.safeParse({ title: 'test', list: 1 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.important).toBe(false)
      }
    })

    it('acepta important explícito', () => {
      const result = CreateTaskInput.safeParse({ title: 'test', list: 1, important: true })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.important).toBe(true)
      }
    })

    it('rechaza list no numérico', () => {
      const result = CreateTaskInput.safeParse({ title: 'test', list: 'abc' })
      expect(result.success).toBe(false)
    })

    it('rechaza title > 500 chars', () => {
      const result = CreateTaskInput.safeParse({ title: 'x'.repeat(501), list: 1 })
      expect(result.success).toBe(false)
    })

    it('rechaza description > 5000 chars', () => {
      const result = CreateTaskInput.safeParse({
        title: 'test',
        list: 1,
        description: 'x'.repeat(5001),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateTaskInput', () => {
    it('T6: acepta body vacío', () => {
      const result = UpdateTaskInput.safeParse({})
      expect(result.success).toBe(true)
    })

    it('T7: rechaza status inválido', () => {
      const result = UpdateTaskInput.safeParse({ status: 'invalid' })
      expect(result.success).toBe(false)
    })

    it('T8: acepta dueDate null', () => {
      const result = UpdateTaskInput.safeParse({ dueDate: null })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.dueDate).toBeNull()
      }
    })

    it('acepta status completed', () => {
      const result = UpdateTaskInput.safeParse({ status: 'completed' })
      expect(result.success).toBe(true)
    })

    it('acepta sortOrder 0', () => {
      const result = UpdateTaskInput.safeParse({ sortOrder: 0 })
      expect(result.success).toBe(true)
    })

    it('rechaza sortOrder negativo', () => {
      const result = UpdateTaskInput.safeParse({ sortOrder: -1 })
      expect(result.success).toBe(false)
    })

    it('trimea title en actualización', () => {
      const result = UpdateTaskInput.safeParse({ title: '  hello  ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('hello')
      }
    })
  })
})

// ---------------------------------------------------------------------------
// PayloadCMS CRUD (T9–T15)
// ---------------------------------------------------------------------------
describe('Tasks API — PayloadCMS CRUD', () => {
  let taskListId: number
  let createdTaskId: number

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

  it('T9: crea tarea en PayloadCMS', async () => {
    const task = await createAny('tasks', {
      title: 'Test Task',
      guestId: TEST_GUEST,
      list: taskListId,
      status: 'pending',
    })
    createdTaskId = task.id
    expect(task.title).toBe('Test Task')
    expect(task.status).toBe('pending')
    expect(task.important).toBe(false)
    expect(task.guestId).toBe(TEST_GUEST)
  })

  it('T10: lee tareas por guestId', async () => {
    const result = await payload.find({
      collection: 'tasks',
      where: { guestId: { equals: TEST_GUEST } },
    })
    expect(result.totalDocs).toBeGreaterThan(0)
    for (const doc of result.docs) {
      expect(doc.guestId).toBe(TEST_GUEST)
    }
  })

  it('T11: filtra por status', async () => {
    await updateAny('tasks', createdTaskId, { status: 'completed' })

    const result = await payload.find({
      collection: 'tasks',
      where: { guestId: { equals: TEST_GUEST }, status: { equals: 'completed' } },
    })
    expect(result.totalDocs).toBeGreaterThan(0)
    for (const doc of result.docs) {
      expect(doc.status).toBe('completed')
    }
  })

  it('T12: actualiza título', async () => {
    const updated = await updateAny('tasks', createdTaskId, { title: 'Updated Title' })
    expect(updated.title).toBe('Updated Title')
  })

  it('T13: toggle status completed', async () => {
    const updated = await updateAny('tasks', createdTaskId, { status: 'completed' })
    expect(updated.status).toBe('completed')
  })

  it('T14: elimina tarea', async () => {
    await deleteAny('tasks', createdTaskId)

    const result = await payload.find({
      collection: 'tasks',
      where: { id: { equals: createdTaskId } },
    })
    expect(result.totalDocs).toBe(0)
  })

  it('T15: aislamiento por guestId', async () => {
    const taskA = await createAny('tasks', {
      title: 'Task for A',
      guestId: TEST_GUEST,
      list: taskListId,
      status: 'pending',
    })

    const result = await payload.find({
      collection: 'tasks',
      where: { guestId: { equals: OTHER_GUEST } },
    })
    expect(result.totalDocs).toBe(0)

    await deleteAny('tasks', taskA.id)
  })

  it('crea subtareas array', async () => {
    const task = await createAny('tasks', {
      title: 'Task with subtasks',
      guestId: TEST_GUEST,
      list: taskListId,
      status: 'pending',
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

  it('afterChange crea TaskLog en CREATE', async () => {
    const task = await createAny('tasks', {
      title: 'Log Create Test',
      guestId: TEST_GUEST,
      list: taskListId,
      status: 'pending',
    }, mockReq(TEST_GUEST))

    const allLogs = await payload.find({ collection: 'task-logs', limit: 100 })
    const logs = allLogs.docs.filter((l: any) => String(l.task) === String(task.id))
    const createLog = logs.find((l: any) => l.operation === 'CREATE')
    expect(createLog).toBeDefined()
    expect(createLog.guestId).toBe(TEST_GUEST)

    await deleteAny('tasks', task.id)
  })

  it('afterDelete crea TaskLog en DELETE', async () => {
    const task = await createAny('tasks', {
      title: 'Log Delete Test',
      guestId: TEST_GUEST,
      list: taskListId,
      status: 'pending',
    })

    const deleteId = task.id
    await deleteAny('tasks', deleteId, mockReq(TEST_GUEST))

    const allLogs = await payload.find({ collection: 'task-logs', limit: 100 })
    const logs = allLogs.docs.filter((l: any) => String(l.task) === String(deleteId))
    const deleteLog = logs.find((l: any) => l.operation === 'DELETE')
    expect(deleteLog).toBeDefined()
    expect(deleteLog.previousState).toBeTruthy()
    expect(deleteLog.newState).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Retry Pattern — withRetry unit tests (R1–R4)
// ---------------------------------------------------------------------------
describe('withRetry', () => {
  it('R1: éxito en primer intento', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('R2: éxito tras SQLITE_BUSY en 2do intento', async () => {
    const busyErr = Object.assign(new Error('SQLITE_BUSY'), { code: 'SQLITE_BUSY' })
    const fn = vi.fn()
      .mockRejectedValueOnce(busyErr)
      .mockRejectedValueOnce(busyErr)
      .mockResolvedValueOnce('recovered')

    const result = await withRetry(fn, 5)
    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('R3: falla tras 3 intentos SQLITE_BUSY', async () => {
    const busyErr = Object.assign(new Error('SQLITE_BUSY'), { code: 'SQLITE_BUSY' })
    const fn = vi.fn().mockRejectedValue(busyErr)

    await expect(withRetry(fn, 3)).rejects.toThrow('SQLITE_BUSY')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('R4: no retry en errores no-BUSY', async () => {
    const otherErr = new Error('OTHER_ERROR')
    const fn = vi.fn().mockRejectedValue(otherErr)

    await expect(withRetry(fn)).rejects.toThrow('OTHER_ERROR')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('R4b: no retry si error no tiene code', async () => {
    const plainErr = new Error('plain error')
    const fn = vi.fn().mockRejectedValue(plainErr)

    await expect(withRetry(fn)).rejects.toThrow('plain error')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
