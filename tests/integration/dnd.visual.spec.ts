import { expect, test } from '@playwright/test'
import { visualDndCharacter } from '../fixtures/dndCharacter'

for (const width of [390, 1440]) {
  test(`D&D sheet visual em ${width}px`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('rpg-fichas:preferences:locale', 'pt-BR'))
    await page.addInitScript(({ index, record }) => {
      if (localStorage.getItem('rpg-fichas:v1:dnd:index') === null) {
        localStorage.setItem('rpg-fichas:v1:dnd:index', index)
        localStorage.setItem('rpg-fichas:v1:dnd:character:visual-test-character', record)
      }
    }, {
      index: JSON.stringify({ version: 1, system: 'dnd', characterIds: [visualDndCharacter.id], activeCharacterId: visualDndCharacter.id }),
      record: JSON.stringify({ version: 1, system: 'dnd', data: visualDndCharacter }),
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?system=dnd')
    await expect(page.getByRole('heading', { name: 'Lyra Emberfall' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await expect(page).toHaveScreenshot(`dnd--sheet--${width}--default.png`, {
      fullPage: true,
      animations: 'disabled',
    })
  })
}
