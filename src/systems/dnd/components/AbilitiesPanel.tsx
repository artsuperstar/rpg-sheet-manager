import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import { abilityNames, skillDefinitions, type Abilities, type DndCharacter, type RollBonuses } from '../model'
import { abilityModifier, formatModifier } from '../rules'
import styles from '../styles/dnd.module.css'
import { EditButton, EditorActions } from './Controls'
import { useI18n } from '../../../i18n/useI18n'
import { dndAbilityAbbreviation, dndAbilityLabel, dndSkillLabel } from '../../../i18n/domainLabels'

type Draft = { abilities: Abilities; rollBonuses: RollBonuses }

export function AbilitiesPanel({ character, onChange }: {
  character: DndCharacter
  onChange: (update: (current: DndCharacter) => DndCharacter) => void
}) {
  const { dnd: t, locale } = useI18n()
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
    <section className={`${styles.card} ${styles.abilities}`} aria-label={t('Abilities')}>
      <div className={styles.sectionHeading}>
        <div><h3>{t('Abilities')}</h3><p>{t('Saving throw and skill bonuses are editable totals.')}</p></div>
        {!draft && <EditButton label={t('Edit abilities and bonuses')} onClick={() => setDraft({
          abilities: character.abilities, rollBonuses: character.rollBonuses,
        })} />}
      </div>
      {draft ? (
        <div className={styles.editor} role="dialog" aria-label={t('Edit abilities and bonuses')}
          onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
          <div className={styles.editorHeader}><h4>{t('Edit abilities')}</h4><EditorActions onCancel={() => setDraft(null)} onSave={save} canSave={valid} /></div>
          <div className={styles.abilityEditorGrid}>
            <div><h4>{t('Ability scores')}</h4>{abilityNames.map((ability) => (
              <NumberInput key={ability} label={dndAbilityAbbreviation(ability, locale)} min={1} max={30}
                value={draft.abilities[ability]} onChange={(score) => changeScore(ability, score)} />
            ))}</div>
            <div><h4>{t('Saving throws')}</h4>{abilityNames.map((ability) => (
              <NumberInput key={ability} label={dndAbilityLabel(ability, locale)} value={draft.rollBonuses.savingThrows[ability]}
                onChange={(bonus) => setDraft((current) => current ? { ...current, rollBonuses: {
                  ...current.rollBonuses, savingThrows: { ...current.rollBonuses.savingThrows, [ability]: bonus },
                } } : null)} />
            ))}</div>
            <div className={styles.skillEditor}><h4>{t('Skills')}</h4>{skillDefinitions.map(({ name, ability }) => (
              <NumberInput key={name} label={`${dndSkillLabel(name, locale)} (${dndAbilityAbbreviation(ability, locale)})`}
                value={draft.rollBonuses.skills[name]} onChange={(bonus) => setDraft((current) => current ? {
                  ...current, rollBonuses: { ...current.rollBonuses, skills: { ...current.rollBonuses.skills, [name]: bonus } },
                } : null)} />
            ))}</div>
          </div>
        </div>
      ) : (
        <div className={styles.abilityLayout}>
          <div className={styles.scoreList}><h4>{t('Ability scores')}</h4>{abilityNames.map((ability) => (
            <div className={styles.score} key={ability}>
              <span>{dndAbilityLabel(ability, locale)}</span><strong>{character.abilities[ability]}</strong>
              <small>{formatModifier(abilityModifier(character.abilities[ability]))}</small>
            </div>
          ))}</div>
          <div className={styles.bonusLists}>
            <h4>{t('Saving throws')}</h4>{abilityNames.map((ability) => (
              <div className={styles.bonusRow} key={ability}><strong>{formatModifier(character.rollBonuses.savingThrows[ability])}</strong><span>{dndAbilityLabel(ability, locale)}</span></div>
            ))}
            <h4>{t('Skills')}</h4>{skillDefinitions.map(({ name, ability }) => (
              <div className={styles.bonusRow} key={name}><strong>{formatModifier(character.rollBonuses.skills[name])}</strong><span>{dndSkillLabel(name, locale)} <small>({dndAbilityAbbreviation(ability, locale)})</small></span></div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
