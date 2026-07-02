import { test, expect, BrowserContext } from '@playwright/test'

test.describe('Middleware', () => {
  test.describe('Session Cookie', () => {
    test('sets task-sphere-session cookie on first visit', async ({ page }) => {
      const response = await page.goto('http://localhost:3000')
      expect(response).not.toBeNull()
      const setCookie = response!.headers()['set-cookie'] || ''
      expect(setCookie).toContain('task-sphere-session=')
      expect(setCookie).toContain('HttpOnly')
      expect(setCookie).toContain('SameSite=Lax')
      expect(setCookie).toMatch(/Max-Age=604800/)
    })

    test('cookie expires in 7 days', async ({ page }) => {
      const response = await page.goto('http://localhost:3000')
      expect(response).not.toBeNull()
      const setCookie = response!.headers()['set-cookie'] || ''
      expect(setCookie).toMatch(/Max-Age=604800/)
    })

    test('does NOT set cookie on admin routes', async ({ page }) => {
      const response = await page.goto('http://localhost:3000/admin')
      expect(response).not.toBeNull()
      const setCookie = response!.headers()['set-cookie']
      expect(setCookie).toBeUndefined()
    })

    test('cookie persists across page reloads', async ({ page }) => {
      await page.goto('http://localhost:3000')
      const firstCookies = await page.context().cookies()
      const firstSession = firstCookies.find(c => c.name === 'task-sphere-session')

      await page.goto('http://localhost:3000')
      const secondCookies = await page.context().cookies()
      const secondSession = secondCookies.find(c => c.name === 'task-sphere-session')

      expect(secondSession).toBeDefined()
      expect(secondSession!.value).toBe(firstSession!.value)
    })

    test('no Set-Cookie on subsequent requests', async ({ page }) => {
      await page.goto('http://localhost:3000')

      const response2 = await page.goto('http://localhost:3000/api/tasks')
      expect(response2).not.toBeNull()
      const setCookie2 = response2!.headers()['set-cookie']
      expect(setCookie2).toBeUndefined()
    })
  })

  test.describe('Guest Identification', () => {
    test('different contexts get different guest IDs', async ({ browser }) => {
      const context1: BrowserContext = await browser.newContext()
      const page1 = await context1.newPage()
      await page1.goto('http://localhost:3000')
      const cookies1 = await context1.cookies()
      const session1 = cookies1.find(c => c.name === 'task-sphere-session')!.value

      const context2: BrowserContext = await browser.newContext()
      const page2 = await context2.newPage()
      await page2.goto('http://localhost:3000')
      const cookies2 = await context2.cookies()
      const session2 = cookies2.find(c => c.name === 'task-sphere-session')!.value

      expect(session1).not.toBe(session2)

      await context1.close()
      await context2.close()
    })

    test('x-guest-id header is sent with API requests', async ({ page }) => {
      let capturedHeaders: Record<string, string> = {}
      await page.route('**/api/tasks', route => {
        capturedHeaders = route.request().headers()
        route.continue()
      })

      await page.goto('http://localhost:3000')
      const response = await page.goto('http://localhost:3000/api/tasks')
      expect(response).not.toBeNull()

      expect(response!.status()).toBe(200)
      expect(capturedHeaders['x-guest-id']).toBeDefined()
      expect(capturedHeaders['x-guest-id'].length).toBeGreaterThan(0)
    })

    test('x-guest-id is a valid UUID', async ({ page }) => {
      let capturedGuestId: string | undefined
      await page.route('**/api/tasks', route => {
        capturedGuestId = route.request().headers()['x-guest-id']
        route.continue()
      })

      await page.goto('http://localhost:3000')
      await page.goto('http://localhost:3000/api/tasks')

      expect(capturedGuestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    })
  })

  test.describe('Matcher Exclusion', () => {
    test('does NOT set cookie on static assets', async ({ page }) => {
      const response = await page.goto('http://localhost:3000/favicon.ico')
      expect(response).not.toBeNull()
      const setCookie = response!.headers()['set-cookie']
      expect(setCookie).toBeUndefined()
    })

    test('does NOT set cookie on auth API routes', async ({ page }) => {
      const response = await page.goto(
        'http://localhost:3000/api/auth/session',
      )
      expect(response).not.toBeNull()
      const setCookie = response!.headers()['set-cookie']
      expect(setCookie).toBeUndefined()
    })
  })
})
