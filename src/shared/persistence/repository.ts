import type { CollectionSnapshot } from '../collection/types'
import { isRecord } from '../validation'
import { systemKeys } from './keys'
import type { Repository } from './types'
import { STORAGE_VERSION } from './version'

type Identified = { readonly id: string }

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isValidIndex(value: unknown, system: string): value is {
  version: number
  system: string
  characterIds: string[]
  activeCharacterId: string | null
} {
  if (!isRecord(value) || value.version !== STORAGE_VERSION || value.system !== system) return false
  if (!Array.isArray(value.characterIds) || !value.characterIds.every(isValidId)) return false
  const ids: string[] = value.characterIds
  if (new Set(ids).size !== ids.length) return false

  return value.activeCharacterId === null ||
    (isValidId(value.activeCharacterId) && ids.includes(value.activeCharacterId))
}

function sameIndex<T extends Identified>(a: CollectionSnapshot<T>, b: CollectionSnapshot<T>): boolean {
  return a.activeCharacterId === b.activeCharacterId &&
    a.characters.length === b.characters.length &&
    a.characters.every((character, index) => character.id === b.characters[index]?.id)
}

function assertSnapshot<T extends Identified>(
  snapshot: CollectionSnapshot<T>,
  isCharacter: (value: unknown) => value is T,
): void {
  const ids = snapshot.characters.map(({ id }) => id)
  if (ids.some((id) => !isValidId(id)) || new Set(ids).size !== ids.length) {
    throw new Error('A coleção contém IDs inválidos ou duplicados.')
  }
  if (snapshot.activeCharacterId !== null && !ids.includes(snapshot.activeCharacterId)) {
    throw new Error('A ficha ativa não pertence à coleção.')
  }
  if (!snapshot.characters.every(isCharacter)) {
    throw new Error('Uma ficha não passou na validação do sistema.')
  }
}

export function createRepository<T extends Identified>(
  system: string,
  isCharacter: (value: unknown) => value is T,
): Repository<T> {
  const keys = systemKeys(system)
  const touchedIds = new Set<string>()
  let previousWriteFailed = false

  return {
    load() {
      const storage = window.localStorage
      const rawIndex = storage.getItem(keys.index)
      if (rawIndex === null) {
        for (let index = 0; index < storage.length; index += 1) {
          if (storage.key(index)?.startsWith(keys.characterPrefix)) {
            throw new Error('Há registros de fichas sem índice. Os dados foram preservados.')
          }
        }
        return { characters: [], activeCharacterId: null }
      }

      const index: unknown = JSON.parse(rawIndex)
      if (!isValidIndex(index, system)) throw new Error('Índice de fichas inválido ou incompatível.')

      const characters = index.characterIds.map((id) => {
        const rawCharacter = storage.getItem(keys.character(id))
        if (rawCharacter === null) throw new Error(`Registro ausente para a ficha ${id}.`)

        const envelope: unknown = JSON.parse(rawCharacter)
        if (!isRecord(envelope) || envelope.version !== STORAGE_VERSION ||
          envelope.system !== system || !isCharacter(envelope.data) || envelope.data.id !== id) {
          throw new Error(`Registro inválido ou incompatível para a ficha ${id}.`)
        }
        return envelope.data
      })

      return { characters, activeCharacterId: index.activeCharacterId }
    },

    save(previous, next) {
      assertSnapshot(next, isCharacter)
      const storage = window.localStorage
      const before = new Map(previous.characters.map((character) => [character.id, character]))
      const after = new Set(next.characters.map((character) => character.id))
      try {
        // Guarda IDs tocados para reconciliar uma escrita parcial no próximo retry.
        for (const character of next.characters) {
          if (before.get(character.id) !== character || touchedIds.has(character.id)) {
            touchedIds.add(character.id)
            storage.setItem(keys.character(character.id), JSON.stringify({
              version: STORAGE_VERSION,
              system,
              data: character,
            }))
          }
        }

        // Publica o índice apenas depois de gravar todos os registros a que ele aponta.
        if (previousWriteFailed || !sameIndex(previous, next)) {
          storage.setItem(keys.index, JSON.stringify({
            version: STORAGE_VERSION,
            system,
            characterIds: next.characters.map(({ id }) => id),
            activeCharacterId: next.activeCharacterId,
          }))
        }

        // A exclusão vem após o índice novo, inclusive ao excluir a última ficha.
        const removed = new Set([...previous.characters.map(({ id }) => id), ...touchedIds])
        for (const id of removed) {
          if (!after.has(id)) storage.removeItem(keys.character(id))
        }
        touchedIds.clear()
        previousWriteFailed = false
      } catch (error) {
        previousWriteFailed = true
        throw error
      }
    },
  }
}
