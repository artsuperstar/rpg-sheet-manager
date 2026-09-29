import { SYSTEMS, type RpgSystemId } from './systemRegistry'
import styles from '../shared/styles/shell.module.css'

interface SystemSwitcherProps {
  activeSystem: RpgSystemId
  onSelect: (system: RpgSystemId) => void
}

export function SystemSwitcher({ activeSystem, onSelect }: SystemSwitcherProps) {
  const current = SYSTEMS.find(({ id }) => id === activeSystem)

  return (
    <nav className={styles.switcher} aria-label="Trocar sistema de RPG">
      <span className={styles.switcherLabel}>Sistema atual: <strong>{current?.label}</strong></span>
      <div className={styles.switcherButtons}>
        {SYSTEMS.map(({ id, label }) => (
          <button
            className={styles.switchButton}
            key={id}
            type="button"
            aria-current={id === activeSystem ? 'page' : undefined}
            disabled={id === activeSystem}
            onClick={() => onSelect(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

