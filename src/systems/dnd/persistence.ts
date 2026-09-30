import { createRepository } from '../../shared/persistence/repository'
import { isDndPlaceholderCharacter } from './placeholderModel'

export const dndRepository = createRepository('dnd', isDndPlaceholderCharacter)
