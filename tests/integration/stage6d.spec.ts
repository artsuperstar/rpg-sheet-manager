import { expect, test } from '@playwright/test'

test('Dicebound usa os D20 como marca global nos dois idiomas', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Dicebound')
  await expect(page.getByRole('heading', { level: 1, name: 'Dicebound' })).toBeVisible()
  await expect(page.getByRole('banner')).toContainText('Suas fichas de RPG em um só lugar.')
  await expect(page.locator('main')).toContainText('Escolha um sistema de RPG')
  await expect(page.locator('img[src*="dicebound-mark"]')).toHaveCount(2)
  await expect(page.locator('img[src*="tavern-mug"]')).toHaveCount(0)
  await expect(page.locator('img[src*="dicebound-mark"]').first()).toHaveAttribute('alt', '')

  await page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Dicebound' })).toBeVisible()
  await expect(page.getByRole('banner')).toContainText('Your RPG character sheets in one place.')
  await expect(page.locator('main')).toContainText('Choose an RPG system')
  await expect(page).toHaveTitle('Dicebound')
  await page.reload()
  await expect(page.getByRole('banner')).toContainText('Your RPG character sheets in one place.')
})

test('cada workspace mantém sua marca própria sem reintroduzir branding global', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'D&D', exact: true }).click()
  await expect(page.getByRole('banner')).toHaveCount(0)
  await expect(page.locator('img[src*="dicebound-mark"]')).toHaveCount(0)
  await expect(page.locator('aside img[src*="tavern-mug"]')).toHaveAttribute('alt', '')
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByRole('banner')).toHaveCount(0)
  await expect(page.locator('img[src*="dicebound-mark"]')).toHaveCount(0)
  await expect(page.locator('aside img[src*="ordem-sigil"]')).toHaveAttribute('alt', '')
  await expect(page.locator('aside')).toContainText('Arquivo de Agentes')
  await expect(page).toHaveTitle('Dicebound')
})
