import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import { abilityNames, skillDefinitions, type Abilities, type DndCharacter, type RollBonuses } from '../model'
import { abilityAbbreviation, abilityLabel, abilityModifier, formatModifier } from '../rules'
import styles from '../styles/dnd.module.css'
import { EditButton, EditorActions } from './Controls'

type Draft = { abilities: Abilities; rollBonuses: RollBonuses }

export function AbilitiesPanel({ character, onChange }: {
  character: DndCharacter
  onChange: (update: (current: DndCharacter) => DndCharacter) => void
}) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const valid = draft !== null && abilityNames.every((name) => Number.isSafeInteger(draft.abilities[name]) &&
    draft.abilities[name] >= 1 && draft.abilities[name] <= 30)

  function changeScore(ability: (typeof abilityNames)[number], score: number) {
    setDraft((current) => {
      if (!current) return null
      const delta = abilityModifier(score) - abilityModifier(current.abilities[ability])
      const skills = { ...current.rollBonuses.skills }
      for (const skill of skillDefinitions) {
        if (skill.ability === ability) skills[skill.name] += delta
      }
      return {
        abilities: { ...current.abilities, [ability]: score },
        rollBonuses: {
          savingThrows: { ...current.rollBonuses.savingThrows,
            [ability]: current.rollBonuses.savingThrows[ability] + delta },
          skills,
        },
      }
    })
  }

  function save() {
    if (!draft || !valid) return
    onChange((current) => current.abilities === draft.abilities && current.rollBonuses === draft.rollBonuses
      ? current : { ...current, abilities: draft.abilities, rollBonuses: draft.rollBonuses })
    setDraft(null)
  }

  return (
    <section className={`${styles.card} ${styles.abilities}`} aria-label="Abilities">
      <div className={styles.sectionHeading}>
        <div><h3>Abilities</h3><p>Saving throw and skill bonuses are editable totals.</p></div>
        {!draft && <EditButton label="Edit abilities and bonuses" onClick={() => setDraft({
          abilities: character.abilities, rollBonuses: character.rollBonuses,
        })} />}
      </div>
      {draft ? (
        <div className={styles.editor} role="dialog" aria-label="Edit abilities and bonuses"
          onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
          <div className={styles.editorHeader}><h4>Edit abilities</h4><EditorActions onCancel={() => setDraft(null)} onSave={save} canSave={valid} /></div>
          <div className={styles.abilityEditorGrid}>
            <div><h4>Ability scores</h4>{abilityNames.map((ability) => (
              <NumberInput key={ability} label={abilityAbbreviation(ability)} min={1} max={30}
                value={draft.abilities[ability]} onChange={(score) => changeScore(ability, score)} />
            ))}</div>
            <div><h4>Saving throws</h4>{abilityNames.map((ability) => (
              <NumberInput key={ability} label={abilityLabel(ability)} value={draft.rollBonuses.savingThrows[ability]}
                onChange={(bonus) => setDraft((current) => current ? { ...current, rollBonuses: {
                  ...current.rollBonuses, savingThrows: { ...current.rollBonuses.savingThrows, [ability]: bonus },
                } } : null)} />
            ))}</div>
            <div className={styles.skillEditor}><h4>Skills</h4>{skillDefinitions.map(({ name, label, ability }) => (
              <NumberInput key={name} label={`${label} (${abilityAbbreviation(ability)})`}
                value={draft.rollBonuses.skills[name]} onChange={(bonus) => setDraft((current) => current ? {
                  ...current, rollBonuses: { ...current.rollBonuses, skills: { ...current.rollBonuses.skills, [name]: bonus } },
                } : null)} />
            ))}</div>
          </div>
        </div>
      ) : (
        <div className={styles.abilityLayout}>
          <div className={styles.scoreList}><h4>Ability scores</h4>{abilityNames.map((ability) => (
            <div className={styles.score} key={ability}>
              <span>{abilityLabel(ability)}</span><strong>{character.abilities[ability]}</strong>
              <small>{formatModifier(abilityModifier(character.abilities[ability]))}</small>
            </div>
          ))}</div>
          <div className={styles.bonusLists}>
            <h4>Saving throws</h4>{abilityNames.map((ability) => (
              <div className={styles.bonusRow} key={ability}><strong>{formatModifier(character.rollBonuses.savingThrows[ability])}</strong><span>{abilityLabel(ability)}</span></div>
            ))}
            <h4>Skills</h4>{skillDefinitions.map(({ name, label, ability }) => (
              <div className={styles.bonusRow} key={name}><strong>{formatModifier(character.rollBonuses.skills[name])}</strong><span>{label} <small>({abilityAbbreviation(ability)})</small></span></div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
