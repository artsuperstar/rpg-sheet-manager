import type { OrdemCharacter } from './model'
import { skillDefinitions } from './rules'

export function createDefaultOrdemCharacter(): OrdemCharacter {
  return {
    id: crypto.randomUUID(),
    basicInfo: { name: 'Novo agente', origin: '', className: '', track: '', nex: 0, effortPerRoundLimit: 0 },
    attributes: { agility: 0, strength: 0, intellect: 0, presence: 0, vigor: 0 },
    skills: Object.fromEntries(skillDefinitions.map(({ id }) => [id, { trainingBonus: 0, otherBonus: 0 }])) as OrdemCharacter['skills'],
    resources: {
      hitPoints: { current: 0, maximum: 0 },
      effortPoints: { current: 0, maximum: 0 },
      sanity: { current: 0, maximum: 0 },
    },
    combat: { defense: 0, movement: '' },
    attacks: [],
    inventorySettings: { prestigePoints: 0, maximumLoad: 0 },
    inventory: [],
    abilities: [], rituals: [], notes: '',
  }
}
