import { useEffect, useRef, useState } from 'react'
import type { Repository } from '../persistence/types'
import type { CollectionSnapshot, PersistenceStatus } from './types'

type Identified = { readonly id: string }

type CollectionState<T extends Identified> = {
  snapshot: CollectionSnapshot<T> | null
  status: PersistenceStatus
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

function initialState<T extends Identified>(repository: Repository<T>): CollectionState<T> {
  try {
    return { snapshot: repository.load(), status: { type: 'saved' } }
  } catch (error) {
    return { snapshot: null, status: { type: 'read-error', error: asError(error) } }
  }
}

export function useCharacterCollection<T extends Identified>(
  repository: Repository<T>,
  createCharacter: () => T,
) {
  const [state, setState] = useState<CollectionState<T>>(() => initialState(repository))
  const current = useRef(state)
  const persisted = useRef(state.snapshot)

  // O listener observa um ref atualizado de forma síncrona pelas ações.
  // Não há efeito observando state para salvar no storage.
  useEffect(() => {
    function warnOnUnload(event: BeforeUnloadEvent) {
      if (current.current.status.type !== 'write-error') return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warnOnUnload)
    return () => window.removeEventListener('beforeunload', warnOnUnload)
  }, [])

  function publish(next: CollectionState<T>) {
    current.current = next
    setState(next)
  }

  function save(previous: CollectionSnapshot<T>, snapshot: CollectionSnapshot<T>) {
    try {
      repository.save(previous, snapshot)
      persisted.current = snapshot
      publish({ snapshot, status: { type: 'saved' } })
    } catch (error) {
      publish({ snapshot, status: { type: 'write-error', error: asError(error) } })
    }
  }

  function commit(nextSnapshot: CollectionSnapshot<T>) {
    const previous = persisted.current
    if (previous === null || current.current.status.type === 'read-error') return

    publish({ snapshot: nextSnapshot, status: current.current.status })
    save(previous, nextSnapshot)
  }

  function create() {
    const snapshot = current.current.snapshot
    if (snapshot === null) return
    const character = createCharacter()
    if (typeof character.id !== 'string' || character.id.length === 0 ||
      snapshot.characters.some(({ id }) => id === character.id)) {
      throw new Error('A fábrica gerou um ID inválido ou já existente.')
    }
    commit({
      characters: [...snapshot.characters, character],
      activeCharacterId: character.id,
    })
  }

  function select(id: string) {
    const snapshot = current.current.snapshot
    if (snapshot === null || snapshot.activeCharacterId === id ||
      !snapshot.characters.some((character) => character.id === id)) return
    commit({ ...snapshot, activeCharacterId: id })
  }

  function updateActive(update: (character: T) => T) {
    const snapshot = current.current.snapshot
    if (snapshot === null || snapshot.activeCharacterId === null) return
    const index = snapshot.characters.findIndex(({ id }) => id === snapshot.activeCharacterId)
    if (index < 0) return
    const oldCharacter = snapshot.characters[index]
    const newCharacter = update(oldCharacter)
    if (newCharacter.id !== oldCharacter.id) throw new Error('Uma atualização não pode alterar o ID.')
    if (newCharacter === oldCharacter) return
    const characters = [...snapshot.characters]
    characters[index] = newCharacter
    commit({ ...snapshot, characters })
  }

  function remove(id: string) {
    const snapshot = current.current.snapshot
    if (snapshot === null) return
    const index = snapshot.characters.findIndex((character) => character.id === id)
    if (index < 0) return
    const characters = snapshot.characters.filter((character) => character.id !== id)
    // Ao excluir a ativa: próxima ficha na ordem, ou a anterior se era a última.
    const activeCharacterId = snapshot.activeCharacterId === id
      ? (characters[index] ?? characters[index - 1])?.id ?? null
      : snapshot.activeCharacterId
    commit({ characters, activeCharacterId })
  }

  function retry() {
    if (current.current.status.type !== 'write-error' || current.current.snapshot === null) return
    const snapshot = current.current.snapshot
    const previous = persisted.current
    if (previous === null) return
    save(previous, snapshot)
  }

  function retryLoad() {
    if (current.current.status.type !== 'read-error') return
    try {
      const snapshot = repository.load()
      persisted.current = snapshot
      publish({ snapshot, status: { type: 'saved' } })
    } catch (error) {
      publish({ snapshot: null, status: { type: 'read-error', error: asError(error) } })
    }
  }

  return {
    snapshot: state.snapshot,
    activeCharacter: state.snapshot?.characters.find(({ id }) => id === state.snapshot?.activeCharacterId) ?? null,
    status: state.status,
    create,
    select,
    updateActive,
    remove,
    retry,
    retryLoad,
  }
}
