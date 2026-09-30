import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import type { AttackEntry, DndCharacter, SpellSlot } from '../model'
import { formatModifier } from '../rules'
import styles from '../styles/dnd.module.css'
import { EditButton, EditorActions } from './Controls'
import { useI18n } from '../../../i18n/useI18n'

type Draft = { attacks: AttackEntry[]; spellSlots: SpellSlot[] }

function newAttack(): AttackEntry {
  return { id: crypto.randomUUID(), name: '', attackBonus: 0, damageDice: '' }
}

function newSlot(): SpellSlot {
  return { id: crypto.randomUUID(), level: 1, maximumSlots: 1, remainingSlots: 1, recharge: 'longRest' }
}

export function AttackSpellcastingPanel({ character, onChange }: {
  character: DndCharacter
  onChange: (update: (current: DndCharacter) => DndCharacter) => void
}) {
  const { dnd: t, locale } = useI18n()
  const slotLevel = (level: number) => `${t('Level')} ${level}`
  const rechargeTitle = (rest: 'shortRest' | 'longRest') => locale === 'en'
    ? `Recharges on a ${rest === 'shortRest' ? 'short' : 'long'} rest`
    : `Recupera após descanso ${rest === 'shortRest' ? 'curto' : 'longo'}`
  const [draft, setDraft] = useState<Draft | null>(null)
  const valid = draft !== null && draft.attacks.every(({ name, damageDice }) => name.trim() && damageDice.trim()) &&
    draft.spellSlots.every(({ level, maximumSlots }) => Number.isSafeInteger(level) && level >= 1 && level <= 9 &&
      Number.isSafeInteger(maximumSlots) && maximumSlots >= 1)

  function changeAttack(id: string, update: Partial<AttackEntry>) {
    setDraft((current) => current ? { ...current, attacks: current.attacks.map((attack) =>
      attack.id === id ? { ...attack, ...update } : attack) } : null)
  }

  function changeSlot(id: string, update: Partial<SpellSlot>) {
    setDraft((current) => current ? { ...current, spellSlots: current.spellSlots.map((slot) => {
      if (slot.id !== id) return slot
      const changed = { ...slot, ...update }
      return { ...changed, remainingSlots: update.maximumSlots === undefined ? changed.remainingSlots
        : slot.remainingSlots === slot.maximumSlots ? changed.maximumSlots
          : Math.min(changed.remainingSlots, changed.maximumSlots) }
    }) } : null)
  }

  function save() {
    if (!draft || !valid) return
    const attacks = draft.attacks.map((attack) => ({ ...attack, name: attack.name.trim(), damageDice: attack.damageDice.trim() }))
    onChange((current) => current.attacks === draft.attacks && current.spellSlots === draft.spellSlots
      ? current : { ...current, attacks, spellSlots: draft.spellSlots })
    setDraft(null)
  }

  return (
    <section className={`${styles.card} ${styles.attacks}`} aria-label={t('Attacks & Spellcasting')}>
      <div className={styles.sectionHeading}><h3>{t('Attacks & Spellcasting')}</h3>
        {!draft && <EditButton label={t('Edit attacks, spells, and spell slots')} onClick={() => setDraft({
          attacks: character.attacks, spellSlots: character.spellSlots,
        })} />}
      </div>
      {draft ? (
        <div className={styles.editor} role="dialog" aria-label={t('Edit attacks, spells, and spell slots')}
          onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
          <div className={styles.editorList}>{draft.attacks.map((attack) => (
            <div className={styles.attackEditorRow} key={attack.id}>
              <label className={styles.field}><span>{t('Name')}</span><input value={attack.name} onChange={(event) => changeAttack(attack.id, { name: event.target.value })} /></label>
              <NumberInput label={t('Bonus')} value={attack.attackBonus} onChange={(attackBonus) => changeAttack(attack.id, { attackBonus })} />
              <label className={styles.field}><span>{t('Damage / dice')}</span><input value={attack.damageDice} onChange={(event) => changeAttack(attack.id, { damageDice: event.target.value })} /></label>
              <button className={styles.iconButton} type="button" aria-label={`${t('Remove')} ${attack.name || t('entry')}`}
                onClick={() => setDraft((current) => current ? { ...current, attacks: current.attacks.filter(({ id }) => id !== attack.id) } : null)}>×</button>
            </div>
          ))}</div>
          {draft.spellSlots.length > 0 && <h4>{t('Spell slots')}</h4>}
          <div className={styles.editorList}>{draft.spellSlots.map((slot) => (
            <div className={styles.slotEditorRow} key={slot.id}>
              <label className={styles.field}><span>{t('Level')}</span><select aria-label={t('Spell slot level')} value={slot.level}
                onChange={(event) => changeSlot(slot.id, { level: Number(event.target.value) })}>
                {Array.from({ length: 9 }, (_, index) => index + 1).map((level) => <option key={level} value={level}>{level}</option>)}
              </select></label>
              <NumberInput label={`${slotLevel(slot.level)} ${locale === 'en' ? 'slot amount' : 'quantidade de espaços'}`} value={slot.maximumSlots} min={1}
                onChange={(maximumSlots) => changeSlot(slot.id, { maximumSlots })} />
              <label className={styles.field}><span>{t('Resets on')}</span><select aria-label={`${slotLevel(slot.level)} ${locale === 'en' ? 'slot reset' : 'recuperação de espaços'}`}
                value={slot.recharge} onChange={(event) => changeSlot(slot.id, {
                  recharge: event.target.value === 'shortRest' ? 'shortRest' : 'longRest',
                })}>
                <option value="shortRest">{t('Short Rest')}</option><option value="longRest">{t('Long Rest')}</option>
              </select></label>
              <button className={styles.iconButton} type="button" aria-label={`${t('Remove')} ${slotLevel(slot.level)} ${t('Spell slots')}`}
                onClick={() => setDraft((current) => current ? {
                  ...current, spellSlots: current.spellSlots.filter(({ id }) => id !== slot.id),
                } : null)}>×</button>
            </div>
          ))}</div>
          <div className={styles.attackActions}>
            <div className={styles.editorActions}>
              <button className={styles.button} type="button" onClick={() => setDraft((current) => current ? {
                ...current, attacks: [...current.attacks, newAttack()],
              } : null)}>{t('+ Add attack or spell')}</button>
              <button className={styles.button} type="button" onClick={() => setDraft((current) => current ? {
                ...current, spellSlots: [...current.spellSlots, newSlot()],
              } : null)}>{t('+ Add spell slots')}</button>
            </div>
            <EditorActions onCancel={() => setDraft(null)} onSave={save} canSave={Boolean(valid)} />
          </div>
        </div>
      ) : (
        <>
          {character.attacks.length === 0 ? <p className={styles.emptyHint}>{t('No attacks or spells added yet.')}</p> : (
            <div className={styles.attackTable}>
              <div className={styles.attackTableHead}><span>{t('Name')}</span><span>{t('Bonus')}</span><span>{t('Damage / dice')}</span></div>
              {character.attacks.map((attack) => <div className={styles.attackTableRow} key={attack.id}>
                <strong>{attack.name}</strong><span>{formatModifier(attack.attackBonus)}</span><span>{attack.damageDice}</span>
              </div>)}
            </div>
          )}
          {character.spellSlots.length > 0 && <div className={styles.slotList}><h4>{t('Spell slots')}</h4>{character.spellSlots.map((slot) => (
            <article className={styles.counterRow} data-depleted={slot.remainingSlots === 0} key={slot.id}>
              <div><strong>{slotLevel(slot.level)}</strong> <span className={styles.restBadge} data-rest={slot.recharge}
                title={rechargeTitle(slot.recharge)}>{slot.recharge === 'shortRest' ? t('Short Rest') : t('Long Rest')}</span></div>
              <div className={styles.counterActions}>
                <button type="button" aria-label={`${t('Use')} ${slotLevel(slot.level)} ${t('Spell slots')}`} disabled={slot.remainingSlots <= 0}
                  onClick={() => onChange((current) => ({ ...current, spellSlots: current.spellSlots.map((entry) =>
                    entry.id === slot.id ? { ...entry, remainingSlots: Math.max(0, entry.remainingSlots - 1) } : entry) }))}>−</button>
                <output aria-label={`${slotLevel(slot.level)} ${t('Spell slots')} ${locale === 'en' ? 'remaining' : 'restantes'}`}>{slot.remainingSlots}/{slot.maximumSlots}</output>
                <button type="button" aria-label={`${t('Reset')} ${slotLevel(slot.level)} ${t('Spell slots')}`} disabled={slot.remainingSlots === slot.maximumSlots}
                  onClick={() => onChange((current) => ({ ...current, spellSlots: current.spellSlots.map((entry) =>
                    entry.id === slot.id ? { ...entry, remainingSlots: entry.maximumSlots } : entry) }))}>{t('Reset')}</button>
              </div>
            </article>
          ))}</div>}
        </>
      )}
    </section>
  )
}
