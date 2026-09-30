import { SYSTEMS, type RpgSystemId } from './systemRegistry'
import mug from '../shared/assets/tavern-mug.png'
import styles from '../shared/styles/shell.module.css'

interface SystemChooserProps {
  onSelect: (system: RpgSystemId) => void
}

export function SystemChooser({ onSelect }: SystemChooserProps) {
  return (
    <section className={styles.chooser} aria-labelledby="choose-system-heading">
      <div className={styles.chooserHero}>
        <div className={styles.chooserIntro}>
          <p className={styles.kicker}>Seu espaço de aventura</p>
          <h2 id="choose-system-heading">Escolha um sistema de RPG</h2>
          <p>Suas fichas de D&amp;D e Ordem Paranormal, cada uma em seu próprio universo. Escolha por onde começar.</p>
        </div>
        <div className={styles.chooserIllustration} aria-hidden="true"><img src={mug} alt="" /></div>
      </div>
      <div className={styles.choiceHeading}><span>01 / Escolha sua mesa</span><span>Dois sistemas · um lugar para suas fichas</span></div>
      <div className={styles.choiceGrid}>
        {SYSTEMS.map(({ id, label }) => (
          <button className={styles.choiceButton} data-choice={id} key={id} type="button"
            aria-labelledby={`choice-${id}`} aria-describedby={`choice-description-${id}`} onClick={() => onSelect(id)}>
            <span className={styles.choiceIndex} aria-hidden="true">{id === 'dnd' ? '01' : '02'}</span>
            <span className={styles.choiceText}>
              <strong id={`choice-${id}`}>{label}</strong>
              <span id={`choice-description-${id}`}>{id === 'dnd'
                ? 'Aventureiros, magia e histórias ao redor da mesa.'
                : 'Agentes, mistérios e investigações paranormais.'}</span>
            </span>
            <span className={styles.choiceCta} aria-hidden="true">Abrir fichas <span>↗</span></span>
          </button>
        ))}
      </div>
      <p className={styles.chooserNote}>Nenhuma ficha será criada automaticamente.</p>
    </section>
  )
}

