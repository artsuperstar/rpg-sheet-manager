import type { AttributeName, OrdemInventoryItem, SkillBonus } from './model'

export const attributeDefinitions = [
  { name: 'agility', label: 'Agilidade', abbreviation: 'AGI' },
  { name: 'strength', label: 'Força', abbreviation: 'FOR' },
  { name: 'intellect', label: 'Intelecto', abbreviation: 'INT' },
  { name: 'presence', label: 'Presença', abbreviation: 'PRE' },
  { name: 'vigor', label: 'Vigor', abbreviation: 'VIG' },
] as const satisfies ReadonlyArray<{ name: AttributeName; label: string; abbreviation: string }>

export const skillDefinitions = [
  { id: 'acrobatics', label: 'Acrobacia', attribute: 'agility', loadPenalty: true },
  { id: 'animal-handling', label: 'Adestramento', attribute: 'presence', trainedOnly: true },
  { id: 'arts', label: 'Artes', attribute: 'presence', trainedOnly: true },
  { id: 'athletics', label: 'Atletismo', attribute: 'strength' },
  { id: 'current-events', label: 'Atualidades', attribute: 'intellect' },
  { id: 'science', label: 'Ciências', attribute: 'intellect', trainedOnly: true },
  { id: 'crime', label: 'Crime', attribute: 'agility', trainedOnly: true, loadPenalty: true },
  { id: 'diplomacy', label: 'Diplomacia', attribute: 'presence' },
  { id: 'deception', label: 'Enganação', attribute: 'presence' },
  { id: 'fortitude', label: 'Fortitude', attribute: 'vigor' },
  { id: 'stealth', label: 'Furtividade', attribute: 'agility', loadPenalty: true },
  { id: 'initiative', label: 'Iniciativa', attribute: 'agility' },
  { id: 'intimidation', label: 'Intimidação', attribute: 'presence' },
  { id: 'insight', label: 'Intuição', attribute: 'presence' },
  { id: 'investigation', label: 'Investigação', attribute: 'intellect' },
  { id: 'fighting', label: 'Luta', attribute: 'strength' },
  { id: 'medicine', label: 'Medicina', attribute: 'intellect' },
  { id: 'occultism', label: 'Ocultismo', attribute: 'intellect', trainedOnly: true },
  { id: 'perception', label: 'Percepção', attribute: 'presence' },
  { id: 'piloting', label: 'Pilotagem', attribute: 'agility', trainedOnly: true },
  { id: 'aim', label: 'Pontaria', attribute: 'agility' },
  { id: 'profession-one', label: 'Profissão 1', displayLabel: 'Profissão', attribute: 'intellect', trainedOnly: true },
  { id: 'profession-two', label: 'Profissão 2', displayLabel: 'Profissão', attribute: 'intellect', trainedOnly: true },
  { id: 'reflexes', label: 'Reflexos', attribute: 'agility' },
  { id: 'religion', label: 'Religião', attribute: 'presence', trainedOnly: true },
  { id: 'survival', label: 'Sobrevivência', attribute: 'intellect' },
  { id: 'tactics', label: 'Tática', attribute: 'intellect', trainedOnly: true },
  { id: 'technology', label: 'Tecnologia', attribute: 'intellect', trainedOnly: true },
  { id: 'will', label: 'Vontade', attribute: 'presence' },
] as const satisfies ReadonlyArray<{ id: string; label: string; attribute: AttributeName; trainedOnly?: boolean; loadPenalty?: boolean; displayLabel?: string }>

export type SkillId = (typeof skillDefinitions)[number]['id']
export const inventoryCategories = ['0', 'I', 'II', 'III', 'IV'] as const

export const prestigeTiers = [
  { minimum: 0, rank: 'Recruta', creditLimit: 'Baixo', itemLimits: [2, null, null, null] },
  { minimum: 20, rank: 'Operador', creditLimit: 'Médio', itemLimits: [3, 1, null, null] },
  { minimum: 50, rank: 'Agente especial', creditLimit: 'Médio', itemLimits: [3, 2, 1, null] },
  { minimum: 100, rank: 'Oficial de operações', creditLimit: 'Alto', itemLimits: [3, 3, 2, 1] },
  { minimum: 200, rank: 'Agente de elite', creditLimit: 'Ilimitado', itemLimits: [3, 3, 3, 2] },
] as const

export function prestigeTier(points: number) {
  for (let index = prestigeTiers.length - 1; index >= 0; index--) {
    if (points >= prestigeTiers[index].minimum) return prestigeTiers[index]
  }
  return prestigeTiers[0]
}

export function skillTotal(skill: SkillBonus): number { return skill.trainingBonus + skill.otherBonus }
export function formatBonus(value: number): string { return value >= 0 ? `+${value}` : String(value) }
export function currentLoad(items: OrdemInventoryItem[]): number {
  return items.filter(({ name }) => name.trim()).reduce((sum, { spaces }) => sum + spaces, 0)
}
export function categoryCount(items: OrdemInventoryItem[], category: OrdemInventoryItem['category']): number {
  return items.filter((item) => item.name.trim() && item.category === category).length
}
