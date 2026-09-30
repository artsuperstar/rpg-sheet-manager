import type { DndCharacter } from './model'

export function createDefaultDndCharacter(): DndCharacter {
  return {
    id: crypto.randomUUID(),
    name: 'New Adventurer',
    className: '',
    ancestry: '',
    background: '',
    level: 1,
    armorClass: 10,
    speed: 30,
    hitPoints: { current: 10, maximum: 10, temporary: 0 },
    abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    rollBonuses: {
      savingThrows: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
      skills: {
        acrobatics: 0, animalHandling: 0, arcana: 0, athletics: 0, deception: 0, history: 0,
        insight: 0, intimidation: 0, investigation: 0, medicine: 0, nature: 0, perception: 0,
        performance: 0, persuasion: 0, religion: 0, sleightOfHand: 0, stealth: 0, survival: 0,
      },
    },
    attacks: [],
    spellSlots: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equipment: [],
    features: [],
    notes: '',
  }
}
