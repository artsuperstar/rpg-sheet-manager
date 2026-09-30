import { useState, type FormEvent } from 'react'
import type { CharacterFeature, DndCharacter, RestType } from '../model'
import styles from '../styles/dnd.module.css'
import { useI18n } from '../../../i18n/useI18n'

type FeatureDraft = { name: string; recharge: RestType | null; maximumUses: string }

function makeFeature(draft: FeatureDraft): CharacterFeature {
  const base = { id: crypto.randomUUID(), name: draft.name.trim() }
  if (draft.maximumUses !== '') {
    const maximumUses = Number(draft.maximumUses)
    return { ...base, tracking: 'uses', maximumUses, remainingUses: maximumUses, recharge: draft.recharge }
  }
  if (draft.recharge) return { ...base, tracking: draft.recharge, used: false }
  return { ...base, tracking: 'none' }
}

export function FeaturesPanel({ character, onChange }: {
  character: DndCharacter
  onChange: (update: (current: DndCharacter) => DndCharacter) => void
}) {
  const { dnd: t, locale } = useI18n()
  const rechargeTitle = (rest: RestType) => locale === 'en'
    ? `Recharges on a ${rest === 'shortRest' ? 'short' : 'long'} rest`
    : `Recupera após descanso ${rest === 'shortRest' ? 'curto' : 'longo'}`
  const [draft, setDraft] = useState<FeatureDraft | null>(null)
  const amount = draft?.maximumUses === '' ? null : Number(draft?.maximumUses)
  const valid = draft !== null && draft.name.trim().length > 0 &&
    (amount === null || (Number.isSafeInteger(amount) && amount >= 1))

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft || !valid) return
    const feature = makeFeature(draft)
    onChange((current) => ({ ...current, features: [...current.features, feature] }))
    setDraft(null)
  }

  function replace(replacement: CharacterFeature) {
    onChange((current) => ({ ...current, features: current.features.map((feature) =>
      feature.id === replacement.id ? replacement : feature) }))
  }

  return (
    <section className={`${styles.card} ${styles.features}`} aria-label={t('Features & Abilities')}>
      <div className={styles.sectionHeading}><h3>{t('Features & Abilities')}</h3>
        {!draft && <button className={styles.button} type="button" onClick={() => setDraft({
          name: '', recharge: null, maximumUses: '',
        })}>{t('Add ability')}</button>}
      </div>
      {draft && (
        <form className={styles.featureForm} aria-label={t('Add feature or ability')} onSubmit={add}
          onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
          <label className={styles.field}><span>{t('Feature or ability name')}</span>
            <input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <fieldset className={styles.trackingOptions}><legend>{t('Limited use')}</legend>
            <label><input type="checkbox" checked={draft.recharge === 'shortRest'} onChange={(event) => setDraft({
              ...draft, recharge: event.target.checked ? 'shortRest' : null,
            })} />{t('Short rest')}</label>
            <label><input type="checkbox" checked={draft.recharge === 'longRest'} onChange={(event) => setDraft({
              ...draft, recharge: event.target.checked ? 'longRest' : null,
            })} />{t('Long rest')}</label>
            <label className={styles.field}><span>{t('Number of uses')}</span><input type="number" min="1" step="1"
              value={draft.maximumUses} onChange={(event) => setDraft({ ...draft, maximumUses: event.target.value })} /></label>
          </fieldset>
          <p>{t('Choose a rest, an amount, or both. Leave both blank for unlimited abilities.')}</p>
          <div className={styles.editorActions}>
            <button className={styles.button} type="button" onClick={() => setDraft(null)}>{t('Cancel')}</button>
            <button className={styles.primaryButton} type="submit" disabled={!valid}>{t('Add to sheet')}</button>
          </div>
        </form>
      )}
      {character.features.length === 0 && !draft && <p className={styles.emptyHint}>{t('No features or abilities added yet.')}</p>}
      <div className={styles.featureList}>{character.features.map((feature) => {
        const rest = feature.tracking === 'uses' ? feature.recharge :
          feature.tracking === 'none' ? null : feature.tracking
        const depleted = feature.tracking === 'uses' ? feature.remainingUses === 0 :
          feature.tracking === 'none' ? false : feature.used
        return (
          <article className={styles.counterRow} data-depleted={depleted} key={feature.id}>
            <div className={styles.featureName}><strong>{feature.name}</strong>
              {rest && <span className={styles.restBadge} data-rest={rest}
                title={rechargeTitle(rest)}>{rest === 'shortRest' ? t('Short Rest') : t('Long Rest')}</span>}</div>
            <div className={styles.counterActions}>
              {(feature.tracking === 'shortRest' || feature.tracking === 'longRest') && (
                <button type="button" aria-label={locale === 'en' ? `Mark ${feature.name} as ${feature.used ? 'unused' : 'used'}` : `Marcar ${feature.name} como ${feature.used ? 'não usado' : 'usado'}`}
                  aria-pressed={feature.used} onClick={() => replace({ ...feature, used: !feature.used })}>
                  {feature.used ? t('Used') : t('Use')}
                </button>
              )}
              {feature.tracking === 'uses' && (
                <>
                  <button type="button" aria-label={`${t('Use')} ${feature.name}`} disabled={feature.remainingUses <= 0}
                    onClick={() => replace({ ...feature, remainingUses: Math.max(0, feature.remainingUses - 1) })}>−</button>
                  <output aria-label={`${feature.name} ${t('uses remaining')}`}>{feature.remainingUses}/{feature.maximumUses}</output>
                  <button type="button" aria-label={`${t('Reset')} ${feature.name} ${locale === 'en' ? 'uses' : 'usos'}`}
                    disabled={feature.remainingUses === feature.maximumUses}
                    onClick={() => replace({ ...feature, remainingUses: feature.maximumUses })}>{t('Reset')}</button>
                </>
              )}
              <button type="button" aria-label={`${t('Remove')} ${feature.name}`} onClick={() => onChange((current) => ({
                ...current, features: current.features.filter(({ id }) => id !== feature.id),
              }))}>×</button>
            </div>
          </article>
        )
      })}</div>
    </section>
  )
}
