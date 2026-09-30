import type { CollectionSnapshot } from '../collection/types'

export interface Repository<T extends { readonly id: string }> {
  load(): CollectionSnapshot<T>
  save(previous: CollectionSnapshot<T>, next: CollectionSnapshot<T>): void
}
