import { useLayoutEffect, useState, type ReactNode } from 'react'
import { dndMessages, globalMessages, ordemMessages } from './messages'
import { LOCALE_KEY, type Locale } from './locale'
import { I18nContext, type I18nValue } from './useI18n'

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved === 'pt-BR' || saved === 'en') return saved
  } catch { /* Preference storage is optional. */ }
  return 'pt-BR'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setCurrentLocale] = useState<Locale>(initialLocale)

  const setLocale = (next: Locale) => {
    setCurrentLocale(next)
    try { localStorage.setItem(LOCALE_KEY, next) } catch { /* Keep the selection in memory. */ }
  }

  useLayoutEffect(() => {
    document.documentElement.lang = locale
    document.title = 'Dicebound'
  }, [locale])

  const value: I18nValue = {
    locale, setLocale,
    global: (key) => globalMessages[key][locale],
    dnd: (key) => dndMessages[key][locale],
    ordem: (key) => ordemMessages[key][locale],
  }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
