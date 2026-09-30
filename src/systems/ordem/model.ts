export const attributeNames = ['agility', 'strength', 'intellect', 'presence', 'vigor'] as const
export type AttributeName = (typeof attributeNames)[number]
export type Attributes = Record<AttributeName, number>

export interface SkillBonus { trainingBonus: number; otherBonus: number }
export interface ResourceValue { current: number; maximum: number }
export type ResourceName = 'hitPoints' | 'effortPoints' | 'sanity'
export type Resources = Record<ResourceName, ResourceValue>

export interface OrdemAttack {
  readonly id: string
  name: string
  type: string
  range: string
  test: string
  damage: string
  criticalTest: string
  criticalMultiplier: string
}

export interface OrdemInventoryItem {
  readonly id: string
  name: string
  category: '0' | 'I' | 'II' | 'III' | 'IV'
  spaces: number
  description: string
}

export interface OrdemPower {
  readonly id: string
  name: string
  cost: string
  page: string
  description: string
}

export interface OrdemCharacter {
  readonly id: string
  basicInfo: {
    name: string
    origin: string
    className: string
    track: string
    nex: number
    effortPerRoundLimit: number
  }
  attributes: Attributes
  skills: Record<SkillId, SkillBonus>
  resources: Resources
  combat: { defense: number; movement: string }
  attacks: OrdemAttack[]
  inventorySettings: { prestigePoints: number; maximumLoad: number }
  inventory: OrdemInventoryItem[]
  abilities: OrdemPower[]
  rituals: OrdemPower[]
  notes: string
}
import type { SkillId } from './rules'
