import type { OrdemCharacter } from './model'
import { AbilitiesRitualsPanel } from './components/AbilitiesRitualsPanel'
import { AttacksPanel } from './components/AttacksPanel'
import { AttributesSkillsPanel } from './components/AttributesSkillsPanel'
import { BasicInfoPanel } from './components/BasicInfoPanel'
import { InventoryPanel } from './components/InventoryPanel'
import { ResourcesPanel } from './components/ResourcesPanel'
import styles from './styles/ordem.module.css'
import { useI18n } from '../../i18n/useI18n'

interface Props {
  character: OrdemCharacter
  onChange: (update: (current: OrdemCharacter) => OrdemCharacter) => void
}

const sections = [
  ['visao-geral', 'Visão geral'], ['atributos-pericias', 'Atributos'], ['recursos', 'Recursos'],
  ['ataques', 'Ataques'], ['inventario', 'Inventário'], ['habilidades-rituais', 'Habilidades e Rituais'],
  ['anotacoes', 'Anotações'],
] as const

export function OrdemSheet({ character, onChange }: Props) {
  const { ordem: t } = useI18n()
  return <div className={styles.sheet}>
    <header className={styles.sheetHeader}>
      <p>{t('Dossiê ativo')} <span aria-hidden="true">/</span> {t('Acesso local')}</p>
      <h2>{character.basicInfo.name || t('Agente sem nome')}</h2>
      <div className={styles.metadata}><span>{character.basicInfo.nex}% NEX</span>
        {character.basicInfo.className && <span>{character.basicInfo.className}</span>}
        {character.basicInfo.origin && <span>{character.basicInfo.origin}</span>}</div>
      <small>{t('Este é um conteúdo não oficial, publicado sob a Licença da Comunidade de Ordem Paranormal. Contém material gerado por inteligência artificial.')}</small>
    </header>
    <nav className={styles.sectionNav} aria-label={t('Seções da ficha')}>
      {sections.map(([id, label], index) => <a href={`#${id}`} key={id}><span>{String(index + 1).padStart(2, '0')}</span>{t(label)}</a>)}
    </nav>
    <BasicInfoPanel value={character.basicInfo} onChange={(basicInfo) => onChange((current) => ({ ...current, basicInfo }))} />
    <div className={styles.dashboard}>
      <AttributesSkillsPanel attributes={character.attributes} skills={character.skills}
        onChange={(attributes, skills) => onChange((current) => ({ ...current, attributes, skills }))} />
      <ResourcesPanel resources={character.resources} combat={character.combat}
        onChange={(resources, combat) => onChange((current) => ({ ...current, resources, combat }))} />
      <AttacksPanel attacks={character.attacks} onChange={(attacks) => onChange((current) => ({ ...current, attacks }))} />
      <InventoryPanel settings={character.inventorySettings} items={character.inventory}
        onChange={(inventorySettings, inventory) => onChange((current) => ({ ...current, inventorySettings, inventory }))} />
      <AbilitiesRitualsPanel abilities={character.abilities} rituals={character.rituals}
        onChange={(abilities, rituals) => onChange((current) => ({ ...current, abilities, rituals }))} />
      <section id="anotacoes" className={styles.card} aria-label={t('Anotações')}>
        <div className={styles.heading}><div><small>{t('Registro de campo')}</small><h2>{t('Anotações')}</h2></div></div>
        <textarea aria-label={t('Anotações')} placeholder={t('Pistas, contatos, missões e observações…')} value={character.notes}
          onChange={(event) => { const notes = event.target.value; onChange((current) => ({ ...current, notes })) }} />
      </section>
    </div>
  </div>
}
