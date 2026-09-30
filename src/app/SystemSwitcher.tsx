import { SYSTEMS, type RpgSystemId } from './systemRegistry'
import styles from '../shared/styles/shell.module.css'
import { useI18n } from '../i18n/useI18n'

interface SystemSwitcherProps {
  activeSystem: RpgSystemId
  onSelect: (system: RpgSystemId) => void
  placement?: 'header' | 'sidebar'
}

export function SystemSwitcher({ activeSystem, onSelect, placement = 'header' }: SystemSwitcherProps) {
  const { global: t } = useI18n()
  const current = SYSTEMS.find(({ id }) => id === activeSystem)

  return (
    <nav className={styles.switcher} data-placement={placement} tabIndex={placement === 'sidebar' ? -1 : undefined}
      aria-label={t('Trocar sistema de RPG')}>
      <span className={styles.switcherLabel}>{t('Sistema atual:')} <strong>{current?.label}</strong></span>
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

