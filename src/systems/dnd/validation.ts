import { isRecord } from '../../shared/validation'
import { abilityNames, skillDefinitions, type DndCharacter } from './model'

const id = (value: unknown): value is string => typeof value === 'string' && value.length > 0
const text = (value: unknown): value is string => typeof value === 'string'
const integer = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value)
const nonnegative = (value: unknown): value is number => integer(value) && value >= 0
const positive = (value: unknown): value is number => integer(value) && value >= 1
const abilityScore = (value: unknown): value is number => integer(value) && value >= 1 && value <= 30
const rest = (value: unknown) => value === 'shortRest' || value === 'longRest'
const uniqueIds = (values: { readonly id: string }[]) => new Set(values.map(({ id: entryId }) => entryId)).size === values.length

export function isDndCharacter(value: unknown): value is DndCharacter {
  if (!isRecord(value) || !id(value.id) || !text(value.name) || !text(value.className) ||
    !text(value.ancestry) || !text(value.background) || !positive(value.level) ||
    !nonnegative(value.armorClass) || !nonnegative(value.speed) || !text(value.notes)) return false

  const hp = value.hitPoints
  const abilities = value.abilities
  const bonuses = value.rollBonuses
  const currency = value.currency
  if (!isRecord(hp) || !integer(hp.current) || !positive(hp.maximum) || !nonnegative(hp.temporary) ||
    !isRecord(abilities) || !abilityNames.every((name) => abilityScore(abilities[name])) ||
    !isRecord(bonuses) ||
    !isRecord(currency) || !(['cp', 'sp', 'ep', 'gp', 'pp'] as const).every((coin) => nonnegative(currency[coin]))) return false

  const savingThrows = bonuses.savingThrows
  const skills = bonuses.skills
  if (!isRecord(savingThrows) || !isRecord(skills) ||
    !abilityNames.every((name) => integer(savingThrows[name])) ||
    !skillDefinitions.every(({ name }) => integer(skills[name]))) return false

  if (!Array.isArray(value.attacks) || !value.attacks.every((entry: unknown) =>
    isRecord(entry) && id(entry.id) && text(entry.name) && entry.name.trim().length > 0 &&
    integer(entry.attackBonus) && text(entry.damageDice) && entry.damageDice.trim().length > 0)) return false
  if (!uniqueIds(value.attacks)) return false

  if (!Array.isArray(value.spellSlots) || !value.spellSlots.every((slot: unknown) =>
    isRecord(slot) && id(slot.id) && integer(slot.level) && slot.level >= 1 && slot.level <= 9 &&
    positive(slot.maximumSlots) && nonnegative(slot.remainingSlots) && slot.remainingSlots <= slot.maximumSlots &&
    rest(slot.recharge))) return false
  if (!uniqueIds(value.spellSlots)) return false

  if (!Array.isArray(value.equipment) || !value.equipment.every((item: unknown) =>
    isRecord(item) && id(item.id) && text(item.name) && nonnegative(item.quantity))) return false
  if (!uniqueIds(value.equipment)) return false

  if (!Array.isArray(value.features) || !value.features.every((feature: unknown) => {
    if (!isRecord(feature) || !id(feature.id) || !text(feature.name) || !feature.name.trim()) return false
    if (feature.tracking === 'none') return true
    if (rest(feature.tracking)) return typeof feature.used === 'boolean'
    return feature.tracking === 'uses' && positive(feature.maximumUses) &&
      nonnegative(feature.remainingUses) && feature.remainingUses <= feature.maximumUses &&
      (feature.recharge === null || rest(feature.recharge))
  })) return false
  return uniqueIds(value.features)
}
