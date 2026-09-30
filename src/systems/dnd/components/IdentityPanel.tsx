import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import type { DndCharacter } from '../model'
import styles from '../styles/dnd.module.css'
import { EditButton, EditorActions } from './Controls'

type Identity = Pick<DndCharacter, 'name' | 'className' | 'ancestry' | 'background' | 'level'>

export function IdentityPanel({ character, onChange }: {
  character: DndCharacter
  onChange: (update: (current: DndCharacter) => DndCharacter) => void
}) {
  const [draft, setDraft] = useState<Identity | null>(null)
  const valid = draft !== null && draft.name.trim().length > 0 && Number.isSafeInteger(draft.level) && draft.level >= 1
  const fields = [
    ['className', 'Class'], ['ancestry', 'Ancestry'], ['background', 'Background'], ['level', 'Level'],
  ] as const

  function save() {
    if (!draft || !valid) return
    const identity = { ...draft, name: draft.name.trim() }
    onChange((current) => {
      if (current.name === identity.name && current.className === identity.className &&
        current.ancestry === identity.ancestry && current.background === identity.background &&
        current.level === identity.level) return current
      return { ...current, ...identity }
    })
    setDraft(null)
  }

  return (
    <section className={`${styles.card} ${styles.identity}`} aria-label="Character details">
      <div className={styles.sectionHeading}>
        <h3>Character details</h3>
        {!draft && <EditButton label="Edit character details" onClick={() => setDraft({
          name: character.name, className: character.className, ancestry: character.ancestry,
          background: character.background, level: character.level,
        })} />}
      </div>
      {draft ? (
        <div className={styles.editor} role="dialog" aria-label="Edit character details"
          onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
          <div className={styles.editorHeader}><h4>Edit character details</h4><EditorActions onCancel={() => setDraft(null)} onSave={save} canSave={valid} /></div>
          <div className={styles.identityEditorGrid}>
            {(['name', 'className', 'ancestry', 'background'] as const).map((field) => (
              <label className={styles.field} key={field}>
                <span>{field === 'name' ? 'Character name' : field === 'className' ? 'Class' : field === 'ancestry' ? 'Ancestry' : 'Background'}</span>
                <input value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
              </label>
            ))}
            <NumberInput label="Level" value={draft.level} min={1} onChange={(level) => setDraft({ ...draft, level })} />
          </div>
        </div>
      ) : (
        <div className={styles.identitySummary}>
          {fields.map(([field, label]) => <div key={field}><span>{label}</span><strong>{character[field] || '—'}</strong></div>)}
        </div>
      )}
    </section>
  )
}
