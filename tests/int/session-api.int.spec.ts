import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

const mockFind = vi.fn()
const mockDelete = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    find: mockFind,
    delete: mockDelete,
  }),
}))

vi.mock('@/lib/payload-client', () => ({
  ensureGuestInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
}))

const mockDestroy = vi.fn()
const mockIronSessionSave = vi.fn()

vi.mock('@/lib/iron-session', () => ({
  getSession: vi.fn().mockResolvedValue({
    destroy: mockDestroy,
    save: mockIronSessionSave,
  }),
}))

function createMockRequest(guestId: string | null) {
  return {
    headers: {
      get: vi.fn((name: string) => {
        if (name === 'x-guest-id') return guestId
        return null
      }),
    },
  } as unknown as import('next/server').NextRequest
}

describe('GET /api/session', () => {
  beforeAll(() => {
    mockFind.mockReset()
    mockEnsureInitialized.mockReset()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when no guestId', async () => {
    const { GET } = await import(
      '../../src/app/(frontend)/api/session/route.js'
    )

    const req = createMockRequest(null)
    const res = await GET(req)

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('No session')
  })

  it('returns 200 with session data for valid guest', async () => {
    mockFind.mockResolvedValue({
      docs: [
        {
          guestId: 'abc-123',
          createdAt: '2026-01-01T00:00:00.000Z',
          locale: 'es',
          theme: 'dark',
          notificationsEnabled: true,
        },
      ],
    })

    const { GET } = await import(
      '../../src/app/(frontend)/api/session/route.js'
    )

    const req = createMockRequest('abc-123')
    const res = await GET(req)

    expect(mockEnsureInitialized).toHaveBeenCalledWith('abc-123')

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      guestId: 'abc-123',
      createdAt: '2026-01-01T00:00:00.000Z',
      locale: 'es',
      theme: 'dark',
      notificationsEnabled: true,
    })
  })

  it('returns 503 when ensureGuestInitialized throws', async () => {
    mockEnsureInitialized.mockRejectedValue(new Error('DB error'))

    const { GET } = await import(
      '../../src/app/(frontend)/api/session/route.js'
    )

    const req = createMockRequest('error-guest')
    const res = await GET(req)

    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBe('Service unavailable')
  })

  it('calls ensureGuestInitialized before querying Payload', async () => {
    const callOrder: string[] = []
    mockFind.mockImplementation(() => {
      callOrder.push('find')
      return { docs: [{ guestId: 'ordered', createdAt: '', locale: null, theme: 'system', notificationsEnabled: null }] }
    })
    mockEnsureInitialized.mockImplementation(() => {
      callOrder.push('ensure')
    })

    const { GET } = await import(
      '../../src/app/(frontend)/api/session/route.js'
    )

    await GET(createMockRequest('ordered-guest'))

    expect(callOrder).toEqual(['ensure', 'find'])
  })
})

describe('DELETE /api/session', () => {
  beforeAll(() => {
    mockDelete.mockReset()
    mockDestroy.mockReset()
    mockIronSessionSave.mockReset()
  })

  it('returns 401 when no guestId', async () => {
    const { DELETE } = await import(
      '../../src/app/(frontend)/api/session/route.js'
    )

    const req = createMockRequest(null)
    const res = await DELETE(req)

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('No session')
  })

  it('deletes all guest data and destroys cookie', async () => {
    const { DELETE } = await import(
      '../../src/app/(frontend)/api/session/route.js'
    )

    const guestId = 'delete-test-guest'
    const req = createMockRequest(guestId)
    const res = await DELETE(req)

    expect(mockDelete).toHaveBeenCalledTimes(4)
    expect(mockDelete).toHaveBeenCalledWith({
      collection: 'tasks',
      where: { guestId: { equals: guestId } },
    })
    expect(mockDelete).toHaveBeenCalledWith({
      collection: 'task-logs',
      where: { guestId: { equals: guestId } },
    })
    expect(mockDelete).toHaveBeenCalledWith({
      collection: 'lists',
      where: { guestId: { equals: guestId } },
    })
    expect(mockDelete).toHaveBeenCalledWith({
      collection: 'guest-sessions',
      where: { guestId: { equals: guestId } },
    })

    expect(mockDestroy).toHaveBeenCalled()
    expect(mockIronSessionSave).toHaveBeenCalled()

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true })
  })
})
