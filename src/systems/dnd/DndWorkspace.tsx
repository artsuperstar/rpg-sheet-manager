import { useState } from 'react'
import { useCharacterCollection } from '../../shared/collection/useCharacterCollection'
import { CharacterSidebar } from '../../shared/ui/CharacterSidebar'
import { useResponsiveMenu } from '../../shared/ui/useResponsiveMenu'
import logo from './assets/players-tavern-logo.png'
import { createDefaultDndCharacter } from './defaults'
import { DndSheet } from './DndSheet'
import { dndRepository } from './persistence'
import styles from './styles/dnd.module.css'

interface DndWorkspaceProps { active: boolean }

export function DndWorkspace({ active }: DndWorkspaceProps) {
  const collection = useCharacterCollection(dndRepository, createDefaultDndCharacter)
  const [collapsed, setCollapsed] = useState(false)
  const { open, openButtonRef, closeButtonRef, openMenu, close, closeIfOpen } = useResponsiveMenu(active, 541)

  if (!active) return null

  if (collection.status.type === 'read-error') return (
    <section className={styles.readError} aria-label="D&D">
      <h2>D&D</h2>
      <div role="alert"><p>Erro de leitura: {collection.status.error.message}</p>
        <p>Os dados no dispositivo foram preservados. Corrija o problema e tente ler novamente.</p>
        <button type="button" onClick={collection.retryLoad}>Tentar ler novamente</button></div>
    </section>
  )

  const items = collection.snapshot?.characters.map((character) => ({
    id: character.id, name: character.name, summary: `Level ${character.level}${character.className ? ` ${character.className}` : ''}`,
  })) ?? []

  return (
    <section className={styles.workspace} aria-label="D&D">
      <h2 className={styles.visuallyHidden}>D&D</h2>
      <div className={styles.mobileHeader}>
        <button ref={openButtonRef} type="button" aria-label="Open character menu" aria-controls="dnd-character-sidebar"
          aria-expanded={open} onClick={openMenu}>☰</button>
        <img src={logo} alt="" /><span>Character sheets<br /><strong>The Player&apos;s Tavern</strong></span>
      </div>
      <aside id="dnd-character-sidebar" className={styles.sidebar} data-collapsed={collapsed}
        data-mobile-open={open}>
        <button ref={closeButtonRef} className={styles.mobileClose} type="button" aria-label="Close character menu"
          onClick={close}>×</button>
        <button className={styles.collapseButton} type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((value) => !value)}>{collapsed ? '› Expand' : '‹ Collapse'}</button>
        <div className={styles.brand}>
          <span className={styles.brandMark}>A</span>
          <span><small>Character sheets</small><strong>Adventurer&apos;s Ledger</strong></span>
        </div>
        <CharacterSidebar items={items} activeId={collection.snapshot?.activeCharacterId ?? null}
          collapsed={collapsed}
          onSelect={(id) => { collection.select(id); closeIfOpen() }}
          onCreate={() => { collection.create(); closeIfOpen() }}
          onDelete={(id) => { collection.remove(id); closeIfOpen() }}
          onRequestExpand={() => setCollapsed(false)} />
        <p className={styles.sidebarStatus}>{collection.status.type === 'write-error'
          ? 'Changes are not saved.' : 'Saved automatically on this device.'}</p>
      </aside>
      <button className={styles.backdrop} type="button" aria-label="Close character menu"
        data-mobile-open={open} onClick={close} />
      <div className={styles.mainArea}>
        {collection.status.type === 'write-error' ? (
          <div className={styles.persistenceError} role="alert">
            <p>Erro de escrita: {collection.status.error.message}</p>
            <p>As alterações continuam nesta sessão. Tente salvar novamente.</p>
            <button type="button" onClick={collection.retry}>Tentar salvar novamente</button>
          </div>
        ) : <p className={styles.visuallyHidden} role="status">Salvo</p>}
        {collection.activeCharacter ? (
          <DndSheet key={collection.activeCharacter.id} character={collection.activeCharacter}
            onChange={collection.updateActive} />
        ) : (
          <div className={styles.emptyCard}>
            <img src={logo} alt="" />
            <h3>{items.length === 0 ? 'Nenhuma ficha criada.' : 'Selecione uma ficha.'}</h3>
            <p>{items.length === 0
              ? 'Comece sua aventura criando um personagem de D&D.'
              : 'Escolha um personagem na lista para abrir a ficha.'}</p>
            <button className={styles.primaryButton} type="button" onClick={collection.create}>Criar ficha</button>
          </div>
        )}
      </div>
    </section>
  )
}
