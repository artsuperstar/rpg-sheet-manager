import { expect, test, type Locator, type Page } from '@playwright/test'
import { createDefaultDndCharacter } from '../../src/systems/dnd/defaults'
import { createDefaultOrdemCharacter } from '../../src/systems/ordem/defaults'

function captureRuntimeIssues(page: Page) {
  const issues: string[] = []
  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') issues.push(`console: ${message.text()}`)
  })
  page.on('requestfailed', (request) => issues.push(`requestfailed: ${request.url()}`))
  return issues
}

async function tabTo(page: Page, target: Locator, limit = 40) {
  for (let index = 0; index < limit; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
}

test('jornada essencial funciona somente com teclado no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('/')
  const english = page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: 'English' })
  await tabTo(page, english)
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await tabTo(page, page.getByRole('button', { name: 'D&D', exact: true }))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/system=dnd/)

  const menu = page.getByRole('button', { name: 'Open character menu' })
  await tabTo(page, menu)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Close character menu' }).first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await page.keyboard.press('Enter')
  await tabTo(page, page.getByRole('button', { name: 'New character', exact: true }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'New Adventurer' })).toBeVisible()
  await tabTo(page, page.getByRole('button', { name: 'Edit character details' }))
  await page.keyboard.press('Enter')
  const name = page.getByRole('dialog', { name: 'Edit character details' }).getByRole('textbox', { name: 'Character name' })
  await tabTo(page, name)
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('Keyboard hero')
  await tabTo(page, page.getByRole('dialog', { name: 'Edit character details' }).getByRole('button', { name: 'Save' }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Keyboard hero' })).toBeVisible()

  await tabTo(page, menu)
  await page.keyboard.press('Enter')
  await tabTo(page, page.getByRole('navigation', { name: 'Switch RPG system' }).getByRole('button', { name: 'Ordem Paranormal' }))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/system=ordem/)
  const ordemMenu = page.getByRole('button', { name: 'Open character menu' })
  await tabTo(page, ordemMenu)
  await page.keyboard.press('Enter')
  await tabTo(page, page.getByRole('button', { name: 'New agent', exact: true }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'New agent' })).toBeVisible()
  await tabTo(page, page.getByRole('navigation', { name: 'Sheet sections' }).getByRole('link', { name: /Inventory/ }))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#inventario$/)
})

test('20 fichas por sistema mantêm seleção, isolamento e menu após resize', async ({ page }) => {
  test.setTimeout(60_000)
  const issues = captureRuntimeIssues(page)
  await page.goto('/?system=dnd')
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  for (let index = 1; index < 20; index += 1) await page.getByRole('button', { name: 'Novo personagem' }).click()
  const dndList = page.getByRole('navigation', { name: 'Seus personagens' })
  await expect(dndList.getByRole('button')).toHaveCount(20)
  await dndList.getByRole('button').first().click()
  const dndActive = await page.evaluate(() => JSON.parse(localStorage.getItem('rpg-fichas:v1:dnd:index') ?? 'null').activeCharacterId)

  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  for (let index = 1; index < 20; index += 1) await page.getByRole('button', { name: 'Novo agente', exact: true }).click()
  const ordemList = page.getByRole('navigation', { name: 'Seus agentes' })
  await expect(ordemList.getByRole('button')).toHaveCount(20)
  await ordemList.getByRole('button').first().click()
  const ordemActive = await page.evaluate(() => JSON.parse(localStorage.getItem('rpg-fichas:v1:ordem:index') ?? 'null').activeCharacterId)

  await page.setViewportSize({ width: 320, height: 800 })
  await page.getByRole('button', { name: 'Abrir menu de personagens' }).click()
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
  await page.setViewportSize({ width: 390, height: 800 })
  await page.getByRole('button', { name: 'Abrir menu de personagens' }).click()
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' }).getByRole('button', { name: 'D&D' }).click()
  await expect(page.getByRole('button', { name: 'Abrir menu de personagens' })).toBeFocused()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('rpg-fichas:v1:dnd:index') ?? 'null').activeCharacterId)).toBe(dndActive)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Novo aventureiro' })).toBeVisible()
  await page.getByRole('button', { name: 'Abrir menu de personagens' }).click()
  await expect(page.getByRole('navigation', { name: 'Seus personagens' }).getByRole('button')).toHaveCount(20)
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('rpg-fichas:v1:ordem:index') ?? 'null').activeCharacterId)).toBe(ordemActive)
  await page.getByRole('button', { name: 'Abrir menu de personagens' }).click()
  await expect(page.getByRole('navigation', { name: 'Seus agentes' }).getByRole('button')).toHaveCount(20)
  expect(issues).toEqual([])
})

test('conteúdo longo não gera overflow em larguras móveis e equivalentes a zoom', async ({ page }) => {
  const issues = captureRuntimeIssues(page)
  const long = 'Crônica Arcana Paranormal '.repeat(24)
  const dnd = createDefaultDndCharacter()
  dnd.name = long
  dnd.notes = long.repeat(10)
  dnd.attacks = [{ id: 'long-attack', name: long, attackBonus: 4, damageDice: '2d6' }]
  dnd.equipment = [{ id: 'long-item', name: long, quantity: 1 }]
  dnd.features = [{ id: 'long-feature', name: long, tracking: 'none' }]
  const ordem = createDefaultOrdemCharacter()
  ordem.basicInfo.name = long
  ordem.notes = long.repeat(10)
  ordem.attacks = [{ id: 'long-attack', name: long, type: long, range: long, test: long, damage: '2d6', criticalTest: '20', criticalMultiplier: '2' }]
  ordem.inventory = [{ id: 'long-item', name: long, category: 'I', spaces: 1, description: long }]
  ordem.abilities = [{ id: 'long-ability', name: long, cost: '1 PE', page: '1', description: long }]
  await page.addInitScript(({ dnd, ordem }) => {
    for (const [system, character] of [['dnd', dnd], ['ordem', ordem]] as const) {
      localStorage.setItem(`rpg-fichas:v1:${system}:index`, JSON.stringify({ version: 1, system, characterIds: [character.id], activeCharacterId: character.id }))
      localStorage.setItem(`rpg-fichas:v1:${system}:character:${character.id}`, JSON.stringify({ version: 1, system, data: character }))
    }
  }, { dnd, ordem })

  for (const system of ['dnd', 'ordem'] as const) {
    await page.goto(`/?system=${system}`)
    for (const width of [320, 360, 390, 540, 650, 768, 820, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth, `${system} em ${width}px`).toBeLessThanOrEqual(clientWidth + 1)
    }
    for (const zoom of [125, 150]) {
      await page.setViewportSize({ width: Math.floor(1024 / (zoom / 100)), height: 900 })
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth, `${system} em largura equivalente a zoom ${zoom}%`).toBeLessThanOrEqual(clientWidth + 1)
    }
  }
  expect(issues).toEqual([])
})
