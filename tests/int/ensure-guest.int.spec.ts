import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

const mockFind = vi.fn()
const mockCreate = vi.fn()

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    find: mockFind,
    create: mockCreate,
  }),
}))

const DEFAULT_LISTS = [
  { name: 'My Day', icon: 'today', color: '#004ac6', isDefault: true, sortOrder: 0 },
  { name: 'Important', icon: 'star', color: '#ba1a1a', isDefault: false, sortOrder: 1 },
  { name: 'Planned', icon: 'calendar_today', color: '#735c00', isDefault: false, sortOrder: 2 },
  { name: 'Tasks', icon: 'list', color: '#434655', isDefault: false, sortOrder: 3 },
]

describe('DEFAULT_LISTS Contract', () => {
  it('contains exactly 4 lists', () => {
    expect(DEFAULT_LISTS).toHaveLength(4)
  })

  it('My Day is the only default list', () => {
    const myDay = DEFAULT_LISTS.find(l => l.name === 'My Day')
    expect(myDay?.isDefault).toBe(true)
    expect(myDay?.icon).toBe('today')

    const nonDefaults = DEFAULT_LISTS.filter(l => !l.isDefault)
    expect(nonDefaults).toHaveLength(3)
    for (const l of nonDefaults) {
      expect(l.isDefault).toBe(false)
    }
  })

  it('all entries have required fields', () => {
    for (const list of DEFAULT_LISTS) {
      expect(typeof list.name).toBe('string')
      expect(typeof list.icon).toBe('string')
      expect(typeof list.color).toBe('string')
      expect(typeof list.isDefault).toBe('boolean')
      expect(typeof list.sortOrder).toBe('number')
    }
  })

  it('names and sort orders match the spec', () => {
    const names = DEFAULT_LISTS.map(l => l.name)
    expect(names).toEqual(['My Day', 'Important', 'Planned', 'Tasks'])
    for (let i = 0; i < DEFAULT_LISTS.length; i++) {
      expect(DEFAULT_LISTS[i].sortOrder).toBe(i)
    }
  })
})

describe('ensureGuestInitialized Module', () => {
  beforeAll(() => {
    mockFind.mockReset()
    mockCreate.mockReset()
  })

  it('exports function with correct name', async () => {
    const mod = await import('../../src/lib/payload-client.js')

    expect(mod.ensureGuestInitialized).toBeInstanceOf(Function)
    expect(mod.ensureGuestInitialized.name).toBe('ensureGuestInitialized')
  })

  it('returns a Promise<void> when called', async () => {
    mockFind.mockResolvedValue({ totalDocs: 1, docs: [] })

    const { ensureGuestInitialized } = await import(
      '../../src/lib/payload-client.js'
    )

    const result = ensureGuestInitialized('test-id')
    expect(result).toBeInstanceOf(Promise)
    await expect(result).resolves.toBeUndefined()
  })

  it('does NOT create data if guest already exists', async () => {
    mockFind.mockResolvedValue({ totalDocs: 1, docs: [{ guestId: 'existing' }] })
    mockCreate.mockReset()

    const { ensureGuestInitialized } = await import(
      '../../src/lib/payload-client.js'
    )

    await ensureGuestInitialized('existing')

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates GuestSession + 4 lists for a new guest', async () => {
    mockFind.mockResolvedValue({ totalDocs: 0, docs: [] })
    mockCreate.mockReset().mockResolvedValue({})

    const { ensureGuestInitialized } = await import(
      '../../src/lib/payload-client.js'
    )

    await ensureGuestInitialized('new-guest')

    expect(mockCreate).toHaveBeenCalledTimes(5)

    expect(mockCreate).toHaveBeenNthCalledWith(1, {
      collection: 'guest-sessions',
      data: expect.objectContaining({ guestId: 'new-guest' }),
    })

    for (let i = 0; i < 4; i++) {
      expect(mockCreate).toHaveBeenNthCalledWith(i + 2, {
        collection: 'lists',
        data: expect.objectContaining({
          guestId: 'new-guest',
          name: DEFAULT_LISTS[i].name,
          icon: DEFAULT_LISTS[i].icon,
          color: DEFAULT_LISTS[i].color,
          isDefault: DEFAULT_LISTS[i].isDefault,
          sortOrder: DEFAULT_LISTS[i].sortOrder,
        }),
      })
    }
  })

  it('handles Payload failure gracefully (does not throw)', async () => {
    vi.mocked(mockFind).mockRejectedValue(new Error('DB error'))

    const { ensureGuestInitialized } = await import(
      '../../src/lib/payload-client.js'
    )

    await expect(
      ensureGuestInitialized('error-guest'),
    ).resolves.toBeUndefined()
  })

  it('also exports DEFAULT_LISTS matching the contract', async () => {
    const { DEFAULT_LISTS: exportedLists } = await import(
      '../../src/lib/payload-client.js'
    )

    expect(exportedLists).toHaveLength(4)
    expect(exportedLists[0].name).toBe('My Day')
    expect(exportedLists[0].isDefault).toBe(true)
  })
})
