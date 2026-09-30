import { expect, test } from '@playwright/test'
import { createDefaultOrdemCharacter } from '../../src/systems/ordem/defaults'

for (const width of [390, 1440]) {
  test(`Ordem sheet visual em ${width}px`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('rpg-fichas:preferences:locale', 'pt-BR'))
    await page.setViewportSize({ width, height: 900 })
    const character = { ...createDefaultOrdemCharacter(), id: 'ordem-visual' }
    character.basicInfo = { name: 'Helena Duarte', origin: 'Acadêmico', className: 'Ocultista', track: 'Graduado', nex: 25, effortPerRoundLimit: 3 }
    character.attributes = { agility: 2, strength: 1, intellect: 3, presence: 2, vigor: 1 }
    character.skills.occultism = { trainingBonus: 5, otherBonus: 2 }
    character.resources = { hitPoints: { current: 18, maximum: 24 }, effortPoints: { current: 10, maximum: 15 }, sanity: { current: 32, maximum: 40 } }
    character.combat = { defense: 15, movement: '9m / 6q' }
    character.attacks = [{ id: 'attack', name: 'Revólver', type: 'Balística', range: 'Curto', test: 'Pontaria', damage: '2d6', criticalTest: '19', criticalMultiplier: '3' }]
    character.inventorySettings = { prestigePoints: 50, maximumLoad: 12 }
    character.inventory = [{ id: 'item', name: 'Kit de investigação', category: 'II', spaces: 2, description: 'Ferramentas de campo' }]
    character.abilities = [{ id: 'ability', name: 'Especialista', cost: '2 PE', page: '45', description: 'Conhecimento especializado.' }]
    character.rituals = [{ id: 'ritual', name: 'Decadência', cost: '3 PE', page: '122', description: 'Ritual de Morte.' }]
    character.notes = 'Investigar o arquivo antes da próxima missão.'
    await page.addInitScript((data) => {
      const index = 'rpg-fichas:v1:ordem:index'
      localStorage.setItem(index, JSON.stringify({ version: 1, system: 'ordem', characterIds: [data.id], activeCharacterId: data.id }))
      localStorage.setItem(`rpg-fichas:v1:ordem:character:${data.id}`, JSON.stringify({ version: 1, system: 'ordem', data }))
    }, character)
    await page.goto('/?system=ordem')
    await expect(page.getByRole('heading', { name: 'Helena Duarte' })).toBeVisible()
    await expect(page).toHaveScreenshot(`ordem--sheet--${width}--default.png`, { fullPage: true, animations: 'disabled' })
  })
}

test('Ordem sheet visual em inglês no mobile', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rpg-fichas:preferences:locale', 'en'))
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/?system=ordem')
  await page.getByRole('button', { name: 'Create sheet' }).click()
  await expect(page.getByRole('heading', { name: 'New agent' })).toBeVisible()
  await page.mouse.move(0, 0)
  await page.evaluate(() => document.fonts.ready.then(() => true))
  await expect(page).toHaveScreenshot('ordem--sheet--390--en.png', {
    fullPage: true, animations: 'disabled',
    mask: [page.getByRole('navigation', { name: 'Sheet sections' })], maskColor: '#0d1110',
  })
})
