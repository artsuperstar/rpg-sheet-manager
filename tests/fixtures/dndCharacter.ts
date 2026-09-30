import { createDefaultDndCharacter } from '../../src/systems/dnd/defaults'
import type { DndCharacter } from '../../src/systems/dnd/model'

export const visualDndCharacter: DndCharacter = {
  ...createDefaultDndCharacter(),
  id: 'visual-test-character',
  name: 'Lyra Emberfall',
  className: 'Wizard',
  ancestry: 'High Elf',
  background: 'Sage',
  level: 5,
  armorClass: 15,
  speed: 30,
  hitPoints: { current: 24, maximum: 32, temporary: 5 },
  abilities: { strength: 8, dexterity: 16, constitution: 14, intelligence: 18, wisdom: 12, charisma: 10 },
  rollBonuses: {
    savingThrows: { strength: -1, dexterity: 3, constitution: 2, intelligence: 7, wisdom: 4, charisma: 0 },
    skills: {
      acrobatics: 3, animalHandling: 1, arcana: 7, athletics: -1, deception: 0, history: 7,
      insight: 4, intimidation: 0, investigation: 7, medicine: 1, nature: 4, perception: 4,
      performance: 0, persuasion: 0, religion: 4, sleightOfHand: 3, stealth: 3, survival: 1,
    },
  },
  attacks: [
    { id: 'fire-bolt', name: 'Fire Bolt', attackBonus: 7, damageDice: '2d10 fire' },
    { id: 'dagger', name: 'Dagger', attackBonus: 6, damageDice: '1d4 + 3' },
  ],
  spellSlots: [
    { id: 'level-one-slots', level: 1, maximumSlots: 4, remainingSlots: 2, recharge: 'longRest' },
    { id: 'level-two-slots', level: 2, maximumSlots: 3, remainingSlots: 0, recharge: 'shortRest' },
  ],
  currency: { cp: 8, sp: 14, ep: 0, gp: 126, pp: 2 },
  equipment: [
    { id: 'spellbook', name: 'Spellbook', quantity: 1 },
    { id: 'healing-potion', name: 'Potion of Healing', quantity: 2 },
  ],
  features: [
    { id: 'arcane-recovery', name: 'Arcane Recovery', tracking: 'longRest', used: false },
    { id: 'fey-ancestry', name: 'Fey Ancestry', tracking: 'none' },
    { id: 'fey-step', name: 'Fey Step', tracking: 'shortRest', used: true },
    { id: 'wand-charges', name: 'Wand Charges', tracking: 'uses', maximumUses: 3, remainingUses: 2, recharge: 'longRest' },
  ],
  notes: 'Meet Captain Voss at the northern gate before dawn.',
}
