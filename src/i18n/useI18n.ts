import { createContext, useContext } from 'react'
import type { DndMessage, GlobalMessage, OrdemMessage } from './messages'
import type { Locale } from './locale'

export interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  global: (key: GlobalMessage) => string
  dnd: (key: DndMessage) => string
  ordem: (key: OrdemMessage) => string
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('I18nProvider is required')
  return value
}
