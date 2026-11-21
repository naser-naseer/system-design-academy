import { test, expect } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test('reduced-motion setting preserves a fully usable diagram and controls', async ({ page }) => {
  await page.goto('/#/hld-lld/3')
  await expect(page.getByRole('img', { name: /Architecture for/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Replay animation' })).toBeVisible()
  await page.getByRole('button', { name: 'Next step →' }).click()
  await expect(page).toHaveURL(/#\/hld-lld\/4$/)
  // The outgoing crossfade is disabled for reduced-motion users.
  await expect(page.locator('.scene-outgoing')).toHaveCount(0)
  await expect(page.locator('.scene-timeline-controls')).toHaveCount(0)
})
