import { createRepository } from '../../shared/persistence/repository'
import { isOrdemCharacter } from './validation'

export const ordemRepository = createRepository('ordem', isOrdemCharacter)
