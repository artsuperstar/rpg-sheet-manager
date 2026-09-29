import type { ReactNode } from 'react'
import styles from '../styles/shell.module.css'

interface AppShellProps {
  theme?: string
  headerAction?: ReactNode
  children: ReactNode
}

export function AppShell({ theme, headerAction, children }: AppShellProps) {
  return (
    <div className={styles.shell} data-system={theme}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Biblioteca de fichas</p>
            <h1>Fichas de RPG</h1>
          </div>
          {headerAction}
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}

