import type { ReactNode } from 'react'
import mug from '../assets/tavern-mug.png'
import styles from '../styles/shell.module.css'
import { useI18n } from '../../i18n/useI18n'
import { LanguageSelector } from '../../i18n/LanguageSelector'

interface AppShellProps {
  theme?: string
  showHeader?: boolean
  children: ReactNode
}

export function AppShell({ theme, showHeader = true, children }: AppShellProps) {
  const { global: t } = useI18n()
  return (
    <div className={styles.shell} data-system={theme}>
      <div className={styles.container}>
        {showHeader && <header className={styles.header}>
          <div className={styles.productBrand}>
            <img src={mug} alt="" />
            <div>
              <p className={styles.kicker}>{t('Biblioteca de fichas')}</p>
              <h1>{t('Fichas de RPG')}</h1>
            </div>
          </div>
          <div className={styles.headerAction}><LanguageSelector /></div>
        </header>}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}

