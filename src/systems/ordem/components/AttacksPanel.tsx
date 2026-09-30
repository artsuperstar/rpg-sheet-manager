import { useState } from 'react'
import type { OrdemAttack } from '../model'
import styles from '../styles/ordem.module.css'
import { EditButton, EditorActions } from './Controls'

function createAttack(): OrdemAttack {
  return { id: crypto.randomUUID(), name: '', type: '', range: '', test: '', damage: '', criticalTest: '', criticalMultiplier: '' }
}
const fields = [
  ['name', 'Nome do item'], ['type', 'Tipo'], ['range', 'Alcance'], ['test', 'Teste'], ['damage', 'Dano'],
  ['criticalTest', 'Teste de crítico'], ['criticalMultiplier', 'Multiplicador de crítico'],
] as const

export function AttacksPanel({ attacks, onChange }: { attacks: OrdemAttack[]; onChange: (attacks: OrdemAttack[]) => void }) {
  const [draft, setDraft] = useState<OrdemAttack[] | null>(null)
  const valid = draft !== null && draft.every(({ name }) => name.trim())
  function update(id: string, key: keyof OrdemAttack, value: string) {
    setDraft((current) => current?.map((entry) => entry.id === id ? { ...entry, [key]: value } : entry) ?? null)
  }
  return <section id="ataques" className={styles.card} aria-label="Ataques">
    <div className={styles.heading}><div><small>Registro de combate</small><h2>Ataques</h2></div>
      {!draft && attacks.length > 0 && <EditButton label="Editar ataques" onClick={() => setDraft(attacks.map((attack) => ({ ...attack })))} />}</div>
    {draft ? <div className={styles.editor} role="group" aria-label="Editar ataques"
      onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
      {draft.map((entry, index) => <div className={styles.entryEditor} key={entry.id}>
        <div className={styles.heading}><h3>Ataque {index + 1}</h3><button type="button" className={styles.danger}
          aria-label={`Remover ataque ${index + 1}`} onClick={() => setDraft((current) => current?.filter(({ id }) => id !== entry.id) ?? null)}>Remover</button></div>
        <div className={styles.formGrid}>{fields.map(([key, label]) => <label className={styles.field} key={key}>
          <span>{label}</span><input value={entry[key]} onChange={(event) => update(entry.id, key, event.target.value)} />
        </label>)}</div>
      </div>)}
      <div className={styles.editorFooter}><button type="button" onClick={() => setDraft((current) => current ? [...current, createAttack()] : null)}>+ Adicionar ataque</button>
        <EditorActions canSave={Boolean(valid)} onCancel={() => setDraft(null)} onSave={() => {
          if (!draft || !valid) return
          onChange(draft.map((entry) => ({
            id: entry.id, name: entry.name.trim(), type: entry.type.trim(), range: entry.range.trim(),
            test: entry.test.trim(), damage: entry.damage.trim(), criticalTest: entry.criticalTest.trim(),
            criticalMultiplier: entry.criticalMultiplier.trim(),
          })))
          setDraft(null)
        }} /></div>
    </div> : attacks.length === 0 ? <div className={styles.emptyPanel}><p>Nenhum ataque registrado.</p>
      <button className={styles.primary} type="button" onClick={() => setDraft([createAttack()])}>+ Adicionar ataque</button></div>
      : <div className={styles.entryList}>{attacks.map((entry) => <article className={styles.entryCard} key={entry.id}>
        <h3>{entry.name}</h3><p>{[entry.type, entry.range].filter(Boolean).join(' / ')}</p>
        <dl className={styles.facts}><div><dt>Teste</dt><dd>{entry.test || '—'}</dd></div>
          <div><dt>Dano</dt><dd>{entry.damage || '—'}</dd></div>
          <div><dt>Crítico</dt><dd>{entry.criticalTest || entry.criticalMultiplier
            ? `${entry.criticalTest}/${entry.criticalMultiplier ? `x${entry.criticalMultiplier.replace(/^x/i, '')}` : ''}` : '—'}</dd></div></dl>
      </article>)}</div>}
  </section>
}
