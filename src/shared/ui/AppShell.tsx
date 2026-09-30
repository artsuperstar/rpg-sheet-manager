import type { ReactNode } from 'react'
import mug from '../assets/tavern-mug.png'
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
          <div className={styles.productBrand}>
            <img src={mug} alt="" />
            <div>
              <p className={styles.kicker}>Biblioteca de fichas</p>
              <h1>Fichas de RPG</h1>
            </div>
          </div>
          {headerAction && <div className={styles.headerAction}>{headerAction}</div>}
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}

