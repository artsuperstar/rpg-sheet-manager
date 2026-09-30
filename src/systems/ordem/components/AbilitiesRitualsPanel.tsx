import { useState } from 'react'
import type { OrdemPower } from '../model'
import styles from '../styles/ordem.module.css'
import { EditButton, EditorActions } from './Controls'
import { useI18n } from '../../../i18n/useI18n'

type PowerDraft = OrdemPower & { kind: 'ability' | 'ritual' }
function createPower(kind: PowerDraft['kind']): PowerDraft {
  return { kind, id: crypto.randomUUID(), name: '', cost: '', page: '', description: '' }
}

export function AbilitiesRitualsPanel({ abilities, rituals, onChange }: {
  abilities: OrdemPower[]; rituals: OrdemPower[]
  onChange: (abilities: OrdemPower[], rituals: OrdemPower[]) => void
}) {
  const { ordem: t } = useI18n()
  const [draft, setDraft] = useState<PowerDraft[] | null>(null)
  const entries: PowerDraft[] = [
    ...abilities.map((entry) => ({ ...entry, kind: 'ability' as const })),
    ...rituals.map((entry) => ({ ...entry, kind: 'ritual' as const })),
  ]
  const valid = draft !== null && draft.every(({ name }) => name.trim())
  function change(id: string, key: 'name' | 'cost' | 'page' | 'description', value: string) {
    setDraft((current) => current?.map((entry) => entry.id === id ? { ...entry, [key]: value } : entry) ?? null)
  }
  return <section id="habilidades-rituais" className={styles.card} aria-label={t('Habilidades e Rituais')}>
    <div className={styles.heading}><div><small>{t('Conhecimentos do agente')}</small><h2>{t('Habilidades e Rituais')}</h2></div>
      {!draft && entries.length > 0 && <EditButton label={t('Editar habilidades e rituais')} onClick={() => setDraft(entries)} />}</div>
    {draft ? <div className={styles.editor} role="group" aria-label={t('Editar habilidades e rituais')}
      onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
      {draft.map((entry, index) => <div className={styles.entryEditor} key={entry.id}>
        <div className={styles.heading}><h3>{entry.kind === 'ability' ? t('Habilidade') : t('Ritual')} {index + 1}</h3>
          <button type="button" className={styles.danger} aria-label={`${t('Remover')} ${entry.kind === 'ability' ? t('habilidade') : t('ritual')} ${index + 1}`}
            onClick={() => setDraft((current) => current?.filter(({ id }) => id !== entry.id) ?? null)}>{t('Remover')}</button></div>
        <div className={styles.formGrid}>
          {(['name', 'cost', 'page'] as const).map((key) => <label className={styles.field} key={key}>
            <span>{key === 'name' ? entry.kind === 'ability' ? t('Nome da habilidade') : t('Nome do ritual') : key === 'cost' ? t('Custo') : t('Página')}</span>
            <input value={entry[key]} onChange={(event) => change(entry.id, key, event.target.value)} />
          </label>)}
          <label className={styles.field}><span>{t('Descrição')}</span><textarea rows={4} value={entry.description}
            onChange={(event) => change(entry.id, 'description', event.target.value)} /></label>
        </div></div>)}
      <div className={styles.editorFooter}><div className={styles.inlineActions}>
        <button type="button" onClick={() => setDraft((current) => current ? [...current, createPower('ability')] : null)}>+ {t('Adicionar habilidade')}</button>
        <button type="button" onClick={() => setDraft((current) => current ? [...current, createPower('ritual')] : null)}>+ {t('Adicionar ritual')}</button>
      </div><EditorActions canSave={Boolean(valid)} onCancel={() => setDraft(null)} onSave={() => {
        if (!draft || !valid) return
        const clean = (kind: PowerDraft['kind']): OrdemPower[] => draft.filter((entry) => entry.kind === kind).map((entry) => ({
          id: entry.id, name: entry.name.trim(), cost: entry.cost.trim(), page: entry.page.trim(), description: entry.description.trim(),
        }))
        onChange(clean('ability'), clean('ritual')); setDraft(null)
      }} /></div>
    </div> : entries.length === 0 ? <div className={styles.emptyPanel}><p>{t('Nenhuma habilidade ou ritual registrado.')}</p>
      <div className={styles.inlineActions}>
        <button className={styles.primary} type="button" onClick={() => setDraft([createPower('ability')])}>+ {t('Adicionar habilidade')}</button>
        <button type="button" onClick={() => setDraft([createPower('ritual')])}>+ {t('Adicionar ritual')}</button>
      </div></div> : <div className={styles.entryList}>{entries.map((entry) => <article className={styles.entryCard} key={entry.id}>
      <small>{entry.kind === 'ability' ? t('Habilidade') : t('Ritual')}</small><h3>{entry.name}</h3>
      {(entry.cost || entry.page) && <p>{entry.cost && `${t('Custo')}: ${entry.cost}`} {entry.page && `${t('Página')}: ${entry.page}`}</p>}
      {entry.description && <p>{entry.description}</p>}
    </article>)}</div>}
  </section>
}
