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
  await page.getByRole('button', { name: 'Novo personagem' }).click()
  const second = JSON.parse((await page.evaluate((key) => localStorage.getItem(key), indexKey)) ?? 'null').activeCharacterId
  expect(second).not.toBe(first)
  await page.getByRole('navigation', { name: 'Seus personagens' }).getByRole('button', { name: /Novo aventureiro, Nível 1/ }).first().click()
  expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), indexKey)) ?? 'null').activeCharacterId).toBe(first)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Novo aventureiro' })).toBeVisible()
  await page.getByRole('button', { name: 'Excluir selecionado' }).click()
  await page.getByRole('group', { name: /^Excluir / }).getByRole('button', { name: 'Excluir personagem' }).click()
  expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), indexKey)) ?? 'null').activeCharacterId).toBe(second)
  await page.getByRole('button', { name: 'Excluir selecionado' }).click()
  await page.getByRole('group', { name: /^Excluir / }).getByRole('button', { name: 'Excluir personagem' }).click()
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
  await page.getByRole('button', { name: 'Editar detalhes do personagem' }).click()
  const dialog = page.getByRole('dialog', { name: 'Editar detalhes do personagem' })
  await dialog.getByRole('textbox', { name: 'Nome do personagem' }).fill('Rascunho')
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByRole('heading', { name: 'Lyra Emberfall' })).toBeVisible()
  expect((await savedCharacter(page)).data.name).toBe('Lyra Emberfall')
  await page.getByRole('button', { name: 'Editar detalhes do personagem' }).click()
  await dialog.getByRole('textbox', { name: 'Nome do personagem' }).fill('Lyra the Wise')
  await dialog.getByRole('textbox', { name: 'Classe' }).fill('Archmage')
  await dialog.getByRole('button', { name: 'Salvar' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Lyra the Wise' })).toBeVisible()
  expect((await savedCharacter(page)).data.className).toBe('Archmage')

  await page.getByRole('button', { name: 'Novo personagem' }).click()
  await page.getByRole('button', { name: 'Editar detalhes do personagem' }).click()
  await dialog.getByRole('textbox', { name: 'Nome do personagem' }).fill('Discard me')
  await page.getByRole('navigation', { name: 'Seus personagens' }).getByRole('button', { name: /Lyra the Wise/ }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('navigation', { name: 'Seus personagens' }).getByRole('button', { name: /Novo aventureiro/ }).click()
  await page.getByRole('button', { name: 'Editar detalhes do personagem' }).click()
  await expect(dialog.getByRole('textbox', { name: 'Nome do personagem' })).toHaveValue('Novo aventureiro')
})

test('atributos alteram bônus derivados sem apagar ajuste manual de perícia ou salvaguarda', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  await page.getByRole('button', { name: 'Editar atributos e bônus' }).click()
  const editor = page.getByRole('dialog', { name: 'Editar atributos e bônus' })
  await editor.getByRole('textbox', { name: 'Arcanismo (INT)' }).fill('11')
  await editor.getByRole('textbox', { name: 'Arcanismo (INT)' }).blur()
  await editor.getByRole('textbox', { name: 'Inteligência' }).fill('9')
  await editor.getByRole('textbox', { name: 'Inteligência' }).blur()
  await editor.getByRole('textbox', { name: 'INT', exact: true }).fill('20')
  await editor.getByRole('textbox', { name: 'INT', exact: true }).blur()
  await expect(editor.getByRole('textbox', { name: 'Arcanismo (INT)' })).toHaveValue('12')
  await expect(editor.getByRole('textbox', { name: 'Inteligência' })).toHaveValue('10')
  await editor.getByRole('button', { name: 'Cancelar' }).click()
  expect((await savedCharacter(page)).data.abilities.intelligence).toBe(18)
  await page.getByRole('button', { name: 'Editar atributos e bônus' }).click()
  await editor.getByRole('textbox', { name: 'INT', exact: true }).fill('20')
  await editor.getByRole('textbox', { name: 'INT', exact: true }).blur()
  await editor.getByRole('button', { name: 'Salvar' }).click()
  await page.reload()
  const saved = (await savedCharacter(page)).data
  expect(saved.abilities.intelligence).toBe(20)
  expect(saved.rollBonuses.skills.arcana).toBe(8)
  expect(saved.rollBonuses.savingThrows.intelligence).toBe(8)
})

test('combate separa rascunho de CA/velocidade/PV máximo e PV atual imediato', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  const hp = page.getByRole('textbox', { name: 'Pontos de Vida atuais' })
  await hp.fill('19')
  await hp.blur()
  expect((await savedCharacter(page)).data.hitPoints.current).toBe(19)
  await page.getByRole('button', { name: 'Editar estatísticas de combate' }).click()
  const dialog = page.getByRole('dialog', { name: 'Editar estatísticas de combate' })
  await dialog.getByRole('textbox', { name: 'Classe de Armadura' }).fill('18')
  await dialog.getByRole('textbox', { name: 'Classe de Armadura' }).blur()
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
  expect((await savedCharacter(page)).data.armorClass).toBe(15)
  await page.getByRole('button', { name: 'Editar estatísticas de combate' }).click()
  await dialog.getByRole('textbox', { name: 'Classe de Armadura' }).fill('18')
  await dialog.getByRole('textbox', { name: 'Classe de Armadura' }).blur()
  await dialog.getByRole('button', { name: 'Salvar' }).click()
  await page.reload()
  expect((await savedCharacter(page)).data.armorClass).toBe(18)
  expect((await savedCharacter(page)).data.hitPoints.current).toBe(19)
})

test('ataques e slots têm rascunho, uso imediato, reset e persistência', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  const panel = page.getByRole('region', { name: 'Ataques e Conjuração' })
  await panel.getByRole('button', { name: 'Usar Nível 1 Espaços de magia' }).click()
  await expect(panel.getByLabel('Nível 1 Espaços de magia restantes')).toHaveText('1/4')
  await panel.getByRole('button', { name: 'Restaurar Nível 1 Espaços de magia' }).click()
  await expect(panel.getByLabel('Nível 1 Espaços de magia restantes')).toHaveText('4/4')
  await panel.getByRole('button', { name: 'Editar ataques, magias e espaços de magia' }).click()
  const editor = panel.getByRole('dialog', { name: 'Editar ataques, magias e espaços de magia' })
  await editor.getByRole('button', { name: 'Adicionar espaços de magia' }).click()
  await editor.getByLabel('Nível do espaço de magia').last().selectOption('3')
  await editor.getByRole('textbox', { name: 'Nível 3 quantidade de espaços' }).fill('2')
  await editor.getByRole('textbox', { name: 'Nível 3 quantidade de espaços' }).blur()
  await editor.getByLabel('Nível 3 recuperação de espaços').selectOption('shortRest')
  await editor.getByRole('button', { name: 'Cancelar' }).click()
  expect((await savedCharacter(page)).data.spellSlots).toHaveLength(2)
  await panel.getByRole('button', { name: 'Editar ataques, magias e espaços de magia' }).click()
  await editor.getByRole('button', { name: 'Adicionar espaços de magia' }).click()
  await editor.getByLabel('Nível do espaço de magia').last().selectOption('3')
  await editor.getByRole('textbox', { name: 'Nível 3 quantidade de espaços' }).fill('2')
  await editor.getByRole('textbox', { name: 'Nível 3 quantidade de espaços' }).blur()
  await editor.getByLabel('Nível 3 recuperação de espaços').selectOption('shortRest')
  await editor.getByRole('button', { name: 'Adicionar ataque ou magia' }).click()
  await editor.getByRole('textbox', { name: 'Nome' }).last().fill('Magic Missile')
  await editor.getByRole('textbox', { name: 'Dano / dados' }).last().fill('3d4 + 3')
  await editor.getByRole('button', { name: 'Salvar' }).click()
  await page.reload()
  const saved = (await savedCharacter(page)).data
  expect(saved.spellSlots).toHaveLength(3)
  expect(saved.spellSlots[2]).toMatchObject({ level: 3, maximumSlots: 2, remainingSlots: 2, recharge: 'shortRest' })
  expect(saved.attacks[2]).toMatchObject({ name: 'Magic Missile', damageDice: '3d4 + 3' })
})

test('moedas, equipamento, habilidades, usos e notas persistem', async ({ page }) => {
  await seedDnd(page)
  await openDnd(page)
  const equipment = page.getByRole('region', { name: 'Equipamento' })
  await equipment.getByRole('textbox', { name: 'GP' }).fill('200')
  await equipment.getByRole('textbox', { name: 'GP' }).blur()
  await equipment.getByRole('button', { name: 'Adicionar item' }).click()
  await equipment.getByRole('textbox', { name: 'Nome do item' }).last().fill('Rope')
  await equipment.getByRole('textbox', { name: 'Quantidade' }).last().fill('3')
  await equipment.getByRole('textbox', { name: 'Quantidade' }).last().blur()
  const features = page.getByRole('region', { name: 'Características e Habilidades' })
  await features.getByRole('button', { name: 'Marcar Arcane Recovery como usado' }).click()
  await features.getByRole('button', { name: 'Usar Wand Charges' }).click()
  await features.getByRole('button', { name: 'Adicionar habilidade' }).click()
  await features.getByRole('textbox', { name: 'Nome da característica ou habilidade' }).fill('Second Wind')
  await features.getByRole('checkbox', { name: 'Descanso curto' }).check()
  await features.getByRole('spinbutton', { name: 'Número de usos' }).fill('4')
  await features.getByRole('button', { name: 'Adicionar à ficha' }).click()
  await page.getByRole('textbox', { name: 'Anotações' }).fill('A new quest')
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
  const gp = page.getByRole('region', { name: 'Equipamento' }).getByRole('textbox', { name: 'GP' })
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
  const currentHp = page.getByRole('textbox', { name: 'Pontos de Vida atuais' })
  await currentHp.fill('-2')
  await currentHp.blur()
  expect((await savedCharacter(page)).data.hitPoints.current).toBe(-2)
})

test('sidebar longa rola, recolhe e menu mobile fecha com Escape', async ({ page }) => {
  await openDnd(page)
  for (let index = 0; index < 18; index += 1) await page.getByRole('button', { name: 'Novo personagem' }).click()
  const navigation = page.getByRole('navigation', { name: 'Seus personagens' })
  await expect(navigation.getByRole('button')).toHaveCount(18)
  expect(await navigation.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
  await navigation.getByRole('button').first().click()
  await navigation.getByRole('button').last().click()
  await expect(navigation.getByRole('button').last()).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Recolher barra lateral' }).click()
  await expect(page.getByRole('button', { name: 'Expandir barra lateral' })).toBeVisible()
  await page.getByRole('button', { name: 'Expandir barra lateral' }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Abrir menu de personagens' }).click()
  await expect(page.getByRole('button', { name: 'Abrir menu de personagens' })).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Abrir menu de personagens' })).toHaveAttribute('aria-expanded', 'false')
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
  await page.getByRole('button', { name: 'Editar detalhes do personagem' }).click()
  const dialog = page.getByRole('dialog', { name: 'Editar detalhes do personagem' })
  await dialog.getByRole('textbox', { name: 'Nome do personagem' }).fill('Lyra pendente')
  await dialog.getByRole('button', { name: 'Salvar' }).click()
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
