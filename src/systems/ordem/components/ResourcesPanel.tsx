import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import type { OrdemCharacter, ResourceName } from '../model'
import styles from '../styles/ordem.module.css'
import { EditButton, EditorActions } from './Controls'

type Resources = OrdemCharacter['resources']
type Combat = OrdemCharacter['combat']
const entries = [
  { key: 'hitPoints', short: 'PV', label: 'Pontos de Vida' },
  { key: 'effortPoints', short: 'PE', label: 'Pontos de Esforço' },
  { key: 'sanity', short: 'SAN', label: 'Sanidade' },
] as const
type Draft = { maximums: Record<ResourceName, number>; defense: number; movement: string }

export function ResourcesPanel({ resources, combat, onChange }: {
  resources: Resources; combat: Combat; onChange: (resources: Resources, combat: Combat) => void
}) {
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
  return <section id="recursos" className={styles.card} aria-label="Recursos">
    <div className={styles.heading}><div><small>Estado do agente</small><h2>Recursos</h2></div>
      <div className={styles.headingActions}><span>Atualização direta</span>{draft
        ? <EditorActions canSave={valid} onCancel={() => setDraft(null)} onSave={save} />
        : <EditButton label="Editar recursos" onClick={() => setDraft({
          maximums: { hitPoints: resources.hitPoints.maximum, effortPoints: resources.effortPoints.maximum,
            sanity: resources.sanity.maximum }, defense: combat.defense, movement: combat.movement,
        })} />}</div></div>
    <div className={styles.resourceGrid}>{entries.map(({ key, short, label }) => <div className={styles.resourceCard} key={key}>
      <div><strong>{short}</strong><small>{label}</small></div>
      <NumberInput label={`${label} atuais`} min={0} max={resources[key].maximum} value={resources[key].current}
        onChange={(current) => onChange({ ...resources, [key]: { ...resources[key], current } }, combat)} />
      <span>/</span>
      {draft ? <NumberInput label={`${label} máximos`} min={0} value={draft.maximums[key]}
        onChange={(maximum) => setDraft((current) => current ? {
          ...current, maximums: { ...current.maximums, [key]: maximum },
        } : null)} /> : <div className={styles.resourceMaximum}><small>Máximo</small><strong>{resources[key].maximum}</strong></div>}
    </div>)}</div>
    <div className={styles.fixedGrid}>{draft ? <>
      <NumberInput label="Defesa" min={0} value={draft.defense}
        onChange={(defense) => setDraft((current) => current ? { ...current, defense } : null)} />
      <label className={styles.field}><span>Deslocamento</span><input value={draft.movement} placeholder="Ex.: 9m / 6q"
        onChange={(event) => setDraft((current) => current ? { ...current, movement: event.target.value } : null)} /></label>
    </> : <>
      <div className={styles.summaryCell}><span>Defesa</span><strong>{combat.defense}</strong></div>
      <div className={styles.summaryCell}><span>Deslocamento</span><strong>{combat.movement || '—'}</strong></div>
    </>}</div>
  </section>
}
