import { expect, test, type Page } from '@playwright/test'

const preference = 'rpg-fichas:preferences:locale'
const sheetKeys = (page: Page) => page.evaluate(() => Object.fromEntries(
  Object.keys(localStorage).filter((key) => key.startsWith('rpg-fichas:v1:')).sort().map((key) => [key, localStorage.getItem(key)]),
))

async function choose(page: Page, locale: 'pt-BR' | 'en') {
  const label = locale === 'en' ? 'English' : 'Português'
  await page.getByRole('group', { name: locale === 'en' ? 'Idioma' : 'Language' }).getByRole('button', { name: label }).click()
}

test('preferência global persiste, fallback e valor inválido são seguros', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page).toHaveTitle('Fichas de RPG')
  await choose(page, 'en')
  await expect(page.getByRole('heading', { name: 'Choose an RPG system' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('RPG Character Sheets')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Choose an RPG system' })).toBeVisible()
  await choose(page, 'pt-BR')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Escolha um sistema de RPG' })).toBeVisible()
  await page.evaluate((key) => localStorage.setItem(key, 'fr'), preference)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.getByRole('heading', { name: 'Escolha um sistema de RPG' })).toBeVisible()
})

test('idioma único acompanha D&D e Ordem sem mudar sistema ativo ou URL', async ({ page }) => {
  await page.goto('/?system=dnd')
  await choose(page, 'en')
  await expect(page.getByRole('button', { name: 'New character' })).toBeVisible()
  await choose(page, 'pt-BR')
  await expect(page.getByRole('button', { name: 'Novo personagem' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByRole('button', { name: 'Criar ficha' })).toBeVisible()
  await choose(page, 'en')
  await expect(page.getByRole('button', { name: 'Create sheet' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Switch RPG system' }).getByRole('button', { name: 'D&D' }).click()
  await expect(page.getByRole('button', { name: 'New character' })).toBeVisible()
  await expect(page).toHaveURL(/\?system=dnd$/)
})

test('D&D preserva dados e rascunho durante troca de idioma e reload', async ({ page }) => {
  await page.goto('/?system=dnd')
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  await page.getByRole('button', { name: 'Editar detalhes do personagem' }).click()
  await page.getByRole('dialog', { name: 'Editar detalhes do personagem' }).getByRole('textbox', { name: 'Nome do personagem' }).fill('Aria')
  await choose(page, 'en')
  await expect(page.getByRole('dialog', { name: 'Edit character details' }).getByRole('textbox', { name: 'Character name' })).toHaveValue('Aria')
  await page.getByRole('dialog', { name: 'Edit character details' }).getByRole('button', { name: 'Save' }).click()
  await page.getByRole('textbox', { name: 'Notes' }).fill('Mapa secreto')
  const before = await sheetKeys(page)
  await choose(page, 'pt-BR')
  expect(await sheetKeys(page)).toEqual(before)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Aria' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Anotações' })).toHaveValue('Mapa secreto')
  expect(await sheetKeys(page)).toEqual(before)
})

test('nomes iniciais seguem o idioma da criação e não mudam depois', async ({ page }) => {
  await page.goto('/?system=dnd')
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  await expect(page.getByRole('heading', { name: 'Novo aventureiro' })).toBeVisible()
  const original = await sheetKeys(page)
  await choose(page, 'en')
  await expect(page.getByRole('heading', { name: 'Novo aventureiro' })).toBeVisible()
  expect(await sheetKeys(page)).toEqual(original)
  await page.getByRole('button', { name: 'New character' }).click()
  await expect(page.getByRole('heading', { name: 'New Adventurer' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Switch RPG system' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await page.getByRole('button', { name: 'Create sheet' }).click()
  await expect(page.getByRole('heading', { name: 'New agent' })).toBeVisible()
  await choose(page, 'pt-BR')
  await expect(page.getByRole('heading', { name: 'New agent' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'New agent' })).toBeVisible()
})

test('Ordem preserva dados, IDs e rascunho durante troca de idioma', async ({ page }) => {
  await page.goto('/?system=ordem')
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  await page.getByRole('button', { name: 'Editar informações básicas' }).click()
  await page.getByRole('dialog', { name: 'Editar informações básicas' }).getByRole('textbox', { name: 'Nome do personagem' }).fill('Helena')
  await choose(page, 'en')
  await expect(page.getByRole('dialog', { name: 'Edit basic information' }).getByRole('textbox', { name: 'Character name' })).toHaveValue('Helena')
  await page.getByRole('dialog', { name: 'Edit basic information' }).getByRole('button', { name: 'Save' }).click()
  await page.getByRole('textbox', { name: 'Notes' }).fill('Pista pessoal')
  const before = await sheetKeys(page)
  await choose(page, 'pt-BR')
  expect(await sheetKeys(page)).toEqual(before)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Helena' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Anotações' })).toHaveValue('Pista pessoal')
  expect(await sheetKeys(page)).toEqual(before)
})

test('rótulos derivados de regras mudam sem alterar valores de domínio', async ({ page }) => {
  await page.goto('/?system=ordem')
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  await expect(page.getByRole('region', { name: 'Atributos e perícias' })).toContainText('Força')
  await expect(page.getByRole('region', { name: 'Inventário' })).toContainText('Recruta')
  const before = await sheetKeys(page)
  await choose(page, 'en')
  await expect(page.getByRole('region', { name: 'Attributes and skills' })).toContainText('Strength')
  await expect(page.getByRole('region', { name: 'Inventory' })).toContainText('Recruit')
  await expect(page.getByRole('navigation', { name: 'Sheet sections' }).getByRole('link', { name: /Inventory/ })).toHaveAttribute('href', '#inventario')
  expect(await sheetKeys(page)).toEqual(before)
})

test('read-error permite trocar idioma e sistema sem reler ou sobrescrever dados', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.setItem('rpg-fichas:v1:ordem:index', '{broken'))
  await page.goto('/?system=ordem')
  await expect(page.getByRole('alert')).toContainText('Erro de leitura')
  await choose(page, 'en')
  await expect(page.getByRole('alert')).toContainText('Read error')
  await expect(page.getByRole('button', { name: 'Try reading again' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('rpg-fichas:v1:ordem:index'))).toBe('{broken')
  await page.getByRole('navigation', { name: 'Switch RPG system' }).getByRole('button', { name: 'D&D' }).click()
  await expect(page.getByRole('region', { name: 'D&D' })).toBeVisible()
})

test('write-error mantém edição em memória ao trocar idioma e retry salva', async ({ page }) => {
  await page.goto('/?system=dnd')
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    window.restoreI18nWrites = () => { Storage.prototype.setItem = original }
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('rpg-fichas:v1:dnd:')) throw new DOMException('Blocked', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  await page.getByRole('button', { name: 'Editar detalhes do personagem' }).click()
  await page.getByRole('dialog', { name: 'Editar detalhes do personagem' }).getByRole('textbox', { name: 'Nome do personagem' }).fill('Pendente')
  await page.getByRole('dialog', { name: 'Editar detalhes do personagem' }).getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByRole('alert')).toContainText('Erro de escrita')
  await choose(page, 'en')
  await expect(page.getByRole('alert')).toContainText('Write error')
  await expect(page.getByRole('heading', { name: 'Pendente' })).toBeVisible()
  await page.evaluate(() => window.restoreI18nWrites?.())
  await page.getByRole('button', { name: 'Try saving again' }).click()
  await expect(page.getByRole('status')).toHaveText('Saved')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Pendente' })).toBeVisible()
})

test('seletor no drawer preserva foco e não ocupa topo da ficha', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/?system=dnd')
  await expect(page.getByRole('group', { name: 'Idioma' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Abrir menu de personagens' }).click()
  await choose(page, 'en')
  await expect(page.getByRole('group', { name: 'Language' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close character menu' }).first()).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('sidebars usam caneca e sigilo decorativos sem avatar genérico', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/?system=dnd')
  const mug = page.locator('aside img[src*="tavern-mug"]')
  await expect(mug).toHaveAttribute('alt', '')
  await expect(mug).toBeVisible()
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  const sigil = page.locator('aside img[src*="ordem-sigil"]')
  await expect(sigil).toHaveAttribute('alt', '')
  await expect(sigil).toBeVisible()
  expect(await sigil.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
})

for (const locale of ['pt-BR', 'en'] as const) {
  for (const width of [320, 360, 390, 540, 650, 768, 1024, 1440]) {
    test(`${locale}: landing e fichas sem overflow em ${width}px`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('rpg-fichas:preferences:locale', value), locale)
      await page.setViewportSize({ width, height: 900 })
      const check = async () => {
        const { clientWidth, scrollWidth } = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
        }))
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
      }
      await page.goto('/')
      await check()
      await page.goto('/?system=dnd')
      await page.getByRole('button', { name: locale === 'en' ? 'Create sheet' : 'Criar ficha' }).click()
      await check()
      await page.goto('/?system=ordem')
      await page.getByRole('button', { name: locale === 'en' ? 'Create sheet' : 'Criar ficha' }).click()
      await check()
    })
  }
}

declare global {
  interface Window { restoreI18nWrites?: () => void }
}
