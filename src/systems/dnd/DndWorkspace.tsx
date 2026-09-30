import { useState, type ReactNode } from 'react'
import { useCharacterCollection } from '../../shared/collection/useCharacterCollection'
import { CharacterSidebar } from '../../shared/ui/CharacterSidebar'
import { useResponsiveMenu } from '../../shared/ui/useResponsiveMenu'
import logo from '../../shared/assets/tavern-mug.png'
import { useI18n } from '../../i18n/useI18n'
import { createDefaultDndCharacter } from './defaults'
import { DndSheet } from './DndSheet'
import { dndRepository } from './persistence'
import styles from './styles/dnd.module.css'

interface DndWorkspaceProps { active: boolean; mobileSystemSwitcher: ReactNode }

export function DndWorkspace({ active, mobileSystemSwitcher }: DndWorkspaceProps) {
  const { dnd: t, global: g } = useI18n()
  const collection = useCharacterCollection(dndRepository, () => ({
    ...createDefaultDndCharacter(), name: t('New Adventurer'),
  }))
  const [collapsed, setCollapsed] = useState(false)
  const { open, openButtonRef, closeButtonRef, openMenu, close, closeIfOpen } = useResponsiveMenu(active, 541)

  if (!active) return null

  if (collection.status.type === 'read-error') return (
    <section className={styles.readError} aria-label="D&D">
      <h2>D&D</h2>
      <div className={styles.mobileSystemSwitcher}>{mobileSystemSwitcher}</div>
      <div role="alert"><p>{g('Erro de leitura:')} {collection.status.error.message}</p>
        <p>{g('Os dados no dispositivo foram preservados. Corrija o problema e tente ler novamente.')}</p>
        <button type="button" onClick={collection.retryLoad}>{g('Tentar ler novamente')}</button></div>
    </section>
  )

  const items = collection.snapshot?.characters.map((character) => ({
    id: character.id, name: character.name, summary: `${t('Level')} ${character.level}${character.className ? ` ${character.className}` : ''}`,
  })) ?? []

  return (
    <section className={styles.workspace} aria-label="D&D">
      <h2 className={styles.visuallyHidden}>D&D</h2>
      <div className={styles.mobileHeader}>
        <button ref={openButtonRef} data-system-menu-trigger type="button" aria-label={g('Abrir menu de personagens')} aria-controls="dnd-character-sidebar"
          aria-expanded={open} onClick={openMenu}>☰</button>
        <img src={logo} alt="" /><span>{t('Character sheets')}<br /><strong>{t("The Player's Tavern")}</strong></span>
      </div>
      <aside id="dnd-character-sidebar" className={styles.sidebar} data-collapsed={collapsed}
        data-mobile-open={open}>
        <button ref={closeButtonRef} className={styles.mobileClose} type="button" aria-label={g('Fechar menu de personagens')}
          onClick={close}>×</button>
        <button className={styles.collapseButton} type="button"
          aria-label={collapsed ? t('Expand sidebar') : t('Collapse sidebar')}
          onClick={() => setCollapsed((value) => !value)}>{collapsed ? `› ${t('Expand')}` : `‹ ${t('Collapse')}`}</button>
        <div className={styles.brand}>
          <img className={styles.brandMark} src={logo} alt="" />
          <span><small>{t('Character sheets')}</small><strong>{t("Adventurer's Ledger")}</strong></span>
        </div>
        <div className={styles.mobileSystemSwitcher}>{mobileSystemSwitcher}</div>
        <CharacterSidebar items={items} activeId={collection.snapshot?.activeCharacterId ?? null}
          collapsed={collapsed}
          labels={{ heading: t('Your characters'), create: t('New character'), delete: t('Delete selected'),
            confirm: (name) => `${t('Delete')} ${name || t('this character')}?`, cancel: g('Cancelar'),
            confirmDelete: t('Delete character'), unnamed: t('Unnamed character') }}
          onSelect={(id) => { collection.select(id); closeIfOpen() }}
          onCreate={() => { collection.create(); closeIfOpen() }}
          onDelete={(id) => { collection.remove(id); closeIfOpen() }}
          onRequestExpand={() => setCollapsed(false)} />
        <p className={styles.sidebarStatus}>{collection.status.type === 'write-error'
          ? g('Alterações não salvas.') : g('Salvo automaticamente neste dispositivo.')}</p>
      </aside>
      <button className={styles.backdrop} type="button" aria-label={g('Fechar menu de personagens')}
        data-mobile-open={open} onClick={close} />
      <div className={styles.mainArea}>
        {collection.status.type === 'write-error' ? (
          <div className={styles.persistenceError} role="alert">
            <p>{g('Erro de escrita:')} {collection.status.error.message}</p>
            <p>{g('As alterações continuam nesta sessão. Tente salvar novamente.')}</p>
            <button type="button" onClick={collection.retry}>{g('Tentar salvar novamente')}</button>
          </div>
        ) : <p className={styles.visuallyHidden} role="status">{g('Salvo')}</p>}
        {collection.activeCharacter ? (
          <DndSheet key={collection.activeCharacter.id} character={collection.activeCharacter}
            onChange={collection.updateActive} />
        ) : (
          <div className={styles.emptyCard}>
            <img src={logo} alt="" />
            <h3>{items.length === 0 ? g('Nenhuma ficha criada.') : g('Selecione uma ficha.')}</h3>
            <p>{items.length === 0
              ? t('Comece sua aventura criando um personagem de D&D.')
              : t('Escolha um personagem na lista para abrir a ficha.')}</p>
            <button className={styles.primaryButton} type="button" onClick={collection.create}>{g('Criar ficha')}</button>
          </div>
        )}
      </div>
    </section>
  )
}
