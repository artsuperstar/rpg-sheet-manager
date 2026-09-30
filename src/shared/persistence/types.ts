import type { CollectionSnapshot } from '../collection/types'

export interface Repository<T extends { readonly id: string }> {
  load(): CollectionSnapshot<T>
  save(previous: CollectionSnapshot<T>, next: CollectionSnapshot<T>): void
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
