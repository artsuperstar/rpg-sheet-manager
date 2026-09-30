import { expect, test } from '@playwright/test'

test('landing conserva o cabeçalho global e sua seleção de idioma', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toContainText('Fichas de RPG')
  await expect(page.getByRole('heading', { level: 1, name: 'Fichas de RPG' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Idioma' })).toBeVisible()
  await page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('banner')).toContainText('RPG Character Sheets')
})

for (const [system, icon] of [['dnd', 'tavern-mug'], ['ordem', 'ordem-sigil']] as const) {
  test(`${system} abre sem header global e mantém navegação no desktop`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/?system=${system}`)
    await expect(page.getByRole('banner')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1, name: system === 'dnd' ? 'D&D' : 'Ordem Paranormal' })).toBeAttached()
    const sidebar = page.locator('aside')
    await expect(sidebar.locator(`img[src*="${icon}"]`)).toHaveAttribute('alt', '')
    await expect(sidebar.getByRole('navigation', { name: 'Trocar sistema de RPG' })).toBeVisible()
    await expect(sidebar.getByRole('group', { name: 'Idioma' })).toBeVisible()
    expect((await sidebar.boundingBox())!.y).toBeLessThan(32)
  })
}

test('Ordem mostra o sigilo junto ao título mobile nos dois idiomas e conserva o foco do menu', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/?system=ordem')
  await expect(page.getByRole('banner')).toHaveCount(0)
  const trigger = page.getByRole('button', { name: 'Abrir menu de personagens' })
  const mobileHeader = trigger.locator('..')
  await expect(mobileHeader.locator('img[src*="ordem-sigil"]')).toHaveAttribute('alt', '')
  await expect(mobileHeader).toContainText('Arquivo de Agentes')
  expect((await mobileHeader.boundingBox())!.y).toBeLessThan(32)
  await trigger.click()
  await expect(page.getByRole('button', { name: 'Fechar menu de personagens' }).first()).toBeFocused()
  await page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('button', { name: 'Open character menu' }).locator('..')).toContainText('Agent Archive')
  await expect(page.getByRole('navigation', { name: 'Switch RPG system' })).toBeVisible()
  await page.getByRole('button', { name: 'Close character menu' }).first().click()
  await expect(page.getByRole('button', { name: 'Open character menu' })).toBeFocused()
})

test('D&D mantém caneca e permite expandir sidebar recolhida para acessar idioma e sistema', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/?system=dnd')
  await expect(page.locator('aside img[src*="tavern-mug"]')).toBeVisible()
  await page.getByRole('button', { name: 'Recolher barra lateral' }).click()
  await expect(page.getByRole('button', { name: 'Expandir barra lateral' })).toBeVisible()
  await page.getByRole('button', { name: 'Expandir barra lateral' }).click()
  await page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('navigation', { name: 'Switch RPG system' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Switch RPG system' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByRole('navigation', { name: 'Switch RPG system' })).toBeFocused()
  await expect(page.getByRole('banner')).toHaveCount(0)
})

test('erro de leitura conserva idioma e troca de sistema sem header global', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rpg-fichas:v1:dnd:index', '{invalid'))
  await page.goto('/?system=dnd')
  await expect(page.getByRole('banner')).toHaveCount(0)
  await expect(page.getByRole('alert')).toContainText('Erro de leitura')
  await page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('alert')).toContainText('Read error')
  await page.getByRole('navigation', { name: 'Switch RPG system' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByRole('region', { name: 'Ordem Paranormal' })).toBeVisible()
})
