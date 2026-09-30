import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import type { DndCharacter } from '../model'
import styles from '../styles/dnd.module.css'
import { EditButton, EditorActions } from './Controls'

type StableStats = { armorClass: number; speed: number; maximum: number }

export function CombatPanel({ character, onChange }: {
  character: DndCharacter
  onChange: (update: (current: DndCharacter) => DndCharacter) => void
}) {
  const [draft, setDraft] = useState<StableStats | null>(null)
  const valid = draft !== null && Number.isSafeInteger(draft.armorClass) && draft.armorClass >= 0 &&
    Number.isSafeInteger(draft.speed) && draft.speed >= 0 && Number.isSafeInteger(draft.maximum) && draft.maximum >= 1

  function save() {
    if (!draft || !valid) return
    onChange((current) => current.armorClass === draft.armorClass && current.speed === draft.speed &&
      current.hitPoints.maximum === draft.maximum ? current : {
        ...current, armorClass: draft.armorClass, speed: draft.speed,
        hitPoints: { ...current.hitPoints, maximum: draft.maximum },
      })
    setDraft(null)
  }

  return (
    <section className={`${styles.card} ${styles.combat}`} aria-label="Combat">
      <div className={styles.sectionHeading}><h3>Combat</h3>
        {!draft && <EditButton label="Edit combat stats" onClick={() => setDraft({
          armorClass: character.armorClass, speed: character.speed, maximum: character.hitPoints.maximum,
        })} />}
      </div>
      {draft ? (
        <div className={styles.editor} role="dialog" aria-label="Edit combat stats"
          onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
          <div className={styles.combatGrid}>
            <NumberInput label="Maximum HP" min={1} value={draft.maximum} onChange={(maximum) => setDraft({ ...draft, maximum })} />
            <NumberInput label="Armor class" min={0} value={draft.armorClass} onChange={(armorClass) => setDraft({ ...draft, armorClass })} />
            <NumberInput label="Speed" min={0} value={draft.speed} onChange={(speed) => setDraft({ ...draft, speed })} />
          </div>
          <EditorActions onCancel={() => setDraft(null)} onSave={save} canSave={valid} />
        </div>
      ) : (
        <div className={styles.combatGrid}>
          <div className={styles.combatStat}><span>Maximum HP</span><strong>{character.hitPoints.maximum}</strong></div>
          <div className={styles.combatStat}><span>Armor class</span><strong>{character.armorClass}</strong></div>
          <div className={styles.combatStat}><span>Speed</span><strong>{character.speed}</strong></div>
        </div>
      )}
      <div className={styles.hitPoints}>
        <NumberInput label="Current hit points" value={character.hitPoints.current}
          onChange={(currentHp) => onChange((current) => ({ ...current, hitPoints: { ...current.hitPoints, current: currentHp } }))} />
        <NumberInput label="Temporary hit points" min={0} value={character.hitPoints.temporary}
          onChange={(temporary) => onChange((current) => ({ ...current, hitPoints: { ...current.hitPoints, temporary } }))} />
      </div>
    </section>
  )
}
