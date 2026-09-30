import { expect, test, type Page } from '@playwright/test'
import { visualDndCharacter } from '../fixtures/dndCharacter'

declare global {
  interface Window { restoreDndSetItem?: () => void }
}

const indexKey = 'rpg-fichas:v1:dnd:index'
const recordKey = (id: string) => `rpg-fichas:v1:dnd:character:${id}`

async function seedDnd(page: Page) {
  await page.addInitScript(({ index, record }) => {
    if (localStorage.getItem('rpg-fichas:v1:dnd:index') === null) {
      localStorage.setItem('rpg-fichas:v1:dnd:index', index)
      localStorage.setItem('rpg-fichas:v1:dnd:character:visual-test-character', record)
    }
  }, {
    index: JSON.stringify({ version: 1, system: 'dnd', characterIds: [visualDndCharacter.id], activeCharacterId: visualDndCharacter.id }),
    record: JSON.stringify({ version: 1, system: 'dnd', data: visualDndCharacter }),
  })
}

async function openDnd(page: Page) {
  await page.goto('/?system=dnd')
  await expect(page.getByRole('region', { name: 'D&D' })).toBeVisible()
}

async function savedCharacter(page: Page, id = visualDndCharacter.id) {
  const raw = await page.evaluate((key) => localStorage.getItem(key), recordKey(id))
  return JSON.parse(raw ?? 'null')
}

test('empty state, criação, seleção, exclusão e reload com zero fichas', async ({ page }) => {
  await openDnd(page)
  await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), indexKey)).toBeNull()
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  const first = JSON.parse((await page.evaluate((key) => localStorage.getItem(key), indexKey)) ?? 'null').activeCharacterId
  expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  await page.getByRole('button', { name: 'New character' }).click()
  const second = JSON.parse((await page.evaluate((key) => localStorage.getItem(key), indexKey)) ?? 'null').activeCharacterId
  expect(second).not.toBe(first)
  await page.getByRole('navigation', { name: 'Your characters' }).getByRole('button', { name: /New Adventurer, Level 1/ }).first().click()
  expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), indexKey)) ?? 'null').activeCharacterId).toBe(first)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'New Adventurer' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete selected' }).click()
  await page.getByRole('group', { name: /^Delete / }).getByRole('button', { name: 'Delete character' }).click()
  expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), indexKey)) ?? 'null').activeCharacterId).toBe(second)
  await page.getByRole('button', { name: 'Delete selected' }).click()
  await page.getByRole('group', { name: /^Delete / }).getByRole('button', { name: 'Delete character' }).click()
  await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
  expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), indexKey)) ?? 'null')).toEqual({
    version: 1, system: 'dnd', characterIds: [], activeCharacterId: null,
  })
  await page.reload()
  await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
})

test('identidade usa rascunho, cancela, salva e limpa rascunho ao trocar ficha', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  await page.getByRole('button', { name: 'Edit character details' }).click()
  const dialog = page.getByRole('dialog', { name: 'Edit character details' })
  await dialog.getByRole('textbox', { name: 'Character name' }).fill('Rascunho')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('heading', { name: 'Lyra Emberfall' })).toBeVisible()
  expect((await savedCharacter(page)).data.name).toBe('Lyra Emberfall')
  await page.getByRole('button', { name: 'Edit character details' }).click()
  await dialog.getByRole('textbox', { name: 'Character name' }).fill('Lyra the Wise')
  await dialog.getByRole('textbox', { name: 'Class' }).fill('Archmage')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Lyra the Wise' })).toBeVisible()
  expect((await savedCharacter(page)).data.className).toBe('Archmage')

  await page.getByRole('button', { name: 'New character' }).click()
  await page.getByRole('button', { name: 'Edit character details' }).click()
  await dialog.getByRole('textbox', { name: 'Character name' }).fill('Discard me')
  await page.getByRole('navigation', { name: 'Your characters' }).getByRole('button', { name: /Lyra the Wise/ }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('navigation', { name: 'Your characters' }).getByRole('button', { name: /New Adventurer/ }).click()
  await page.getByRole('button', { name: 'Edit character details' }).click()
  await expect(dialog.getByRole('textbox', { name: 'Character name' })).toHaveValue('New Adventurer')
})

test('atributos alteram bônus derivados sem apagar ajuste manual de perícia ou salvaguarda', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  await page.getByRole('button', { name: 'Edit abilities and bonuses' }).click()
  const editor = page.getByRole('dialog', { name: 'Edit abilities and bonuses' })
  await editor.getByRole('textbox', { name: 'Arcana (INT)' }).fill('11')
  await editor.getByRole('textbox', { name: 'Arcana (INT)' }).blur()
  await editor.getByRole('textbox', { name: 'Intelligence' }).fill('9')
  await editor.getByRole('textbox', { name: 'Intelligence' }).blur()
  await editor.getByRole('textbox', { name: 'INT', exact: true }).fill('20')
  await editor.getByRole('textbox', { name: 'INT', exact: true }).blur()
  await expect(editor.getByRole('textbox', { name: 'Arcana (INT)' })).toHaveValue('12')
  await expect(editor.getByRole('textbox', { name: 'Intelligence' })).toHaveValue('10')
  await editor.getByRole('button', { name: 'Cancel' }).click()
  expect((await savedCharacter(page)).data.abilities.intelligence).toBe(18)
  await page.getByRole('button', { name: 'Edit abilities and bonuses' }).click()
  await editor.getByRole('textbox', { name: 'INT', exact: true }).fill('20')
  await editor.getByRole('textbox', { name: 'INT', exact: true }).blur()
  await editor.getByRole('button', { name: 'Save' }).click()
  await page.reload()
  const saved = (await savedCharacter(page)).data
  expect(saved.abilities.intelligence).toBe(20)
  expect(saved.rollBonuses.skills.arcana).toBe(8)
  expect(saved.rollBonuses.savingThrows.intelligence).toBe(8)
})

test('combate separa rascunho de CA/velocidade/PV máximo e PV atual imediato', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  const hp = page.getByRole('textbox', { name: 'Current hit points' })
  await hp.fill('19')
  await hp.blur()
  expect((await savedCharacter(page)).data.hitPoints.current).toBe(19)
  await page.getByRole('button', { name: 'Edit combat stats' }).click()
  const dialog = page.getByRole('dialog', { name: 'Edit combat stats' })
  await dialog.getByRole('textbox', { name: 'Armor class' }).fill('18')
  await dialog.getByRole('textbox', { name: 'Armor class' }).blur()
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  expect((await savedCharacter(page)).data.armorClass).toBe(15)
  await page.getByRole('button', { name: 'Edit combat stats' }).click()
  await dialog.getByRole('textbox', { name: 'Armor class' }).fill('18')
  await dialog.getByRole('textbox', { name: 'Armor class' }).blur()
  await dialog.getByRole('button', { name: 'Save' }).click()
  await page.reload()
  expect((await savedCharacter(page)).data.armorClass).toBe(18)
  expect((await savedCharacter(page)).data.hitPoints.current).toBe(19)
})

test('ataques e slots têm rascunho, uso imediato, reset e persistência', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  const panel = page.getByRole('region', { name: 'Attacks & Spellcasting' })
  await panel.getByRole('button', { name: 'Use level 1 spell slot' }).click()
  await expect(panel.getByLabel('Level 1 spell slots remaining')).toHaveText('1/4')
  await panel.getByRole('button', { name: 'Reset level 1 spell slots' }).click()
  await expect(panel.getByLabel('Level 1 spell slots remaining')).toHaveText('4/4')
  await panel.getByRole('button', { name: 'Edit attacks, spells, and spell slots' }).click()
  const editor = panel.getByRole('dialog', { name: 'Edit attacks, spells, and spell slots' })
  await editor.getByRole('button', { name: 'Add spell slots' }).click()
  await editor.getByLabel('Spell slot level').last().selectOption('3')
  await editor.getByRole('textbox', { name: 'Level 3 slot amount' }).fill('2')
  await editor.getByRole('textbox', { name: 'Level 3 slot amount' }).blur()
  await editor.getByLabel('Level 3 slot reset').selectOption('shortRest')
  await editor.getByRole('button', { name: 'Cancel' }).click()
  expect((await savedCharacter(page)).data.spellSlots).toHaveLength(2)
  await panel.getByRole('button', { name: 'Edit attacks, spells, and spell slots' }).click()
  await editor.getByRole('button', { name: 'Add spell slots' }).click()
  await editor.getByLabel('Spell slot level').last().selectOption('3')
  await editor.getByRole('textbox', { name: 'Level 3 slot amount' }).fill('2')
  await editor.getByRole('textbox', { name: 'Level 3 slot amount' }).blur()
  await editor.getByLabel('Level 3 slot reset').selectOption('shortRest')
  await editor.getByRole('button', { name: 'Add attack or spell' }).click()
  await editor.getByRole('textbox', { name: 'Name' }).last().fill('Magic Missile')
  await editor.getByRole('textbox', { name: 'Damage / dice' }).last().fill('3d4 + 3')
  await editor.getByRole('button', { name: 'Save' }).click()
  await page.reload()
  const saved = (await savedCharacter(page)).data
  expect(saved.spellSlots).toHaveLength(3)
  expect(saved.spellSlots[2]).toMatchObject({ level: 3, maximumSlots: 2, remainingSlots: 2, recharge: 'shortRest' })
  expect(saved.attacks[2]).toMatchObject({ name: 'Magic Missile', damageDice: '3d4 + 3' })
})

test('moedas, equipamento, habilidades, usos e notas persistem', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  const equipment = page.getByRole('region', { name: 'Equipment' })
  await equipment.getByRole('textbox', { name: 'GP' }).fill('200')
  await equipment.getByRole('textbox', { name: 'GP' }).blur()
  await equipment.getByRole('button', { name: 'Add item' }).click()
  await equipment.getByRole('textbox', { name: 'Item name' }).last().fill('Rope')
  await equipment.getByRole('textbox', { name: 'Quantity' }).last().fill('3')
  await equipment.getByRole('textbox', { name: 'Quantity' }).last().blur()
  const features = page.getByRole('region', { name: 'Features & Abilities' })
  await features.getByRole('button', { name: 'Mark Arcane Recovery as used' }).click()
  await features.getByRole('button', { name: 'Use Wand Charges' }).click()
  await features.getByRole('button', { name: 'Add ability' }).click()
  await features.getByRole('textbox', { name: 'Feature or ability name' }).fill('Second Wind')
  await features.getByRole('checkbox', { name: 'Short rest' }).check()
  await features.getByRole('spinbutton', { name: 'Number of uses' }).fill('4')
  await features.getByRole('button', { name: 'Add to sheet' }).click()
  await page.getByRole('textbox', { name: 'Notes' }).fill('A new quest')
  await page.reload()
  const saved = (await savedCharacter(page)).data
  expect(saved.currency.gp).toBe(200)
  expect(saved.equipment.at(-1)).toMatchObject({ name: 'Rope', quantity: 3 })
  expect(saved.features.find((feature: { name: string }) => feature.name === 'Arcane Recovery').used).toBe(true)
  expect(saved.features.find((feature: { name: string }) => feature.name === 'Wand Charges').remainingUses).toBe(1)
  expect(saved.features.at(-1)).toMatchObject({ name: 'Second Wind', tracking: 'uses', maximumUses: 4, recharge: 'shortRest' })
  expect(saved.notes).toBe('A new quest')
})

test('NumberInput aceita vazio temporário, ignora inválido e respeita mínimo', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  const gp = page.getByRole('region', { name: 'Equipment' }).getByRole('textbox', { name: 'GP' })
  await gp.fill('')
  await expect(gp).toHaveValue('')
  await gp.blur()
  await expect(gp).toHaveValue('126')
  await gp.fill('Infinity')
  await gp.blur()
  expect((await savedCharacter(page)).data.currency.gp).toBe(126)
  await gp.fill('1e100')
  await gp.blur()
  expect((await savedCharacter(page)).data.currency.gp).toBe(126)
  await gp.fill('-5')
  await gp.blur()
  expect((await savedCharacter(page)).data.currency.gp).toBe(0)
  const currentHp = page.getByRole('textbox', { name: 'Current hit points' })
  await currentHp.fill('-2')
  await currentHp.blur()
  expect((await savedCharacter(page)).data.hitPoints.current).toBe(-2)
})

test('sidebar longa rola, recolhe e menu mobile fecha com Escape', async ({ page }) => {
  await openDnd(page)
  for (let index = 0; index < 18; index += 1) await page.getByRole('button', { name: 'New character' }).click()
  const navigation = page.getByRole('navigation', { name: 'Your characters' })
  await expect(navigation.getByRole('button')).toHaveCount(18)
  expect(await navigation.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
  await navigation.getByRole('button').first().click()
  await navigation.getByRole('button').last().click()
  await expect(navigation.getByRole('button').last()).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible()
  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open character menu' }).click()
  await expect(page.getByRole('button', { name: 'Open character menu' })).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open character menu' })).toHaveAttribute('aria-expanded', 'false')
})

test('registro D&D inválido entra em read-error sem sobrescrever e Ordem continua utilizável', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  const invalid = JSON.stringify({ version: 1, system: 'dnd', data: { id: visualDndCharacter.id, name: 'incompleta' } })
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: recordKey(visualDndCharacter.id), raw: invalid })
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('Erro de leitura')
  await expect(page.getByRole('heading', { name: 'Lyra Emberfall' })).toHaveCount(0)
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' }).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  await expect(page.getByText('Salvo', { exact: true })).toHaveText('Salvo')
  expect(await page.evaluate((key) => localStorage.getItem(key), recordKey(visualDndCharacter.id))).toBe(invalid)
})

test('write-error em edição real mantém UI e retry salva após reload', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    window.restoreDndSetItem = () => { Storage.prototype.setItem = original }
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('rpg-fichas:v1:dnd:')) throw new DOMException('Falha simulada', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  await page.getByRole('button', { name: 'Edit character details' }).click()
  const dialog = page.getByRole('dialog', { name: 'Edit character details' })
  await dialog.getByRole('textbox', { name: 'Character name' }).fill('Lyra pendente')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('heading', { name: 'Lyra pendente' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('Erro de escrita')
  expect((await savedCharacter(page)).data.name).toBe('Lyra Emberfall')
  await page.evaluate(() => window.restoreDndSetItem?.())
  await page.getByRole('button', { name: 'Tentar salvar novamente' }).click()
  await expect(page.getByText('Salvo', { exact: true })).toHaveText('Salvo')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Lyra pendente' })).toBeVisible()
  expect((await savedCharacter(page)).data.name).toBe('Lyra pendente')
})

for (const width of [320, 390, 540, 768, 860, 1024, 1440]) {
  test(`D&D completo não tem overflow horizontal em ${width}px`, async ({ page }) => {
    await seedDnd(page)
    await page.setViewportSize({ width, height: 900 })
    await openDnd(page)
    await expect(page.getByRole('heading', { name: 'Lyra Emberfall' })).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1)
  })
}
