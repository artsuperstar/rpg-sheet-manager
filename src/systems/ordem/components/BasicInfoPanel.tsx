import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import type { OrdemCharacter } from '../model'
import styles from '../styles/ordem.module.css'
import { EditButton, EditorActions } from './Controls'

type Info = OrdemCharacter['basicInfo']
export function BasicInfoPanel({ value, onChange }: { value: Info; onChange: (next: Info) => void }) {
  const [draft, setDraft] = useState<Info | null>(null)
  const valid = Boolean(draft?.name.trim()) && draft !== null && draft.nex >= 0 && draft.nex <= 100 &&
    Number.isSafeInteger(draft.effortPerRoundLimit) && draft.effortPerRoundLimit >= 0
  function textField(key: 'name' | 'origin' | 'className' | 'track', label: string) {
    return <label className={styles.field} key={key}><span>{label}</span><input value={draft?.[key] ?? ''}
      onChange={(event) => setDraft((current) => current ? { ...current, [key]: event.target.value } : null)} /></label>
  }
  return <section id="visao-geral" className={styles.card} aria-label="Informações básicas">
    <div className={styles.heading}><div><small>Identificação</small><h2>Informações básicas</h2></div>
      {!draft && <EditButton label="Editar informações básicas" onClick={() => setDraft({ ...value })} />}</div>
    {draft ? <div className={styles.editor} role="dialog" aria-label="Editar informações básicas"
      onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
      <div className={styles.formGrid}>
        {textField('name', 'Nome do personagem')}{textField('origin', 'Origem')}
        {textField('className', 'Classe')}{textField('track', 'Trilha')}
        <NumberInput label="NEX (%)" min={0} max={100} value={draft.nex}
          onChange={(nex) => setDraft((current) => current ? { ...current, nex } : null)} />
        <NumberInput label="Limite de PE/Rodada" min={0} value={draft.effortPerRoundLimit}
          onChange={(effortPerRoundLimit) => setDraft((current) => current ? { ...current, effortPerRoundLimit } : null)} />
      </div>
      <EditorActions canSave={valid} onCancel={() => setDraft(null)} onSave={() => {
        if (!draft || !valid) return
        onChange({ ...draft, name: draft.name.trim() }); setDraft(null)
      }} />
    </div> : <div className={styles.summaryGrid}>
      {([['Origem', value.origin || '—'], ['Classe', value.className || '—'], ['Trilha', value.track || '—']] as const).map(([label, content]) =>
        <div className={styles.summaryCell} key={label}><span>{label}</span><strong>{content}</strong></div>)}
      <div className={styles.summaryMetrics} role="group" aria-label="NEX e limite de PE por rodada">
        <div><span>NEX</span><strong>{value.nex}%</strong></div>
        <div><span>Limite de PE/Rodada</span><strong>{value.effortPerRoundLimit}</strong></div>
      </div>
    </div>}
  </section>
}
