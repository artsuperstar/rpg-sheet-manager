export const abilityNames = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
] as const
export type AbilityName = (typeof abilityNames)[number]
export type Abilities = Record<AbilityName, number>

export const skillDefinitions = [
  { name: 'acrobatics', label: 'Acrobatics', ability: 'dexterity' },
  { name: 'animalHandling', label: 'Animal Handling', ability: 'wisdom' },
  { name: 'arcana', label: 'Arcana', ability: 'intelligence' },
  { name: 'athletics', label: 'Athletics', ability: 'strength' },
  { name: 'deception', label: 'Deception', ability: 'charisma' },
  { name: 'history', label: 'History', ability: 'intelligence' },
  { name: 'insight', label: 'Insight', ability: 'wisdom' },
  { name: 'intimidation', label: 'Intimidation', ability: 'charisma' },
  { name: 'investigation', label: 'Investigation', ability: 'intelligence' },
  { name: 'medicine', label: 'Medicine', ability: 'wisdom' },
  { name: 'nature', label: 'Nature', ability: 'intelligence' },
  { name: 'perception', label: 'Perception', ability: 'wisdom' },
  { name: 'performance', label: 'Performance', ability: 'charisma' },
  { name: 'persuasion', label: 'Persuasion', ability: 'charisma' },
  { name: 'religion', label: 'Religion', ability: 'intelligence' },
  { name: 'sleightOfHand', label: 'Sleight of Hand', ability: 'dexterity' },
  { name: 'stealth', label: 'Stealth', ability: 'dexterity' },
  { name: 'survival', label: 'Survival', ability: 'wisdom' },
] as const satisfies ReadonlyArray<{ name: string; label: string; ability: AbilityName }>
export type SkillName = (typeof skillDefinitions)[number]['name']

export interface RollBonuses {
  savingThrows: Record<AbilityName, number>
  skills: Record<SkillName, number>
}

export interface EquipmentItem {
  readonly id: string
  name: string
  quantity: number
}

export type RestType = 'shortRest' | 'longRest'
type FeatureBase = { readonly id: string; name: string }
export type CharacterFeature =
  | FeatureBase & { tracking: 'none' }
  | FeatureBase & { tracking: RestType; used: boolean }
  | FeatureBase & { tracking: 'uses'; maximumUses: number; remainingUses: number; recharge: RestType | null }

export interface AttackEntry {
  readonly id: string
  name: string
  attackBonus: number
  damageDice: string
}

export interface SpellSlot {
  readonly id: string
  level: number
  maximumSlots: number
  remainingSlots: number
  recharge: RestType
}

export interface DndCharacter {
  readonly id: string
  name: string
  className: string
  ancestry: string
  background: string
  level: number
  armorClass: number
  speed: number
  hitPoints: { current: number; maximum: number; temporary: number }
  abilities: Abilities
  rollBonuses: RollBonuses
  attacks: AttackEntry[]
  spellSlots: SpellSlot[]
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number }
  equipment: EquipmentItem[]
  features: CharacterFeature[]
  notes: string
}
