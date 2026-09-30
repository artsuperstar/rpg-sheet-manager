import { useState } from 'react'
import { NumberInput } from '../../../shared/ui/NumberInput'
import type { Attributes, OrdemCharacter, SkillBonus } from '../model'
import { attributeDefinitions, formatBonus, skillDefinitions, skillTotal, type SkillId } from '../rules'
import styles from '../styles/ordem.module.css'
import { EditButton, EditorActions } from './Controls'
import { useI18n } from '../../../i18n/useI18n'
import { ordemAttributeAbbreviation, ordemAttributeLabel, ordemSkillDisplayLabel, ordemSkillLabel } from '../../../i18n/domainLabels'

type Skills = OrdemCharacter['skills']
export function AttributesSkillsPanel({ attributes, skills, onChange }: {
  attributes: Attributes; skills: Skills; onChange: (attributes: Attributes, skills: Skills) => void
}) {
  const { ordem: t, locale } = useI18n()
  const [draft, setDraft] = useState<{ attributes: Attributes; skills: Skills } | null>(null)
  const valid = draft !== null && attributeDefinitions.every(({ name }) => Number.isSafeInteger(draft.attributes[name])) &&
    skillDefinitions.every(({ id }) => Number.isFinite(draft.skills[id].trainingBonus) && Number.isFinite(draft.skills[id].otherBonus))
  function changeSkill(id: SkillId, key: keyof SkillBonus, value: number) {
    setDraft((current) => current ? { ...current, skills: {
      ...current.skills, [id]: { ...current.skills[id], [key]: value },
    } } : null)
  }
  return <section id="atributos-pericias" className={styles.card} aria-label={t('Atributos e perícias')}>
    <div className={styles.heading}><div><small>{t('Capacidades do agente')}</small><h2>{t('Atributos & Perícias')}</h2></div>
      {!draft && <EditButton label={t('Editar atributos e perícias')} onClick={() => setDraft({
        attributes: { ...attributes }, skills: structuredClone(skills),
      })} />}</div>
    {draft ? <div role="dialog" aria-label={t('Editar atributos e perícias')} className={styles.editor}
      onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null) }}>
      <div className={styles.attributeGrid}>{attributeDefinitions.map(({ name }) =>
        <NumberInput key={name} label={`${ordemAttributeLabel(name, locale)} (${ordemAttributeAbbreviation(name, locale)})`} value={draft.attributes[name]}
          onChange={(score) => setDraft((current) => current ? { ...current, attributes: { ...current.attributes, [name]: score } } : null)} />)}</div>
      <div className={styles.skillEditor}>{skillDefinitions.map((definition) => <div className={styles.skillRow} key={definition.id}>
        <strong>{ordemSkillDisplayLabel(definition.id, locale)}</strong>
        <small className={styles.attributeCode} data-attribute={definition.attribute}>{ordemAttributeAbbreviation(definition.attribute, locale)}</small>
        <NumberInput label={`${t('Treino de')} ${ordemSkillLabel(definition.id, locale)}`} value={draft.skills[definition.id].trainingBonus}
          onChange={(value) => changeSkill(definition.id, 'trainingBonus', value)} />
        <NumberInput label={`${t('Outros bônus de')} ${ordemSkillLabel(definition.id, locale)}`} value={draft.skills[definition.id].otherBonus}
          onChange={(value) => changeSkill(definition.id, 'otherBonus', value)} />
      </div>)}</div>
      <EditorActions canSave={valid} onCancel={() => setDraft(null)} onSave={() => {
        if (!draft || !valid) return
        onChange(draft.attributes, draft.skills); setDraft(null)
      }} />
    </div> : <div className={styles.abilitiesLayout}>
      <div className={styles.scoreList}>{attributeDefinitions.map(({ name }) =>
        <div className={styles.score} key={name} data-attribute={name}><span>{ordemAttributeLabel(name, locale)}</span><strong>{attributes[name]}</strong><small>{ordemAttributeAbbreviation(name, locale)}</small></div>)}</div>
      <div className={styles.skillList}>{skillDefinitions.map((definition) =>
        <div className={styles.skillDisplay} key={definition.id}>
          <strong>{ordemSkillDisplayLabel(definition.id, locale)}</strong>
          {'trainedOnly' in definition && definition.trainedOnly && <abbr title={t('Somente treinada')}>T</abbr>}
          {'loadPenalty' in definition && definition.loadPenalty && <abbr title={t('Sofre penalidade de carga')}>C</abbr>}
          <small className={styles.attributeCode} data-attribute={definition.attribute}>{ordemAttributeAbbreviation(definition.attribute, locale)}</small>
          <output aria-label={`${t('Bônus de')} ${ordemSkillLabel(definition.id, locale)}`}>{formatBonus(skillTotal(skills[definition.id]))}</output>
        </div>)}</div>
      <p className={styles.legend}>{t('T Somente treinada · C Penalidade de carga')}</p>
    </div>}
  </section>
}
