import { isRecord } from '../../shared/validation'
import { attributeNames, type OrdemCharacter } from './model'
import { inventoryCategories, skillDefinitions } from './rules'

const text = (value: unknown): value is string => typeof value === 'string'
const id = (value: unknown): value is string => text(value) && value.length > 0
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const nonnegative = (value: unknown): value is number => finite(value) && value >= 0
const integer = (value: unknown): value is number => Number.isSafeInteger(value)
const unique = (entries: { readonly id: string }[]) => new Set(entries.map(({ id: value }) => value)).size === entries.length

export function isOrdemCharacter(value: unknown): value is OrdemCharacter {
  if (!isRecord(value) || !id(value.id) || !isRecord(value.basicInfo)) return false
  const info = value.basicInfo
  if (![info.name, info.origin, info.className, info.track].every(text) || !nonnegative(info.nex) || info.nex > 100 ||
    !integer(info.effortPerRoundLimit) || info.effortPerRoundLimit < 0) return false
  const attributes = value.attributes
  const skills = value.skills
  const resources = value.resources
  if (!isRecord(attributes) || !attributeNames.every((name) => integer(attributes[name]))) return false
  if (!isRecord(skills) || Object.keys(skills).length !== skillDefinitions.length ||
    !skillDefinitions.every(({ id: skillId }) => {
      const skill = skills[skillId]
      return isRecord(skill) && finite(skill.trainingBonus) && finite(skill.otherBonus)
    })) return false
  if (!isRecord(resources) || !(['hitPoints', 'effortPoints', 'sanity'] as const).every((key) => {
    const resource = resources[key]
    return isRecord(resource) && nonnegative(resource.current) && nonnegative(resource.maximum) && resource.current <= resource.maximum
  })) return false
  if (!isRecord(value.combat) || !nonnegative(value.combat.defense) || !text(value.combat.movement) ||
    !isRecord(value.inventorySettings) || !nonnegative(value.inventorySettings.prestigePoints) ||
    !integer(value.inventorySettings.prestigePoints) || !nonnegative(value.inventorySettings.maximumLoad) || !text(value.notes)) return false
  if (!Array.isArray(value.attacks) || !value.attacks.every((entry: unknown) => isRecord(entry) && id(entry.id) &&
    text(entry.name) && entry.name.trim() && [entry.type, entry.range, entry.test, entry.damage, entry.criticalTest, entry.criticalMultiplier].every(text)) ||
    !unique(value.attacks)) return false
  if (!Array.isArray(value.inventory) || !value.inventory.every((entry: unknown) => isRecord(entry) && id(entry.id) &&
    text(entry.name) && entry.name.trim() && inventoryCategories.some((category) => category === entry.category) &&
    nonnegative(entry.spaces) && text(entry.description)) || !unique(value.inventory)) return false
  for (const key of ['abilities', 'rituals'] as const) {
    const entries = value[key]
    if (!Array.isArray(entries) || !entries.every((entry: unknown) => isRecord(entry) && id(entry.id) &&
      text(entry.name) && entry.name.trim() && text(entry.cost) && text(entry.page) && text(entry.description)) || !unique(entries)) return false
  }
  return true
}
