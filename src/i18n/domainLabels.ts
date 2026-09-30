import type { AbilityName, SkillName } from '../systems/dnd/model'
import type { AttributeName, ResourceName } from '../systems/ordem/model'
import type { SkillId } from '../systems/ordem/rules'
import type { Locale } from './locale'

type Pair = Record<Locale, string>

const dndAbilities = {
  strength: { 'pt-BR': 'Força', en: 'Strength' }, dexterity: { 'pt-BR': 'Destreza', en: 'Dexterity' },
  constitution: { 'pt-BR': 'Constituição', en: 'Constitution' }, intelligence: { 'pt-BR': 'Inteligência', en: 'Intelligence' },
  wisdom: { 'pt-BR': 'Sabedoria', en: 'Wisdom' }, charisma: { 'pt-BR': 'Carisma', en: 'Charisma' },
} satisfies Record<AbilityName, Pair>
const dndAbbreviations = {
  strength: { 'pt-BR': 'FOR', en: 'STR' }, dexterity: { 'pt-BR': 'DES', en: 'DEX' },
  constitution: { 'pt-BR': 'CON', en: 'CON' }, intelligence: { 'pt-BR': 'INT', en: 'INT' },
  wisdom: { 'pt-BR': 'SAB', en: 'WIS' }, charisma: { 'pt-BR': 'CAR', en: 'CHA' },
} satisfies Record<AbilityName, Pair>
const dndSkills = {
  acrobatics: { 'pt-BR': 'Acrobacia', en: 'Acrobatics' }, animalHandling: { 'pt-BR': 'Adestrar Animais', en: 'Animal Handling' },
  arcana: { 'pt-BR': 'Arcanismo', en: 'Arcana' }, athletics: { 'pt-BR': 'Atletismo', en: 'Athletics' },
  deception: { 'pt-BR': 'Enganação', en: 'Deception' }, history: { 'pt-BR': 'História', en: 'History' },
  insight: { 'pt-BR': 'Intuição', en: 'Insight' }, intimidation: { 'pt-BR': 'Intimidação', en: 'Intimidation' },
  investigation: { 'pt-BR': 'Investigação', en: 'Investigation' }, medicine: { 'pt-BR': 'Medicina', en: 'Medicine' },
  nature: { 'pt-BR': 'Natureza', en: 'Nature' }, perception: { 'pt-BR': 'Percepção', en: 'Perception' },
  performance: { 'pt-BR': 'Atuação', en: 'Performance' }, persuasion: { 'pt-BR': 'Persuasão', en: 'Persuasion' },
  religion: { 'pt-BR': 'Religião', en: 'Religion' }, sleightOfHand: { 'pt-BR': 'Prestidigitação', en: 'Sleight of Hand' },
  stealth: { 'pt-BR': 'Furtividade', en: 'Stealth' }, survival: { 'pt-BR': 'Sobrevivência', en: 'Survival' },
} satisfies Record<SkillName, Pair>

const ordemAttributes = {
  agility: { 'pt-BR': 'Agilidade', en: 'Agility' }, strength: { 'pt-BR': 'Força', en: 'Strength' },
  intellect: { 'pt-BR': 'Intelecto', en: 'Intellect' }, presence: { 'pt-BR': 'Presença', en: 'Presence' },
  vigor: { 'pt-BR': 'Vigor', en: 'Vigor' },
} satisfies Record<AttributeName, Pair>
const ordemAbbreviations = {
  agility: { 'pt-BR': 'AGI', en: 'AGI' }, strength: { 'pt-BR': 'FOR', en: 'STR' },
  intellect: { 'pt-BR': 'INT', en: 'INT' }, presence: { 'pt-BR': 'PRE', en: 'PRE' },
  vigor: { 'pt-BR': 'VIG', en: 'VIG' },
} satisfies Record<AttributeName, Pair>
const ordemSkills = {
  acrobatics: { 'pt-BR': 'Acrobacia', en: 'Acrobatics' }, 'animal-handling': { 'pt-BR': 'Adestramento', en: 'Animal Handling' },
  arts: { 'pt-BR': 'Artes', en: 'Arts' }, athletics: { 'pt-BR': 'Atletismo', en: 'Athletics' },
  'current-events': { 'pt-BR': 'Atualidades', en: 'Current Events' }, science: { 'pt-BR': 'Ciências', en: 'Science' },
  crime: { 'pt-BR': 'Crime', en: 'Crime' }, diplomacy: { 'pt-BR': 'Diplomacia', en: 'Diplomacy' },
  deception: { 'pt-BR': 'Enganação', en: 'Deception' }, fortitude: { 'pt-BR': 'Fortitude', en: 'Fortitude' },
  stealth: { 'pt-BR': 'Furtividade', en: 'Stealth' }, initiative: { 'pt-BR': 'Iniciativa', en: 'Initiative' },
  intimidation: { 'pt-BR': 'Intimidação', en: 'Intimidation' }, insight: { 'pt-BR': 'Intuição', en: 'Insight' },
  investigation: { 'pt-BR': 'Investigação', en: 'Investigation' }, fighting: { 'pt-BR': 'Luta', en: 'Fighting' },
  medicine: { 'pt-BR': 'Medicina', en: 'Medicine' }, occultism: { 'pt-BR': 'Ocultismo', en: 'Occultism' },
  perception: { 'pt-BR': 'Percepção', en: 'Perception' }, piloting: { 'pt-BR': 'Pilotagem', en: 'Piloting' },
  aim: { 'pt-BR': 'Pontaria', en: 'Aim' }, 'profession-one': { 'pt-BR': 'Profissão 1', en: 'Profession 1' },
  'profession-two': { 'pt-BR': 'Profissão 2', en: 'Profession 2' }, reflexes: { 'pt-BR': 'Reflexos', en: 'Reflexes' },
  religion: { 'pt-BR': 'Religião', en: 'Religion' }, survival: { 'pt-BR': 'Sobrevivência', en: 'Survival' },
  tactics: { 'pt-BR': 'Tática', en: 'Tactics' }, technology: { 'pt-BR': 'Tecnologia', en: 'Technology' },
  will: { 'pt-BR': 'Vontade', en: 'Will' },
} satisfies Record<SkillId, Pair>
const ordemResourceAbbreviations = {
  hitPoints: { 'pt-BR': 'PV', en: 'HP' }, effortPoints: { 'pt-BR': 'PE', en: 'EP' },
  sanity: { 'pt-BR': 'SAN', en: 'SAN' },
} satisfies Record<ResourceName, Pair>
const profession = { 'pt-BR': 'Profissão', en: 'Profession' } satisfies Pair

export const dndAbilityLabel = (name: AbilityName, locale: Locale) => dndAbilities[name][locale]
export const dndAbilityAbbreviation = (name: AbilityName, locale: Locale) => dndAbbreviations[name][locale]
export const dndSkillLabel = (name: SkillName, locale: Locale) => dndSkills[name][locale]
export const ordemAttributeLabel = (name: AttributeName, locale: Locale) => ordemAttributes[name][locale]
export const ordemAttributeAbbreviation = (name: AttributeName, locale: Locale) => ordemAbbreviations[name][locale]
export const ordemSkillLabel = (name: SkillId, locale: Locale) => ordemSkills[name][locale]
export const ordemSkillDisplayLabel = (name: SkillId, locale: Locale) => name === 'profession-one' || name === 'profession-two'
  ? profession[locale] : ordemSkills[name][locale]
export const ordemResourceAbbreviation = (name: ResourceName, locale: Locale) => ordemResourceAbbreviations[name][locale]
