import { describe, it, expect, vi } from 'vitest'

vi.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: class {},
}))

describe('Iron-Session Module', () => {
  describe('Security Properties', () => {
    it('has password with at least 32 characters', async () => {
      const { sessionOptions } = await import('../../src/lib/iron-session.js')
      expect(sessionOptions.password).toBeDefined()
      expect(String(sessionOptions.password).length).toBeGreaterThanOrEqual(32)
    })

    it('has cookieName set to task-sphere-session', async () => {
      const { sessionOptions } = await import('../../src/lib/iron-session.js')
      expect(sessionOptions.cookieName).toBe('task-sphere-session')
    })

    it('has httpOnly enabled', async () => {
      const { sessionOptions } = await import('../../src/lib/iron-session.js')
      expect(sessionOptions.cookieOptions?.httpOnly).toBe(true)
    })

    it('has sameSite set to lax', async () => {
      const { sessionOptions } = await import('../../src/lib/iron-session.js')
      expect(sessionOptions.cookieOptions?.sameSite).toBe('lax')
    })

    it('has maxAge set to 7 days (604800 seconds)', async () => {
      const { sessionOptions } = await import('../../src/lib/iron-session.js')
      expect(sessionOptions.cookieOptions?.maxAge).toBe(604800)
    })
  })

  describe('Exports', () => {
    it('exports getSession function', async () => {
      const mod = await import('../../src/lib/iron-session.js')
      expect(mod.getSession).toBeInstanceOf(Function)
    })

    it('file is importable without runtime errors', async () => {
      await expect(import('../../src/lib/iron-session.js')).resolves.toBeDefined()
    })
  })
})
