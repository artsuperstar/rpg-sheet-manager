import { useEffect, useRef, useState } from 'react'
import { useCharacterCollection } from '../../shared/collection/useCharacterCollection'
import { CharacterSidebar } from '../../shared/ui/CharacterSidebar'
import { createDefaultOrdemCharacter } from './defaults'
import { OrdemSheet } from './OrdemSheet'
import { ordemRepository } from './persistence'
import styles from './styles/ordem.module.css'

const sidebarLabels = {
  heading: 'Seus agentes', create: 'Novo agente', delete: 'Excluir selecionado',
  confirm: (name: string) => `Excluir ${name || 'este agente'}?`, cancel: 'Cancelar', confirmDelete: 'Excluir agente',
}

export function OrdemWorkspace({ active }: { active: boolean }) {
  const collection = useCharacterCollection(ordemRepository, createDefaultOrdemCharacter)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [wasActive, setWasActive] = useState(active)
  const openMenuButton = useRef<HTMLButtonElement>(null)
  const closeMenuButton = useRef<HTMLButtonElement>(null)

  if (wasActive !== active) {
    setWasActive(active)
    if (!active) setMobileOpen(false)
  }

  const closeMenu = () => {
    setMobileOpen(false)
    openMenuButton.current?.focus()
  }

  useEffect(() => {
    if (!active || !mobileOpen) return
    const priorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeMenuButton.current?.focus()
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu() }
    const desktop = window.matchMedia('(min-width: 651px)')
    const onResize = () => { if (desktop.matches) setMobileOpen(false) }
    window.addEventListener('keydown', close)
    desktop.addEventListener('change', onResize)
    return () => {
      window.removeEventListener('keydown', close)
      desktop.removeEventListener('change', onResize)
      document.body.style.overflow = priorOverflow
    }
  }, [active, mobileOpen])

  if (!active) return null
  if (collection.status.type === 'read-error') return <section className={styles.readError} aria-label="Ordem Paranormal">
    <h2>Ordem Paranormal</h2><div role="alert"><p>Erro de leitura: {collection.status.error.message}</p>
      <p>Os dados no dispositivo foram preservados. Corrija o problema e tente ler novamente.</p>
      <button type="button" onClick={collection.retryLoad}>Tentar ler novamente</button></div>
  </section>

  const items = collection.snapshot?.characters.map((character) => ({
    id: character.id,
    name: character.basicInfo.name,
    summary: `${character.basicInfo.nex}% NEX${character.basicInfo.className ? ` · ${character.basicInfo.className}` : ''}`,
  })) ?? []
  return <section className={styles.workspace} aria-label="Ordem Paranormal">
    <h2 className={styles.visuallyHidden}>Ordem Paranormal</h2>
    <div className={styles.mobileHeader}><button ref={openMenuButton} type="button" aria-label="Abrir menu de personagens"
      aria-controls="ordem-character-sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>☰</button>
      <strong>Arquivo de agentes</strong></div>
    <aside id="ordem-character-sidebar" className={styles.sidebar} data-mobile-open={mobileOpen}>
      <button ref={closeMenuButton} className={styles.mobileClose} type="button" aria-label="Fechar menu de personagens"
        onClick={closeMenu}>×</button>
      <div className={styles.brand}><span className={styles.brandMark}>A</span><span><small>Ordem Paranormal</small><strong>Arquivo de Agentes</strong></span></div>
      <CharacterSidebar items={items} activeId={collection.snapshot?.activeCharacterId ?? null}
        labels={sidebarLabels}
        onSelect={(id) => { collection.select(id); if (mobileOpen) closeMenu() }}
        onCreate={() => { collection.create(); if (mobileOpen) closeMenu() }}
        onDelete={(id) => { collection.remove(id); if (mobileOpen) closeMenu() }} />
      <p className={styles.sidebarStatus}>{collection.status.type === 'saved' ? 'Salvo automaticamente neste dispositivo.' : 'Alterações não salvas.'}</p>
    </aside>
    <button className={styles.backdrop} type="button" aria-label="Fechar menu de personagens"
      data-mobile-open={mobileOpen} onClick={closeMenu} />
    <div className={styles.mainArea}>
      {collection.status.type === 'write-error' ? <div className={styles.persistenceError} role="alert">
        <p>Erro de escrita: {collection.status.error.message}</p>
        <p>As alterações continuam nesta sessão. Tente salvar novamente.</p>
        <button type="button" onClick={collection.retry}>Tentar salvar novamente</button>
      </div> : <p className={styles.visuallyHidden} role="status">Salvo</p>}
      {collection.activeCharacter ? <OrdemSheet key={collection.activeCharacter.id} character={collection.activeCharacter}
        onChange={collection.updateActive} /> : <div className={styles.emptyState}>
        <small>Arquivo vazio</small><h3>Nenhuma ficha criada.</h3>
        <p>Crie um agente para começar o seu dossiê de Ordem Paranormal.</p>
        <button className={styles.primary} type="button" onClick={collection.create}>Criar ficha</button>
      </div>}
    </div>
  </section>
}
