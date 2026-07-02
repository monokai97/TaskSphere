import { test, expect, Page } from '@playwright/test'

test.describe('Tasks CRUD E2E', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test.beforeEach(async () => {
    await page.goto('/my-day')
  })

  test('E1 — guest crea tarea desde AddTaskBar', async () => {
    const input = page.locator('input[placeholder*="Add a task"], [data-testid="add-task-input"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill('Nueva tarea E2E')
    await input.press('Enter')

    const task = page.locator('text=Nueva tarea E2E').first()
    await expect(task).toBeVisible({ timeout: 5000 })
  })

  test('E2 — guest completa tarea', async () => {
    const input = page.locator('input[placeholder*="Add a task"], [data-testid="add-task-input"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill('Tarea a completar E2E')
    await input.press('Enter')

    const checkbox = page.locator('[data-testid="task-item"]').first().locator('input[type="checkbox"], [data-testid="task-checkbox"]').first()
    await expect(checkbox).toBeVisible({ timeout: 5000 })
    await checkbox.click()

    const taskText = page.locator('text=Tarea a completar E2E').first()
    await expect(taskText).toBeVisible()
  })

  test('E3 — guest elimina tarea', async () => {
    const input = page.locator('input[placeholder*="Add a task"], [data-testid="add-task-input"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill('Tarea a eliminar E2E')
    await input.press('Enter')

    const deleteBtn = page.locator('[data-testid="task-item"]').first().locator('span:has-text("delete"), [data-testid="delete-task"]').first()
    await expect(deleteBtn).toBeVisible({ timeout: 5000 })

    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
    }

    const deleted = page.locator('text=Tarea a eliminar E2E')
    await expect(deleted).toHaveCount(0, { timeout: 5000 })
  })

  test('E4 — guest marca tarea como importante', async () => {
    const input = page.locator('input[placeholder*="Add a task"], [data-testid="add-task-input"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill('Tarea importante E2E')
    await input.press('Enter')

    const star = page.locator('[data-testid="task-item"]').first().locator('span:has-text("star"), [data-testid="toggle-important"]').first()
    await expect(star).toBeVisible({ timeout: 5000 })
    await star.click()
  })

  test('E5 — stack Important filtra correctamente', async () => {
    const input = page.locator('input[placeholder*="Add a task"], [data-testid="add-task-input"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill('Tarea solo important')
    await input.press('Enter')

    await page.goto('/important')
    const task = page.locator('text=Tarea solo important')
    await expect(task).toHaveCount(0, { timeout: 5000 })
  })

  test('E6 — guest sin tareas ve EmptyState', async () => {
    await page.goto('/planned')
    const empty = page.locator('[data-testid="empty-state"], text=No tasks').first()
    await expect(empty).toBeVisible({ timeout: 10000 })
  })
})

test.describe('AddTaskBar E2E', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test.beforeEach(async () => {
    await page.goto('/my-day')
  })

  test('E1-ATB — toolbar visible on focus', async () => {
    const input = page.locator('input[placeholder*="Add a task"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.focus()
    await expect(page.locator('button[title="Set due date"]')).toBeVisible()
    await expect(page.locator('button[title="Set reminder"]')).toBeVisible()
    await expect(page.locator('button[title="Repeat"]')).toBeVisible()
  })

  test('E2-ATB — error for short title', async () => {
    const input = page.locator('input[placeholder*="Add a task"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.focus()
    await input.fill('ab')
    await input.press('Enter')
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 3000 })
  })

  test('E3-ATB — escape clears input and hides toolbar', async () => {
    const input = page.locator('input[placeholder*="Add a task"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.focus()
    await input.fill('Some text')
    await input.press('Escape')
    await expect(input).toHaveValue('')
    await expect(page.locator('button[title="Set due date"]')).not.toBeVisible()
  })

  test('E4-ATB — contextual placeholder on different pages', async () => {
    await page.goto('/my-day')
    const inputMyDay = page.locator('input[placeholder*="My Day"]').first()
    await expect(inputMyDay).toBeVisible({ timeout: 10000 })
  })
})
