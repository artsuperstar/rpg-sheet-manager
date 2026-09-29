import { SYSTEMS, type RpgSystemId } from './systemRegistry'
import styles from '../shared/styles/shell.module.css'

interface SystemChooserProps {
  onSelect: (system: RpgSystemId) => void
}

export function SystemChooser({ onSelect }: SystemChooserProps) {
  return (
    <section className={styles.chooser} aria-labelledby="choose-system-heading">
      <p className={styles.kicker}>Comece por aqui</p>
      <h2 id="choose-system-heading">Escolha um sistema de RPG</h2>
      <p>Selecione o sistema que deseja usar. Nenhuma ficha será criada automaticamente.</p>
      <div className={styles.choiceGrid}>
        {SYSTEMS.map(({ id, label }) => (
          <button className={styles.choiceButton} key={id} type="button" onClick={() => onSelect(id)}>
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}

