import { isRecord } from '../../shared/persistence/types'

// TEMPORÁRIO: substituído pelo modelo real de Ordem na Etapa 4D.
export type OrdemPlaceholderCharacter = {
  readonly id: string
  name: string
}

export function createOrdemPlaceholderCharacter(): OrdemPlaceholderCharacter {
  return { id: crypto.randomUUID(), name: 'Nova ficha de Ordem' }
}

export function isOrdemPlaceholderCharacter(value: unknown): value is OrdemPlaceholderCharacter {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.name === 'string'
}
