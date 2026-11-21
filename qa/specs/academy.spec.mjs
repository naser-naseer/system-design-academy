import { test, expect } from '@playwright/test'

const lessonRoutes = [
  ['hld-lld', 8],
  ['url-shortener-architecture', 12],
  ['journey-of-a-request', 6],
  ['load-balancing', 6],
  ['caching', 6],
  ['message-queues', 6],
]
const lessonUrl = (id, step = 1) => `/#/${id}/${step}`

// Each test gets a fresh browser context, including clean localStorage.
test('home lists all six currently available lessons', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.locator('.lesson-catalog .lesson-card')).toHaveCount(6)
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('button', { name: /HLD & LLD/ })).toBeVisible()
})

for (const [id, steps] of lessonRoutes) {
  test(`${id}: first and last steps render and navigation updates`, async ({ page }) => {
    await page.goto(lessonUrl(id))
    await expect(page.locator('.lesson-stepper-track button')).toHaveCount(steps)
    await expect(page.getByRole('img', { name: /Architecture for/ })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('button', { name: '← Back' })).toBeDisabled()

    await page.getByRole('button', { name: 'Next step →' }).click()
    await expect(page).toHaveURL(new RegExp(`#/${id}/2$`))
    await page.locator('.lesson-stepper-track button').last().click()
    await expect(page).toHaveURL(new RegExp(`#/${id}/${steps}$`))
    await expect(page.getByRole('button', { name: 'Mark lesson complete ✓' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next step →' })).toBeDisabled()
  })
}

test('scene zoom, fit, pause, replay and hidden timer', async ({ page }) => {
  await page.goto(lessonUrl('hld-lld', 3))
  const zoom = page.locator('output[aria-label="Diagram zoom"]')
  await expect(zoom).toBeVisible()
  const initial = await zoom.textContent()
  await page.getByRole('group', { name: 'Diagram camera controls' }).getByRole('button', { name: 'Zoom in', exact: true }).click()
  await expect(zoom).not.toHaveText(initial || '')
  await page.getByRole('button', { name: 'Fit diagram' }).click()
  await expect(zoom).toHaveText(initial || '')
  await expect(page.getByRole('button', { name: 'Pause animation' })).toBeVisible()
  await page.getByRole('button', { name: 'Pause animation' }).click()
  await expect(page.getByRole('button', { name: 'Play animation', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Replay animation' }).click()
  await expect(page.getByRole('button', { name: 'Pause animation' })).toBeVisible()
  await expect(page.locator('.scene-timeline-controls')).toHaveCount(0)
  await expect(page.locator('.scene-stage path.scene-edge, .scene-stage path.scene-edge-active').first()).toBeAttached()
})

test('search opens with visible control or slash shortcut and navigates to a lesson', async ({ page }) => {
  await page.goto('/#/')
  const dialog = page.getByRole('dialog', { name: 'Search curriculum' })
  await page.getByRole('button', { name: 'Search lessons', exact: true }).click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.locator('body').focus()
  await page.keyboard.press('/')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').fill('message queues')
  await dialog.getByRole('button', { name: /Message Queues/ }).click()
  await expect(page).toHaveURL(/#\/message-queues\/1$/)
  await expect(dialog).toHaveCount(0)
})

test('saved completion remains after a reload', async ({ page }) => {
  await page.goto(lessonUrl('hld-lld', 8))
  await page.getByRole('button', { name: 'Mark lesson complete ✓' }).click()
  await expect(page.getByRole('button', { name: /Lesson completed/ })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: /Lesson completed/ })).toBeVisible()
  await expect(page.locator('.sidebar-bottom')).toContainText('1 of 6 available lessons completed')
})

test('theme persists without changing diagram accessibility', async ({ page }) => {
  await page.goto(lessonUrl('hld-lld', 3))
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('img', { name: /Architecture for/ })).toBeVisible()
})

test('invalid route is handled, historical HLD link remains supported', async ({ page }) => {
  await page.goto('/#/hld-lld/999')
  await expect(page.getByRole('heading', { name: /doesn't exist/i })).toBeVisible()
  await page.goto('/#/hld-lld/9')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/URL Shortener Architecture/)
})

test('responsive layout has no document-level horizontal overflow', async ({ page }) => {
  await page.goto(lessonUrl('hld-lld', 3))
  await expect(page.locator('.canvas-panel')).toBeVisible()
  await expect(page.getByRole('img', { name: /Architecture for/ })).toBeVisible()
  const horizontalOverflow = await page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
  )
  expect(horizontalOverflow, `Page overflow by ${horizontalOverflow}px`).toBeLessThanOrEqual(2)
})

test('essential interactive controls have accessible names', async ({ page }) => {
  await page.goto(lessonUrl('hld-lld', 3))
  const controls = ['Search lessons', 'Toggle theme', 'Zoom in', 'Zoom out', 'Fit diagram',
    'Pause animation', 'Replay animation']
  for (const label of controls) {
    await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
  }
  const diagram = page.getByRole('img', { name: /Architecture for/ })
  await expect(diagram).toHaveAttribute('aria-label', /component connections/)
  await expect(page.locator('nav[aria-label="Navigate lesson steps"]')).toBeVisible()
  await expect(page.locator('aside[aria-label="Learning outcomes"]')).toBeVisible()
})

test('app does not throw an uncaught browser error during lesson changes', async ({ page }) => {
  const failures = []
  page.on('pageerror', error => failures.push(error.message))
  await page.goto(lessonUrl('hld-lld', 3))
  for (const step of [4, 5, 6, 7, 8, 3]) {
    await page.goto(lessonUrl('hld-lld', step))
  }
  expect(failures).toEqual([])
})

test('mobile tap targets are not covered by lesson content or search', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile hit testing only')
  await page.goto(lessonUrl('hld-lld', 3))
  const next = page.getByRole('button', { name: 'Next step →', exact: true })
  await next.scrollIntoViewIfNeeded()
  const uncovered = await next.evaluate(el => {
    const box = el.getBoundingClientRect()
    const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
    return Boolean(top && (top === el || el.contains(top)))
  })
  expect(uncovered, 'Next step center should receive pointer events').toBe(true)
  await next.click()
  await expect(page).toHaveURL(/#\/hld-lld\/4$/)
  const theme = page.getByRole('button', { name: 'Toggle theme', exact: true })
  await theme.scrollIntoViewIfNeeded()
  await theme.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
