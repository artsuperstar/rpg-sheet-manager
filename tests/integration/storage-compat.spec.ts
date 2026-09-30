import { expect, test } from '@playwright/test'
import storageV1 from '../fixtures/storageV1.json' with { type: 'json' }

test('dados v1 produzidos antes da refatoração carregam, editam e recarregam nos dois sistemas', async ({ page }) => {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, value)
    }
  }, storageV1)
  await page.goto('/?system=dnd')
  await expect(page.getByRole('heading', { name: 'Compat D&D' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Anotações' })).toHaveValue('Registro v1 de D&D')
  await page.getByRole('textbox', { name: 'Anotações' }).fill('Registro v1 de D&D editado')

  const switcher = page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
  await switcher.getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByRole('heading', { name: 'Compat Ordem' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Anotações' })).toHaveValue('Registro v1 de Ordem')
  await page.getByRole('textbox', { name: 'Anotações' }).fill('Registro v1 de Ordem editado')
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Anotações' })).toHaveValue('Registro v1 de Ordem editado')
  await switcher.getByRole('button', { name: 'D&D' }).click()
  await expect(page.getByRole('textbox', { name: 'Anotações' })).toHaveValue('Registro v1 de D&D editado')

  const stored = await page.evaluate(() => Object.fromEntries(
    Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)]),
  ))
  expect(Object.keys(stored)).toEqual(Object.keys(storageV1).sort())
  for (const [key, raw] of Object.entries(storageV1)) {
    const original = JSON.parse(raw)
    const actual = JSON.parse(stored[key] ?? 'null')
    if (key.includes(':character:')) {
      expect(actual).toEqual({ ...original, data: { ...original.data,
        notes: key.includes(':dnd:') ? 'Registro v1 de D&D editado' : 'Registro v1 de Ordem editado',
      } })
    } else {
      expect(actual).toEqual(original)
    }
  }
})
