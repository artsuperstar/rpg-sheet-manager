import { useState } from 'react'
import type { OrdemPower } from '../model'
import styles from '../styles/ordem.module.css'
import { EditButton, EditorActions } from './Controls'

type PowerDraft = OrdemPower & { kind: 'ability' | 'ritual' }
function createPower(kind: PowerDraft['kind']): PowerDraft {
  return { kind, id: crypto.randomUUID(), name: '', cost: '', page: '', description: '' }
}

export function AbilitiesRitualsPanel({ abilities, rituals, onChange }: {
  abilities: OrdemPower[]; rituals: OrdemPower[]
  onChange: (abilities: OrdemPower[], rituals: OrdemPower[]) => void
}) {
  const [draft, setDraft] = useState<PowerDraft[] | null>(null)
  const entries: PowerDraft[] = [
    ...abilities.map((entry) => ({ ...entry, kind: 'ability' as const })),
    ...rituals.map((entry) => ({ ...entry, kind: 'ritual' as const })),
  ]
  const valid = draft !== null && draft.every(({ name }) => name.trim())
  function change(id: string, key: 'name' | 'cost' | 'page' | 'description', value: string) {
    setDraft((current) => current?.map((entry) => entry.id === id ? { ...entry, [key]: value } : entry) ?? null)
  }
  return <section id="habilidades-rituais" className={styles.card} aria-label="Habilidades e Rituais">
    <div className={styles.heading}><div><small>Conhecimentos do agente</small><h2>Habilidades e Rituais</h2></div>
      {!draft && entries.length > 0 && <EditButton label="Editar habilidades e rituais" onClick={() => setDraft(entries)} />}</div>
    {draft ? <div className={styles.editor} role="group" aria-label="Editar habilidades e rituais"
      onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
      {draft.map((entry, index) => <div className={styles.entryEditor} key={entry.id}>
        <div className={styles.heading}><h3>{entry.kind === 'ability' ? 'Habilidade' : 'Ritual'} {index + 1}</h3>
          <button type="button" className={styles.danger} aria-label={`Remover ${entry.kind === 'ability' ? 'habilidade' : 'ritual'} ${index + 1}`}
            onClick={() => setDraft((current) => current?.filter(({ id }) => id !== entry.id) ?? null)}>Remover</button></div>
        <div className={styles.formGrid}>
          {(['name', 'cost', 'page'] as const).map((key) => <label className={styles.field} key={key}>
            <span>{key === 'name' ? `Nome ${entry.kind === 'ability' ? 'da habilidade' : 'do ritual'}` : key === 'cost' ? 'Custo' : 'Página'}</span>
            <input value={entry[key]} onChange={(event) => change(entry.id, key, event.target.value)} />
          </label>)}
          <label className={styles.field}><span>Descrição</span><textarea rows={4} value={entry.description}
            onChange={(event) => change(entry.id, 'description', event.target.value)} /></label>
        </div></div>)}
      <div className={styles.editorFooter}><div className={styles.inlineActions}>
        <button type="button" onClick={() => setDraft((current) => current ? [...current, createPower('ability')] : null)}>+ Adicionar habilidade</button>
        <button type="button" onClick={() => setDraft((current) => current ? [...current, createPower('ritual')] : null)}>+ Adicionar ritual</button>
      </div><EditorActions canSave={Boolean(valid)} onCancel={() => setDraft(null)} onSave={() => {
        if (!draft || !valid) return
        const clean = (kind: PowerDraft['kind']): OrdemPower[] => draft.filter((entry) => entry.kind === kind).map((entry) => ({
          id: entry.id, name: entry.name.trim(), cost: entry.cost.trim(), page: entry.page.trim(), description: entry.description.trim(),
        }))
        onChange(clean('ability'), clean('ritual')); setDraft(null)
      }} /></div>
    </div> : entries.length === 0 ? <div className={styles.emptyPanel}><p>Nenhuma habilidade ou ritual registrado.</p>
      <div className={styles.inlineActions}>
        <button className={styles.primary} type="button" onClick={() => setDraft([createPower('ability')])}>+ Adicionar habilidade</button>
        <button type="button" onClick={() => setDraft([createPower('ritual')])}>+ Adicionar ritual</button>
      </div></div> : <div className={styles.entryList}>{entries.map((entry) => <article className={styles.entryCard} key={entry.id}>
      <small>{entry.kind === 'ability' ? 'Habilidade' : 'Ritual'}</small><h3>{entry.name}</h3>
      {(entry.cost || entry.page) && <p>{entry.cost && `Custo: ${entry.cost}`} {entry.page && `Página: ${entry.page}`}</p>}
      {entry.description && <p>{entry.description}</p>}
    </article>)}</div>}
  </section>
}
