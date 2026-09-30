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
