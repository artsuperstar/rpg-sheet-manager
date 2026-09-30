import type { DndCharacter } from './model'
import { AbilitiesPanel } from './components/AbilitiesPanel'
import { AttackSpellcastingPanel } from './components/AttackSpellcastingPanel'
import { CombatPanel } from './components/CombatPanel'
import { EquipmentPanel } from './components/EquipmentPanel'
import { FeaturesPanel } from './components/FeaturesPanel'
import { IdentityPanel } from './components/IdentityPanel'
import styles from './styles/dnd.module.css'

interface DndSheetProps {
  character: DndCharacter
  onChange: (update: (current: DndCharacter) => DndCharacter) => void
}

export function DndSheet({ character, onChange }: DndSheetProps) {
  return (
    <div className={styles.sheet}>
      <header className={styles.sheetHeader}>
        <p>Active character</p>
        <h2>{character.name || 'Unnamed character'}</h2>
      </header>
      <IdentityPanel character={character} onChange={onChange} />
      <div className={styles.dashboard}>
        <AbilitiesPanel character={character} onChange={onChange} />
        <CombatPanel character={character} onChange={onChange} />
        <AttackSpellcastingPanel character={character} onChange={onChange} />
        <EquipmentPanel character={character} onChange={onChange} />
        <FeaturesPanel character={character} onChange={onChange} />
        <section className={`${styles.card} ${styles.notes}`} aria-label="Notes">
          <h3>Notes</h3>
          <textarea aria-label="Notes" placeholder="Session notes, quests, NPCs…" value={character.notes}
            onChange={(event) => {
              const notes = event.target.value
              onChange((current) => ({ ...current, notes }))
            }} />
        </section>
      </div>
    </div>
  )
}
