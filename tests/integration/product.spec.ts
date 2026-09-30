import { expect, test, type Page } from '@playwright/test'
import { createDefaultDndCharacter } from '../../src/systems/dnd/defaults'
import { isDndCharacter } from '../../src/systems/dnd/validation'
import { createDefaultOrdemCharacter } from '../../src/systems/ordem/defaults'
import { isOrdemCharacter } from '../../src/systems/ordem/validation'

declare global {
  interface Window {
    restoreProductSetItem?: () => void
    productStorageCalls?: string[]
    unblockProductSystem?: (system: 'dnd' | 'ordem') => void
  }
}

const switcher = (page: Page) => page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
const dndIndex = 'rpg-fichas:v1:dnd:index'
const ordemIndex = 'rpg-fichas:v1:ordem:index'
const record = (system: 'dnd' | 'ordem', id: string) => `rpg-fichas:v1:${system}:character:${id}`

async function createDnd(page: Page) { await page.getByRole('button', { name: 'New character' }).click() }
async function createOrdem(page: Page) {
  const empty = page.getByRole('button', { name: 'Criar ficha' })
  if (await empty.count()) await empty.click()
  else await page.getByRole('button', { name: 'Novo agente', exact: true }).click()
}
async function renameDnd(page: Page, name: string) {
  await page.getByRole('button', { name: 'Edit character details' }).click()
  const dialog = page.getByRole('dialog', { name: 'Edit character details' })
  await dialog.getByRole('textbox', { name: 'Character name' }).fill(name)
  await dialog.getByRole('button', { name: 'Save' }).click()
}
async function renameOrdem(page: Page, name: string) {
  await page.getByRole('button', { name: 'Editar informações básicas' }).click()
  const dialog = page.getByRole('dialog', { name: 'Editar informações básicas' })
  await dialog.getByRole('textbox', { name: 'Nome do personagem' }).fill(name)
  await dialog.getByRole('button', { name: 'Salvar' }).click()
}
async function index(page: Page, key: string) { return page.evaluate((value) => JSON.parse(localStorage.getItem(value) ?? 'null'), key) }

test('jornada do produto mantém coleções, conteúdo e seleção independentes até excluir a última ficha', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Escolha um sistema de RPG' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.getByRole('button', { name: 'D&D' }).click()
  await createDnd(page); await renameDnd(page, 'Character A')
  await page.getByRole('textbox', { name: 'Notes' }).fill('Mapa antigo')
  await createDnd(page); await renameDnd(page, 'Character B')
  const dndBefore = await index(page, dndIndex)
  expect(dndBefore.characterIds).toHaveLength(2)
  expect(dndBefore.activeCharacterId).toBe(dndBefore.characterIds[1])

  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
  await createOrdem(page); await renameOrdem(page, 'Agente X')
  await page.getByRole('textbox', { name: 'Anotações' }).fill('Pista principal')
  await createOrdem(page); await renameOrdem(page, 'Agente Y')
  await page.getByRole('navigation', { name: 'Seus agentes' }).getByRole('button', { name: /Agente X/ }).click()
  const ordemBefore = await index(page, ordemIndex)
  expect(ordemBefore.characterIds).toHaveLength(2)
  expect(ordemBefore.activeCharacterId).toBe(ordemBefore.characterIds[0])

  await switcher(page).getByRole('button', { name: 'D&D' }).click()
  await expect(page.getByRole('heading', { name: 'Character B' })).toBeVisible()
  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByRole('heading', { name: 'Agente X' })).toBeVisible()
  await switcher(page).getByRole('button', { name: 'D&D' }).click()
  await expect(page.getByRole('heading', { name: 'Character B' })).toBeVisible()
  await page.reload()
  expect(await index(page, dndIndex)).toEqual(dndBefore)
  expect(await index(page, ordemIndex)).toEqual(ordemBefore)
  const payloads = await page.evaluate(({ dndId, ordemId }) => ({
    dnd: JSON.parse(localStorage.getItem(`rpg-fichas:v1:dnd:character:${dndId}`) ?? 'null').data,
    ordem: JSON.parse(localStorage.getItem(`rpg-fichas:v1:ordem:character:${ordemId}`) ?? 'null').data,
    keys: Object.keys(localStorage).sort(),
  }), { dndId: dndBefore.characterIds[0], ordemId: ordemBefore.characterIds[0] })
  expect(payloads.dnd.notes).toBe('Mapa antigo')
  expect(payloads.ordem.notes).toBe('Pista principal')
  expect(payloads.dnd).not.toHaveProperty('basicInfo')
  expect(payloads.dnd).not.toHaveProperty('rituals')
  expect(payloads.ordem).not.toHaveProperty('spellSlots')
  expect(payloads.ordem).not.toHaveProperty('rollBonuses')
  expect(payloads.keys).toEqual([
    dndIndex, ...dndBefore.characterIds.map((id: string) => record('dnd', id)),
    ordemIndex, ...ordemBefore.characterIds.map((id: string) => record('ordem', id)),
  ].sort())

  for (let count = 0; count < 2; count++) {
    await page.getByRole('button', { name: 'Delete selected' }).click()
    await page.getByRole('group', { name: /^Delete / }).getByRole('button', { name: 'Delete character' }).click()
  }
  await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
  expect(await index(page, dndIndex)).toMatchObject({ characterIds: [], activeCharacterId: null })
  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByRole('heading', { name: 'Agente X' })).toBeVisible()
  expect(await index(page, ordemIndex)).toEqual(ordemBefore)
})

test('histórico sincroniza chooser, sistemas e hash de Ordem', async ({ page }) => {
  await page.goto('/?mode=preview&system=invalid#section')
  await expect(page).toHaveURL(/\?mode=preview#section$/)
  await page.getByRole('button', { name: 'D&D' }).click()
  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await createOrdem(page)
  await page.getByRole('navigation', { name: 'Seções da ficha' }).getByRole('link', { name: /Inventário/ }).click()
  await expect(page).toHaveURL(/system=ordem#inventario$/)
  await switcher(page).getByRole('button', { name: 'D&D' }).click()
  await expect(page).toHaveURL(/system=dnd$/)
  await page.goBack()
  await expect(page).toHaveURL(/system=ordem#inventario$/)
  await expect(page.getByRole('region', { name: 'Ordem Paranormal' })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/system=ordem$/)
  await page.goBack()
  await expect(page).toHaveURL(/system=dnd$/)
  await page.goForward()
  await expect(page).toHaveURL(/system=ordem$/)
  expect((await index(page, ordemIndex)).characterIds).toHaveLength(1)
})

test('menu móvel não reabre ao voltar ao sistema e devolve foco ao gatilho', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('/')
  await page.getByRole('button', { name: 'D&D' }).click()
  const openDnd = page.getByRole('button', { name: 'Open character menu' })
  await openDnd.click()
  await expect(page.getByRole('button', { name: 'Close character menu' }).first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(openDnd).toBeFocused()
  await openDnd.click()
  await page.setViewportSize({ width: 768, height: 800 })
  await expect(page.locator('#dnd-character-sidebar')).toHaveAttribute('data-mobile-open', 'false')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goBack()
  await page.goForward()
  await expect(openDnd).toHaveAttribute('aria-expanded', 'false')
  await openDnd.click()
  await page.getByRole('button', { name: 'New character' }).click()
  await expect(openDnd).toBeFocused()
  await expect(openDnd).toHaveAttribute('aria-expanded', 'false')
  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  const openOrdem = page.getByRole('button', { name: 'Abrir menu de personagens' })
  await createOrdem(page)
  await openOrdem.click()
  await expect(page.getByRole('button', { name: 'Fechar menu de personagens' }).first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(openOrdem).toBeFocused()
  await openOrdem.click()
  await page.getByRole('navigation', { name: 'Seus agentes' }).getByRole('button').first().click()
  await expect(openOrdem).toBeFocused()
  await openOrdem.click()
  await page.setViewportSize({ width: 768, height: 800 })
  await expect(page.locator('#ordem-character-sidebar')).toHaveAttribute('data-mobile-open', 'false')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('confirmação de exclusão aceita Escape e restaura foco sem excluir', async ({ page }) => {
  await page.goto('/?system=dnd'); await createDnd(page)
  const remove = page.getByRole('button', { name: 'Delete selected' })
  await remove.click()
  await expect(page.getByRole('group', { name: /^Delete / }).getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(remove).toBeFocused()
  expect((await index(page, dndIndex)).characterIds).toHaveLength(1)
  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await createOrdem(page)
  const removeOrdem = page.getByRole('button', { name: 'Excluir selecionado' })
  await removeOrdem.click()
  await expect(page.getByRole('group', { name: /^Excluir / }).getByRole('button', { name: 'Cancelar' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(removeOrdem).toBeFocused()
})

test('factories dos dois sistemas produzem IDs distintos e fichas aceitas pelos validators', () => {
  const dndA = createDefaultDndCharacter()
  const dndB = createDefaultDndCharacter()
  const ordemA = createDefaultOrdemCharacter()
  const ordemB = createDefaultOrdemCharacter()
  expect(isDndCharacter(dndA)).toBe(true)
  expect(isDndCharacter(dndB)).toBe(true)
  expect(isOrdemCharacter(ordemA)).toBe(true)
  expect(isOrdemCharacter(ordemB)).toBe(true)
  expect(new Set([dndA.id, dndB.id, ordemA.id, ordemB.id]).size).toBe(4)
})

test('editores de identidade devolvem foco ao botão após salvar e cancelar', async ({ page }) => {
  await page.goto('/?system=dnd')
  await createDnd(page)
  const editDnd = page.getByRole('button', { name: 'Edit character details' })
  await editDnd.click()
  await page.getByRole('dialog', { name: 'Edit character details' }).getByRole('button', { name: 'Cancel' }).click()
  await expect(editDnd).toBeFocused()
  await editDnd.click()
  await page.getByRole('dialog', { name: 'Edit character details' }).getByRole('button', { name: 'Save' }).click()
  await expect(editDnd).toBeFocused()
  await editDnd.click()
  await page.getByRole('dialog', { name: 'Edit character details' }).getByRole('textbox', { name: 'Character name' }).press('Escape')
  await expect(editDnd).toBeFocused()

  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await createOrdem(page)
  const editOrdem = page.getByRole('button', { name: 'Editar informações básicas' })
  await editOrdem.click()
  await page.getByRole('dialog', { name: 'Editar informações básicas' }).getByRole('button', { name: 'Cancelar' }).click()
  await expect(editOrdem).toBeFocused()
  await editOrdem.click()
  await page.getByRole('dialog', { name: 'Editar informações básicas' }).getByRole('button', { name: 'Salvar' }).click()
  await expect(editOrdem).toBeFocused()
  await editOrdem.click()
  await page.getByRole('dialog', { name: 'Editar informações básicas' }).getByRole('textbox', { name: 'Nome do personagem' }).press('Escape')
  await expect(editOrdem).toBeFocused()
})

for (const system of ['dnd', 'ordem'] as const) {
  test(`${system}: retry repetido mantém erro isolado e depois salva snapshot atual`, async ({ page }) => {
    await page.goto(`/?system=${system}`)
    if (system === 'dnd') await createDnd(page)
    else await createOrdem(page)
    await page.evaluate((blockedSystem) => {
      const original = Storage.prototype.setItem
      const prefix = `rpg-fichas:v1:${blockedSystem}:`
      window.restoreProductSetItem = () => { Storage.prototype.setItem = original }
      Storage.prototype.setItem = function (key, value) {
        if (key.startsWith(prefix)) throw new DOMException('Falha simulada', 'QuotaExceededError')
        return original.call(this, key, value)
      }
    }, system)
    if (system === 'dnd') await renameDnd(page, 'Pendente')
    else await renameOrdem(page, 'Pendente')
    const retry = page.getByRole('button', { name: 'Tentar salvar novamente' })
    for (let attempt = 0; attempt < 2; attempt++) {
      await retry.click()
      await expect(retry).toBeVisible()
      await expect(page.getByRole('alert')).toContainText('As alterações continuam nesta sessão')
      expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(false)
    }
    await switcher(page).getByRole('button', { name: system === 'dnd' ? 'Ordem Paranormal' : 'D&D' }).click()
    if (system === 'dnd') await createOrdem(page)
    else await createDnd(page)
    await expect(page.locator('p[role=status]')).toHaveText('Salvo')
    await switcher(page).getByRole('button', { name: system === 'dnd' ? 'D&D' : 'Ordem Paranormal' }).click()
    await expect(page.getByRole('heading', { name: 'Pendente' })).toBeVisible()
    await page.evaluate(() => window.restoreProductSetItem?.())
    await retry.click()
    await expect(page.locator('p[role=status]')).toHaveText('Salvo')
    expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Pendente' })).toBeVisible()
  })
}

test('Ordem grava registro antes do índice e remove somente após atualizar o índice', async ({ page }) => {
  await page.goto('/?system=ordem')
  await page.evaluate(() => {
    window.productStorageCalls = []
    const setItem = Storage.prototype.setItem
    const removeItem = Storage.prototype.removeItem
    Storage.prototype.setItem = function (key, value) {
      window.productStorageCalls?.push(`set:${key}`)
      return setItem.call(this, key, value)
    }
    Storage.prototype.removeItem = function (key) {
      window.productStorageCalls?.push(`remove:${key}`)
      return removeItem.call(this, key)
    }
  })
  await createOrdem(page)
  const id = (await index(page, ordemIndex)).activeCharacterId as string
  const characterKey = record('ordem', id)
  expect(await page.evaluate(() => window.productStorageCalls)).toEqual([
    `set:${characterKey}`, `set:${ordemIndex}`,
  ])
  await page.evaluate(() => { window.productStorageCalls = [] })
  await renameOrdem(page, 'Alterado')
  expect(await page.evaluate(() => window.productStorageCalls)).toEqual([`set:${characterKey}`])
  await page.evaluate(() => { window.productStorageCalls = [] })
  await page.getByRole('button', { name: 'Excluir selecionado' }).click()
  await page.getByRole('group', { name: /^Excluir / }).getByRole('button', { name: 'Excluir agente' }).click()
  expect(await page.evaluate(() => window.productStorageCalls)).toEqual([
    `set:${ordemIndex}`, `remove:${characterKey}`,
  ])
  expect(await index(page, ordemIndex)).toEqual({
    version: 1, system: 'ordem', characterIds: [], activeCharacterId: null,
  })
})

test('NumberInput preserva edição vazia, limites, step inteiro e decimal nos dois sistemas', async ({ page }) => {
  await page.goto('/?system=dnd')
  await createDnd(page)
  const gp = page.getByRole('region', { name: 'Equipment' }).getByRole('textbox', { name: 'GP' })
  await gp.fill('2.6')
  await gp.press('Enter')
  await expect(gp).toHaveValue('3')
  await gp.fill('')
  await expect(gp).toHaveValue('')
  await gp.blur()
  await expect(gp).toHaveValue('3')
  await gp.fill('8')
  await gp.press('Escape')
  await expect(gp).toHaveValue('3')
  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await createOrdem(page)
  await page.getByRole('button', { name: 'Editar informações básicas' }).click()
  const nex = page.getByRole('textbox', { name: 'NEX (%)' })
  await nex.fill('120')
  await nex.press('Enter')
  await expect(nex).toHaveValue('100')
  await nex.fill('-4')
  await nex.blur()
  await expect(nex).toHaveValue('0')
  await nex.fill('13.6')
  await nex.press('Enter')
  await expect(nex).toHaveValue('14')
  await page.getByRole('dialog', { name: 'Editar informações básicas' }).getByRole('button', { name: 'Salvar' }).click()
  await page.getByRole('button', { name: 'Editar inventário' }).click()
  const maximumLoad = page.getByRole('textbox', { name: 'Carga máxima' })
  await maximumLoad.fill('2.25')
  await maximumLoad.press('Enter')
  await expect(maximumLoad).toHaveValue('2.25')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await page.reload()
  await expect(page.getByRole('region', { name: 'Ordem Paranormal' }).getByText('14% NEX').last()).toBeVisible()
  await expect(page.getByText('0 / 2.25')).toBeVisible()
})

test('hook impede mudança de ID nos modelos reais de D&D e Ordem', async ({ page }) => {
  await page.goto('/')
  await page.addScriptTag({ type: 'module', content:
    "import { mountIdInvariantHarness } from '/tests/fixtures/idInvariantMount.tsx'; mountIdInvariantHarness()" })
  for (const [name, system] of [['D&D ID probe', 'probe-dnd'], ['Ordem ID probe', 'probe-ordem']] as const) {
    const probe = page.getByRole('region', { name })
    await probe.getByRole('button', { name: 'Create' }).click()
    const before = await index(page, `rpg-fichas:v1:${system}:index`)
    await probe.getByRole('button', { name: 'Change ID' }).click()
    await expect(probe.getByText('blocked')).toBeVisible()
    expect(await index(page, `rpg-fichas:v1:${system}:index`)).toEqual(before)
    expect(before.activeCharacterId).not.toBe('tampered')
    expect(await page.evaluate((key) => localStorage.getItem(key),
      `rpg-fichas:v1:${system}:character:tampered`)).toBeNull()
  }
})

test('troca de sistema mantém sidebar recolhida e descarta rascunhos não confirmados', async ({ page }) => {
  await page.goto('/?system=dnd')
  await createDnd(page)
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible()
  await page.getByRole('button', { name: 'Edit character details' }).click()
  await page.getByRole('dialog', { name: 'Edit character details' })
    .getByRole('textbox', { name: 'Character name' }).fill('Rascunho D&D')
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true)
  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await createOrdem(page)
  await page.getByRole('button', { name: 'Editar informações básicas' }).click()
  await page.getByRole('dialog', { name: 'Editar informações básicas' })
    .getByRole('textbox', { name: 'Nome do personagem' }).fill('Rascunho Ordem')
  await switcher(page).getByRole('button', { name: 'D&D' }).click()
  await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Edit character details' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'New Adventurer' })).toBeVisible()
  await switcher(page).getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByRole('dialog', { name: 'Editar informações básicas' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Novo agente' })).toBeVisible()
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true)
})

test('beforeunload continua ativo até os dois sistemas pendentes serem salvos', async ({ page }) => {
  await page.goto('/?system=dnd')
  await createDnd(page)
  const switcher = page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
  await switcher.getByRole('button', { name: 'Ordem Paranormal' }).click()
  await createOrdem(page)
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    const blocked = new Set(['dnd', 'ordem'])
    window.unblockProductSystem = (system) => { blocked.delete(system) }
    window.restoreProductSetItem = () => { Storage.prototype.setItem = original }
    Storage.prototype.setItem = function (key, value) {
      if ([...blocked].some((system) => key.startsWith(`rpg-fichas:v1:${system}:`))) {
        throw new DOMException('Falha simulada', 'QuotaExceededError')
      }
      return original.call(this, key, value)
    }
  })
  await renameOrdem(page, 'Ordem pendente')
  await switcher.getByRole('button', { name: 'D&D' }).click()
  await renameDnd(page, 'D&D pendente')
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(false)
  await page.evaluate(() => window.unblockProductSystem?.('dnd'))
  await page.getByRole('button', { name: 'Tentar salvar novamente' }).click()
  await expect(page.locator('p[role=status]')).toHaveText('Salvo')
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(false)
  await switcher.getByRole('button', { name: 'Ordem Paranormal' }).click()
  await page.evaluate(() => window.unblockProductSystem?.('ordem'))
  await page.getByRole('button', { name: 'Tentar salvar novamente' }).click()
  await expect(page.locator('p[role=status]')).toHaveText('Salvo')
  expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true)
  await page.evaluate(() => window.restoreProductSetItem?.())
})
