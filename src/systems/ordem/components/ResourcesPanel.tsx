import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import type { OrdemCharacter, ResourceName } from '../model'
import styles from '../styles/ordem.module.css'
import { EditButton, EditorActions } from './Controls'
import { useI18n } from '../../../i18n/useI18n'
import { ordemResourceAbbreviation } from '../../../i18n/domainLabels'

type Resources = OrdemCharacter['resources']
type Combat = OrdemCharacter['combat']
const entries = [
  { key: 'hitPoints', label: 'Pontos de Vida' },
  { key: 'effortPoints', label: 'Pontos de Esforço' },
  { key: 'sanity', label: 'Sanidade' },
] as const
type Draft = { maximums: Record<ResourceName, number>; defense: number; movement: string }

export function ResourcesPanel({ resources, combat, onChange }: {
  resources: Resources; combat: Combat; onChange: (resources: Resources, combat: Combat) => void
}) {
  const { ordem: t, locale } = useI18n()
  const [draft, setDraft] = useState<Draft | null>(null)
  const valid = draft !== null && entries.every(({ key }) => Number.isSafeInteger(draft.maximums[key]) && draft.maximums[key] >= 0) &&
    Number.isSafeInteger(draft.defense) && draft.defense >= 0
  function save() {
    if (!draft || !valid) return
    onChange({
      hitPoints: { current: Math.min(resources.hitPoints.current, draft.maximums.hitPoints), maximum: draft.maximums.hitPoints },
      effortPoints: { current: Math.min(resources.effortPoints.current, draft.maximums.effortPoints), maximum: draft.maximums.effortPoints },
      sanity: { current: Math.min(resources.sanity.current, draft.maximums.sanity), maximum: draft.maximums.sanity },
    }, { defense: draft.defense, movement: draft.movement.trim() })
    setDraft(null)
  }
  return <section id="recursos" className={styles.card} aria-label={t('Recursos')}>
    <div className={styles.heading}><div><small>{t('Estado do agente')}</small><h2>{t('Recursos')}</h2></div>
      <div className={styles.headingActions}><span>{t('Atualização direta')}</span>{draft
        ? <EditorActions canSave={valid} onCancel={() => setDraft(null)} onSave={save} />
        : <EditButton label={t('Editar recursos')} onClick={() => setDraft({
          maximums: { hitPoints: resources.hitPoints.maximum, effortPoints: resources.effortPoints.maximum,
            sanity: resources.sanity.maximum }, defense: combat.defense, movement: combat.movement,
        })} />}</div></div>
    <div className={styles.resourceGrid}>{entries.map(({ key, label }) => <div className={styles.resourceCard} key={key}>
      <div><strong>{ordemResourceAbbreviation(key, locale)}</strong><small>{t(label)}</small></div>
      <NumberInput label={`${t(label)} ${t('atuais')}`} min={0} max={resources[key].maximum} value={resources[key].current}
        onChange={(current) => onChange({ ...resources, [key]: { ...resources[key], current } }, combat)} />
      <span>/</span>
      {draft ? <NumberInput label={`${t(label)} ${t('máximos')}`} min={0} value={draft.maximums[key]}
        onChange={(maximum) => setDraft((current) => current ? {
          ...current, maximums: { ...current.maximums, [key]: maximum },
        } : null)} /> : <div className={styles.resourceMaximum}><small>{t('Máximo')}</small><strong>{resources[key].maximum}</strong></div>}
    </div>)}</div>
    <div className={styles.fixedGrid}>{draft ? <>
      <NumberInput label={t('Defesa')} min={0} value={draft.defense}
        onChange={(defense) => setDraft((current) => current ? { ...current, defense } : null)} />
      <label className={styles.field}><span>{t('Deslocamento')}</span><input value={draft.movement} placeholder={t('Ex.: 9m / 6q')}
        onChange={(event) => setDraft((current) => current ? { ...current, movement: event.target.value } : null)} /></label>
    </> : <>
      <div className={styles.summaryCell}><span>{t('Defesa')}</span><strong>{combat.defense}</strong></div>
      <div className={styles.summaryCell}><span>{t('Deslocamento')}</span><strong>{combat.movement || '—'}</strong></div>
    </>}</div>
  </section>
}
