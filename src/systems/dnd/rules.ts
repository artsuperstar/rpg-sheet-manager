import type { AbilityName, RestType } from './model'

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4)
}

export function totalModifier(score: number, level: number, proficiencyMultiplier = 0): number {
  return abilityModifier(score) + proficiencyBonus(level) * proficiencyMultiplier
}

export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : String(modifier)
}

export function abilityLabel(ability: AbilityName): string {
  return ability.charAt(0).toUpperCase() + ability.slice(1)
}

export function abilityAbbreviation(ability: AbilityName): string {
  return ability.slice(0, 3).toUpperCase()
}

export function restLabel(rest: RestType): string {
  return rest === 'shortRest' ? 'SR' : 'LR'
}
