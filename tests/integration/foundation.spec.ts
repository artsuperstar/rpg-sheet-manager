import { expect, test, type Page } from '@playwright/test'

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

test('primeira visita mostra o seletor sem criar dados', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Escolha um sistema de RPG' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'D&D', level: 2 })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Ordem Paranormal', level: 2 })).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('seleciona D&D e deixa Ordem inativa', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'D&D' }).click()

  await expect(page).toHaveURL(/\?system=dnd$/)
  await expect(page.getByRole('heading', { name: 'D&D', level: 2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Ordem Paranormal', level: 2 })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Trocar sistema de RPG' })).toContainText('Sistema atual: D&D')
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('seleciona Ordem e deixa D&D inativo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ordem Paranormal' }).click()

  await expect(page).toHaveURL(/\?system=ordem$/)
  await expect(page.getByRole('heading', { name: 'Ordem Paranormal', level: 2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'D&D', level: 2 })).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('troca nos dois sentidos sem duplicar navegação', async ({ page }) => {
  await page.goto('/?system=dnd')
  const switcher = page.getByRole('navigation', { name: 'Trocar sistema de RPG' })

  await switcher.getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page).toHaveURL(/\?system=ordem$/)
  await expect(page.getByRole('heading', { name: 'Ordem Paranormal', level: 2 })).toBeVisible()

  await switcher.getByRole('button', { name: 'D&D' }).click()
  await expect(page).toHaveURL(/\?system=dnd$/)
  await expect(page.getByRole('heading', { name: 'D&D', level: 2 })).toBeVisible()
  await expect(switcher.getByRole('button', { name: 'D&D' })).toBeDisabled()
})

test('Voltar e Avançar acompanham o sistema no URL', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'D&D' }).click()
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
    .getByRole('button', { name: 'Ordem Paranormal' }).click()

  await page.goBack()
  await expect(page).toHaveURL(/\?system=dnd$/)
  await expect(page.getByRole('heading', { name: 'D&D', level: 2 })).toBeVisible()

  await page.goForward()
  await expect(page).toHaveURL(/\?system=ordem$/)
  await expect(page.getByRole('heading', { name: 'Ordem Paranormal', level: 2 })).toBeVisible()
})

test('parâmetro inválido é removido sem afetar outros parâmetros', async ({ page }) => {
  await page.goto('/?mode=preview&system=invalid#section')

  await expect(page).toHaveURL('http://127.0.0.1:4175/?mode=preview#section')
  await expect(page.getByRole('heading', { name: 'Escolha um sistema de RPG' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('trocar sistema remove o fragmento da URL', async ({ page }) => {
  await page.goto('/?system=ordem#inventario')
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
    .getByRole('button', { name: 'D&D' }).click()

  await expect(page).toHaveURL('http://127.0.0.1:4175/?system=dnd')
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`shell e seletor funcionam sem overflow em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'D&D' })).toBeInViewport()
    await expect(page.getByRole('button', { name: 'Ordem Paranormal' })).toBeInViewport()
    await expectNoHorizontalOverflow(page)

    await page.getByRole('button', { name: 'D&D' }).click()
    const switcher = page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
    await expect(switcher.getByRole('button', { name: 'Ordem Paranormal' })).toBeInViewport()
    await expectNoHorizontalOverflow(page)

    await switcher.getByRole('button', { name: 'Ordem Paranormal' }).click()
    await expect(page.getByRole('heading', { name: 'Ordem Paranormal', level: 2 })).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })
}
