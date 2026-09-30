import { SYSTEMS, type RpgSystemId } from './systemRegistry'
import mark from '../shared/assets/dicebound-mark.png'
import styles from '../shared/styles/shell.module.css'
import { useI18n } from '../i18n/useI18n'
import { LanguageSelector } from '../i18n/LanguageSelector'

interface SystemChooserProps {
  onSelect: (system: RpgSystemId) => void
}

export function SystemChooser({ onSelect }: SystemChooserProps) {
  const { global: t } = useI18n()
  return (
    <section className={styles.chooser} aria-labelledby="choose-system-heading">
      <LanguageSelector placement="landing" />
      <div className={styles.chooserHero}>
        <div className={styles.chooserIntro}>
          <p className={styles.kicker}>{t('Seu espaço de aventura')}</p>
          <h2 id="choose-system-heading">{t('Escolha um sistema de RPG')}</h2>
          <p>{t('Suas fichas de D&D e Ordem Paranormal, cada uma em seu próprio universo. Escolha por onde começar.')}</p>
        </div>
        <div className={styles.chooserIllustration} aria-hidden="true"><img src={mark} alt="" /></div>
      </div>
      <div className={styles.choiceHeading}><span>{t('01 / Escolha sua mesa')}</span><span>{t('Dois sistemas · um lugar para suas fichas')}</span></div>
      <div className={styles.choiceGrid}>
        {SYSTEMS.map(({ id, label }) => (
          <button className={styles.choiceButton} data-choice={id} key={id} type="button"
            aria-labelledby={`choice-${id}`} aria-describedby={`choice-description-${id}`} onClick={() => onSelect(id)}>
            <span className={styles.choiceIndex} aria-hidden="true">{id === 'dnd' ? '01' : '02'}</span>
            <span className={styles.choiceText}>
              <strong id={`choice-${id}`}>{label}</strong>
              <span id={`choice-description-${id}`}>{id === 'dnd'
                ? t('Aventureiros, magia e histórias ao redor da mesa.')
                : t('Agentes, mistérios e investigações paranormais.')}</span>
            </span>
            <span className={styles.choiceCta} aria-hidden="true">{t('Abrir fichas')} <span>↗</span></span>
          </button>
        ))}
      </div>
      <p className={styles.chooserNote}>{t('Nenhuma ficha será criada automaticamente.')}</p>
    </section>
  )
}

