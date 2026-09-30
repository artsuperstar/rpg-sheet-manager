export type CollectionSnapshot<T extends { readonly id: string }> = {
  characters: T[]
  activeCharacterId: string | null
}

export type PersistenceStatus =
  | { type: 'saved' }
  | { type: 'write-error'; error: Error }
  | { type: 'read-error'; error: Error }
