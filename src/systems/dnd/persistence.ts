import { createRepository } from '../../shared/persistence/repository'
import { isDndCharacter } from './validation'

export const dndRepository = createRepository('dnd', isDndCharacter)
