export type RpgSystemId = 'dnd' | 'ordem'

export const SYSTEMS = [
  { id: 'dnd', label: 'D&D' },
  { id: 'ordem', label: 'Ordem Paranormal' },
] as const satisfies ReadonlyArray<{ id: RpgSystemId; label: string }>

export function isRpgSystemId(value: string): value is RpgSystemId {
  return SYSTEMS.some(({ id }) => id === value)
}

