import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!active || !mobileOpen) return
    const priorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', close)
    return () => { window.removeEventListener('keydown', close); document.body.style.overflow = priorOverflow }
  }, [active, mobileOpen])

  if (!active) return null
  if (collection.status.type === 'read-error') return <section className={styles.readError} aria-label="Ordem Paranormal">
    <h2>Ordem Paranormal</h2><div role="alert"><p>Erro de leitura: {collection.status.error.message}</p>
      <button type="button" onClick={collection.retryLoad}>Tentar ler novamente</button></div>
  </section>

  const items = collection.snapshot?.characters.map((character) => ({
    id: character.id,
    name: character.basicInfo.name,
    summary: `${character.basicInfo.nex}% NEX${character.basicInfo.className ? ` · ${character.basicInfo.className}` : ''}`,
  })) ?? []
  return <section className={styles.workspace} aria-label="Ordem Paranormal">
    <h2 className={styles.visuallyHidden}>Ordem Paranormal</h2>
    <div className={styles.mobileHeader}><button type="button" aria-label="Abrir menu de personagens"
      aria-controls="ordem-character-sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>☰</button>
      <strong>Arquivo de agentes</strong></div>
    <aside id="ordem-character-sidebar" className={styles.sidebar} data-mobile-open={mobileOpen}>
      <button className={styles.mobileClose} type="button" aria-label="Fechar menu de personagens"
        onClick={() => setMobileOpen(false)}>×</button>
      <div className={styles.brand}><span className={styles.brandMark}>A</span><span><small>Ordem Paranormal</small><strong>Arquivo de Agentes</strong></span></div>
      <CharacterSidebar items={items} activeId={collection.snapshot?.activeCharacterId ?? null}
        labels={sidebarLabels}
        onSelect={(id) => { collection.select(id); setMobileOpen(false) }}
        onCreate={() => { collection.create(); setMobileOpen(false) }}
        onDelete={(id) => { collection.remove(id); setMobileOpen(false) }} />
      <p className={styles.sidebarStatus}>{collection.status.type === 'saved' ? 'Salvo automaticamente neste dispositivo.' : 'Alterações não salvas.'}</p>
    </aside>
    <button className={styles.backdrop} type="button" aria-label="Fechar menu de personagens"
      data-mobile-open={mobileOpen} onClick={() => setMobileOpen(false)} />
    <div className={styles.mainArea}>
      {collection.status.type === 'write-error' ? <div className={styles.persistenceError} role="alert">
        <p>Erro de escrita: {collection.status.error.message}</p>
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
