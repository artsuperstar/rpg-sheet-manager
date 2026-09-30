import { createRepository } from '../../shared/persistence/repository'
import { isOrdemPlaceholderCharacter } from './placeholderModel'

export const ordemRepository = createRepository('ordem', isOrdemPlaceholderCharacter)
