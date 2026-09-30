import { expect, test, type Page } from '@playwright/test'

type System = 'dnd' | 'ordem'

declare global {
  interface Window {
    restoreStorageSetItem?: () => void
    storageCalls?: string[]
  }
}

const labels: Record<System, string> = { dnd: 'D&D', ordem: 'Ordem Paranormal' }
const indexKey = (system: System) => `rpg-fichas:v1:${system}:index`
const characterPrefix = (system: System) => `rpg-fichas:v1:${system}:character:`
const characterKey = (system: System, id: string) => `${characterPrefix(system)}${id}`

async function open(page: Page, system: System) {
  await page.goto(`/?system=${system}`)
  await expect(page.getByRole('heading', { name: labels[system], level: 2 })).toBeVisible()
}

async function create(page: Page) {
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  await expect(page.getByRole('status')).toHaveText('Salvo')
}

async function readKey(page: Page, key: string) {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), key)
}

async function seed(page: Page, entries: Record<string, string>) {
  await page.addInitScript((values) => {
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value)
  }, entries)
}

async function blockWrites(page: Page, system: System, onlyIndex = false) {
  await page.evaluate(({ prefix, index, onlyIndex }) => {
    const original = Storage.prototype.setItem
    window.restoreStorageSetItem = () => { Storage.prototype.setItem = original }
    Storage.prototype.setItem = function (key, value) {
      if (onlyIndex ? key === index : key.startsWith(prefix)) {
        throw new DOMException('Escrita bloqueada pelo teste', 'QuotaExceededError')
      }
      return original.call(this, key, value)
    }
  }, { prefix: `rpg-fichas:v1:${system}:`, index: indexKey(system), onlyIndex })
}

async function restoreWrites(page: Page) {
  await page.evaluate(() => window.restoreStorageSetItem?.())
}

function validIndex(system: System, ids: string[], active: string | null) {
  return JSON.stringify({ version: 1, system, characterIds: ids, activeCharacterId: active })
}

function validRecord(system: System, id: string) {
  return JSON.stringify({ version: 1, system, data: { id, name: 'Ficha preservada' } })
}

for (const system of ['dnd', 'ordem'] as const) {
  test(`${system}: cria, seleciona, edita, exclui e recarrega com zero fichas`, async ({ page }) => {
    await open(page, system)
    await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
    expect(await readKey(page, indexKey(system))).toBeNull()

    await create(page)
    await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Alpha')
    const recordKeys = await page.evaluate((prefix) =>
      Object.keys(localStorage).filter((key) => key.startsWith(prefix)), characterPrefix(system))
    expect(recordKeys).toHaveLength(1)
    const firstId = recordKeys[0]?.slice(characterPrefix(system).length)
    expect(firstId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(JSON.parse((await readKey(page, indexKey(system))) ?? 'null')).toEqual({
      version: 1, system, characterIds: [firstId], activeCharacterId: firstId,
    })
    expect(JSON.parse((await readKey(page, recordKeys[0])) ?? 'null')).toEqual({
      version: 1, system, data: { id: firstId, name: 'Alpha' },
    })

    await create(page)
    await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Beta')
    const list = page.getByRole('list', { name: `Fichas de ${labels[system]}` })
    await expect(list.getByRole('listitem')).toHaveCount(2)
    await list.getByRole('button', { name: 'Alpha', exact: true }).click()
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Alpha')
    await page.reload()
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Alpha')

    await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Alpha editada')
    await page.reload()
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Alpha editada')
    await list.getByRole('button', { name: 'Excluir Beta' }).click()
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Alpha editada')
    await expect(list.getByRole('listitem')).toHaveCount(1)

    await create(page)
    await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Gamma')
    await list.getByRole('button', { name: 'Alpha editada', exact: true }).click()
    await list.getByRole('button', { name: 'Excluir Alpha editada' }).click()
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Gamma')
    await list.getByRole('button', { name: 'Excluir Gamma' }).click()
    await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveCount(0)
    expect(JSON.parse((await readKey(page, indexKey(system))) ?? 'null')).toEqual({
      version: 1, system, characterIds: [], activeCharacterId: null,
    })
    await page.reload()
    await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
  })

  test(`${system}: ao excluir a última ativa escolhe a anterior`, async ({ page }) => {
    await open(page, system)
    await create(page)
    await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Primeira')
    await create(page)
    await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Última')
    await page.getByRole('button', { name: 'Excluir Última' }).click()
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Primeira')
  })
}

test('coleções, chaves e estados são independentes ao trocar e recarregar', async ({ page }) => {
  await open(page, 'dnd')
  await create(page)
  await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Herói D&D')
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
    .getByRole('button', { name: 'Ordem Paranormal' }).click()
  await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
  await create(page)
  await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Agente Ordem')
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Agente Ordem')
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
    .getByRole('button', { name: 'D&D' }).click()
  await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Herói D&D')
  expect(await readKey(page, indexKey('dnd'))).not.toBeNull()
  expect(await readKey(page, indexKey('ordem'))).not.toBeNull()
  const keys = await page.evaluate(() => Object.keys(localStorage))
  expect(keys.filter((key) => key.startsWith(characterPrefix('dnd')))).toHaveLength(1)
  expect(keys.filter((key) => key.startsWith(characterPrefix('ordem')))).toHaveLength(1)
})

const corruptCases: { name: string; entries: Record<string, string> }[] = [
  { name: 'JSON inválido no índice', entries: { [indexKey('dnd')]: '{' } },
  { name: 'JSON inválido no registro', entries: {
    [indexKey('dnd')]: validIndex('dnd', ['abc'], 'abc'), [characterKey('dnd', 'abc')]: '{',
  } },
  { name: 'versão desconhecida no índice', entries: {
    [indexKey('dnd')]: JSON.stringify({ version: 999, system: 'dnd', characterIds: [], activeCharacterId: null }),
  } },
  { name: 'versão desconhecida no registro', entries: {
    [indexKey('dnd')]: validIndex('dnd', ['abc'], 'abc'),
    [characterKey('dnd', 'abc')]: JSON.stringify({ version: 999, system: 'dnd', data: { id: 'abc', name: 'A' } }),
  } },
  { name: 'registro ausente', entries: { [indexKey('dnd')]: validIndex('dnd', ['abc'], 'abc') } },
  { name: 'índice ausente com registro órfão', entries: {
    [characterKey('dnd', 'abc')]: validRecord('dnd', 'abc'),
  } },
  { name: 'IDs duplicados', entries: {
    [indexKey('dnd')]: validIndex('dnd', ['abc', 'abc'], 'abc'), [characterKey('dnd', 'abc')]: validRecord('dnd', 'abc'),
  } },
  { name: 'sistema errado no registro', entries: {
    [indexKey('dnd')]: validIndex('dnd', ['abc'], 'abc'),
    [characterKey('dnd', 'abc')]: validRecord('ordem', 'abc'),
  } },
  { name: 'sistema errado no índice', entries: {
    [indexKey('dnd')]: validIndex('ordem', [], null),
  } },
  { name: 'ID do registro diferente da key', entries: {
    [indexKey('dnd')]: validIndex('dnd', ['abc'], 'abc'), [characterKey('dnd', 'abc')]: validRecord('dnd', 'def'),
  } },
  { name: 'payload inválido', entries: {
    [indexKey('dnd')]: validIndex('dnd', ['abc'], 'abc'),
    [characterKey('dnd', 'abc')]: JSON.stringify({ version: 1, system: 'dnd', data: { id: 'abc' } }),
  } },
  { name: 'seleção fora do índice', entries: {
    [indexKey('dnd')]: validIndex('dnd', ['abc'], 'def'), [characterKey('dnd', 'abc')]: validRecord('dnd', 'abc'),
  } },
]

for (const scenario of corruptCases) {
  test(`dados inválidos: ${scenario.name} causam read-error sem sobrescrita`, async ({ page }) => {
    await seed(page, scenario.entries)
    await open(page, 'dnd')
    await expect(page.getByRole('alert')).toContainText('Erro de leitura')
    await expect(page.getByRole('button', { name: 'Criar ficha' })).toHaveCount(0)
    for (const [key, value] of Object.entries(scenario.entries)) {
      expect(await readKey(page, key)).toBe(value)
    }
    expect(await page.evaluate(() => Object.keys(localStorage).length)).toBe(Object.keys(scenario.entries).length)
  })
}

test('retryLoad lê novamente após correção manual e não apaga o outro sistema', async ({ page }) => {
  await seed(page, { [indexKey('dnd')]: '{' })
  await open(page, 'dnd')
  await expect(page.getByRole('alert')).toContainText('Erro de leitura')
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
    .getByRole('button', { name: 'Ordem Paranormal' }).click()
  await create(page)
  await page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
    .getByRole('button', { name: 'D&D' }).click()
  expect(await readKey(page, indexKey('dnd'))).toBe('{')
  await page.evaluate((key) => localStorage.removeItem(key), indexKey('dnd'))
  await page.getByRole('button', { name: 'Tentar ler novamente' }).click()
  await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('Salvo')
  expect(await readKey(page, indexKey('ordem'))).not.toBeNull()
})

for (const failing of ['dnd', 'ordem'] as const) {
  const other: System = failing === 'dnd' ? 'ordem' : 'dnd'
  test(`${failing}: write-error preserva memória, retry usa última edição e ${other} continua salvo`, async ({ page }) => {
    await open(page, failing)
    await create(page)
    const index = JSON.parse((await readKey(page, indexKey(failing))) ?? 'null')
    const id = index.characterIds[0]
    const originalRecord = await readKey(page, characterKey(failing, id))
    await blockWrites(page, failing)
    await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Edição A')
    await expect(page.getByRole('status')).toContainText('Erro de escrita')
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Edição A')
    expect(await readKey(page, characterKey(failing, id))).toBe(originalRecord)
    expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(false)

    await page.getByRole('button', { name: 'Criar ficha' }).click()
    await page.getByRole('textbox', { name: 'Nome da ficha ativa' }).fill('Edição B')
    await page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
      .getByRole('button', { name: labels[other] }).click()
    await create(page)
    await expect(page.getByRole('status')).toHaveText('Salvo')
    await page.getByRole('navigation', { name: 'Trocar sistema de RPG' })
      .getByRole('button', { name: labels[failing] }).click()
    await expect(page.getByRole('textbox', { name: 'Nome da ficha ativa' })).toHaveValue('Edição B')
    await restoreWrites(page)
    await page.getByRole('button', { name: 'Tentar salvar novamente' }).click()
    await expect(page.getByRole('status')).toHaveText('Salvo')
    expect(JSON.parse((await readKey(page, characterKey(failing, id))) ?? 'null')).toEqual({
      version: 1, system: failing, data: { id, name: 'Edição A' },
    })
    const savedIndex = JSON.parse((await readKey(page, indexKey(failing))) ?? 'null')
    expect(savedIndex.characterIds).toHaveLength(2)
    expect(JSON.parse((await readKey(page, characterKey(failing, savedIndex.activeCharacterId))) ?? 'null'))
      .toEqual({ version: 1, system: failing, data: { id: savedIndex.activeCharacterId, name: 'Edição B' } })
    expect(await page.evaluate(() => window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true)
  })
}

test('falha parcial no índice é reconciliada mesmo após criar e excluir antes do retry', async ({ page }) => {
  await open(page, 'dnd')
  await blockWrites(page, 'dnd', true)
  await page.getByRole('button', { name: 'Criar ficha' }).click()
  await expect(page.getByRole('status')).toContainText('Erro de escrita')
  expect(await readKey(page, indexKey('dnd'))).toBeNull()
  expect(await page.evaluate((prefix) => Object.keys(localStorage).filter((key) => key.startsWith(prefix)).length,
    characterPrefix('dnd'))).toBe(1)
  await page.getByRole('button', { name: 'Excluir Nova ficha de D&D' }).click()
  await expect(page.getByText('Nenhuma ficha criada.')).toBeVisible()
  await restoreWrites(page)
  await page.getByRole('button', { name: 'Tentar salvar novamente' }).click()
  await expect(page.getByRole('status')).toHaveText('Salvo')
  expect(JSON.parse((await readKey(page, indexKey('dnd'))) ?? 'null')).toEqual({
    version: 1, system: 'dnd', characterIds: [], activeCharacterId: null,
  })
  expect(await page.evaluate((prefix) => Object.keys(localStorage).filter((key) => key.startsWith(prefix)).length,
    characterPrefix('dnd'))).toBe(0)
})

test('grava registros antes do índice e remove registros depois dele', async ({ page }) => {
  await open(page, 'dnd')
  await page.evaluate(() => {
    window.storageCalls = []
    const setItem = Storage.prototype.setItem
    const removeItem = Storage.prototype.removeItem
    Storage.prototype.setItem = function (key, value) {
      window.storageCalls?.push(`set:${key}`)
      return setItem.call(this, key, value)
    }
    Storage.prototype.removeItem = function (key) {
      window.storageCalls?.push(`remove:${key}`)
      return removeItem.call(this, key)
    }
  })
  await create(page)
  const index = JSON.parse((await readKey(page, indexKey('dnd'))) ?? 'null')
  const recordKey = characterKey('dnd', index.activeCharacterId)
  expect(await page.evaluate(() => window.storageCalls)).toEqual([
    `set:${recordKey}`, `set:${indexKey('dnd')}`,
  ])
  await page.evaluate(() => { window.storageCalls = [] })
  await page.getByRole('button', { name: 'Excluir Nova ficha de D&D' }).click()
  expect(await page.evaluate(() => window.storageCalls)).toEqual([
    `set:${indexKey('dnd')}`, `remove:${recordKey}`,
  ])
})
