import { globalMessages } from './dictionaries/global'
import { dndMessages } from './dictionaries/dnd'
import { ordemMessages } from './dictionaries/ordem'

export { globalMessages, dndMessages, ordemMessages }

export type GlobalMessage = keyof typeof globalMessages
export type DndMessage = keyof typeof dndMessages
export type OrdemMessage = keyof typeof ordemMessages
