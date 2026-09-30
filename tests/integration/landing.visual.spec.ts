import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`landing visual em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Escolha um sistema de RPG' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await expect(page).toHaveScreenshot(`landing--${width}--default.png`, { fullPage: true, animations: 'disabled' })
  })
}
