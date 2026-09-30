import { isRecord } from '../../shared/persistence/types'

// TEMPORÁRIO: substituído pelo modelo real de D&D na Etapa 4C.
export type DndPlaceholderCharacter = {
  readonly id: string
  name: string
}

export function createDndPlaceholderCharacter(): DndPlaceholderCharacter {
  return { id: crypto.randomUUID(), name: 'Nova ficha de D&D' }
}

export function isDndPlaceholderCharacter(value: unknown): value is DndPlaceholderCharacter {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.name === 'string'
}
