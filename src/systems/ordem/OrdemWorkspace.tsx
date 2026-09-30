import type { ReactNode } from 'react'
import { useCharacterCollection } from '../../shared/collection/useCharacterCollection'
import { CharacterSidebar } from '../../shared/ui/CharacterSidebar'
import { useResponsiveMenu } from '../../shared/ui/useResponsiveMenu'
import { createDefaultOrdemCharacter } from './defaults'
import { OrdemSheet } from './OrdemSheet'
import { ordemRepository } from './persistence'
import styles from './styles/ordem.module.css'
import sigil from './assets/ordem-sigil.png'
import { useI18n } from '../../i18n/useI18n'

export function OrdemWorkspace({ active, mobileSystemSwitcher }: { active: boolean; mobileSystemSwitcher: ReactNode }) {
  const { ordem: t, global: g } = useI18n()
  const collection = useCharacterCollection(ordemRepository, () => {
    const character = createDefaultOrdemCharacter()
    return { ...character, basicInfo: { ...character.basicInfo, name: t('Novo agente') } }
  })
  const { open, openButtonRef, closeButtonRef, openMenu, close, closeIfOpen } = useResponsiveMenu(active, 651)

  if (!active) return null
  if (collection.status.type === 'read-error') return <section className={styles.readError} aria-label="Ordem Paranormal">
    <h2>Ordem Paranormal</h2><div role="alert"><p>{g('Erro de leitura:')} {collection.status.error.message}</p>
      <p>{g('Os dados no dispositivo foram preservados. Corrija o problema e tente ler novamente.')}</p>
      <button type="button" onClick={collection.retryLoad}>{g('Tentar ler novamente')}</button></div>
    <div className={styles.mobileSystemSwitcher}>{mobileSystemSwitcher}</div>
  </section>

  const items = collection.snapshot?.characters.map((character) => ({
    id: character.id,
    name: character.basicInfo.name,
    summary: `${character.basicInfo.nex}% NEX${character.basicInfo.className ? ` · ${character.basicInfo.className}` : ''}`,
  })) ?? []
  return <section className={styles.workspace} aria-label="Ordem Paranormal">
    <h2 className={styles.visuallyHidden}>Ordem Paranormal</h2>
    <div className={styles.mobileHeader}><button ref={openButtonRef} data-system-menu-trigger type="button" aria-label={g('Abrir menu de personagens')}
      aria-controls="ordem-character-sidebar" aria-expanded={open} onClick={openMenu}>☰</button>
      <strong>{t('Arquivo de agentes')}</strong></div>
    <aside id="ordem-character-sidebar" className={styles.sidebar} data-mobile-open={open}>
      <button ref={closeButtonRef} className={styles.mobileClose} type="button" aria-label={g('Fechar menu de personagens')}
        onClick={close}>×</button>
      <div className={styles.brand}><img className={styles.brandMark} src={sigil} alt="" /><span><small>Ordem Paranormal</small><strong>{t('Arquivo de Agentes')}</strong></span></div>
      <div className={styles.mobileSystemSwitcher}>{mobileSystemSwitcher}</div>
      <CharacterSidebar items={items} activeId={collection.snapshot?.activeCharacterId ?? null}
        labels={{ heading: t('Seus agentes'), create: t('Novo agente'), delete: t('Excluir selecionado'),
          confirm: (name) => `${t('Excluir')} ${name || t('este agente')}?`, cancel: g('Cancelar'),
          confirmDelete: t('Excluir agente'), unnamed: t('Agente sem nome') }}
        onSelect={(id) => { collection.select(id); closeIfOpen() }}
        onCreate={() => { collection.create(); closeIfOpen() }}
        onDelete={(id) => { collection.remove(id); closeIfOpen() }} />
      <p className={styles.sidebarStatus}>{collection.status.type === 'saved' ? g('Salvo automaticamente neste dispositivo.') : g('Alterações não salvas.')}</p>
    </aside>
    <button className={styles.backdrop} type="button" aria-label={g('Fechar menu de personagens')}
      data-mobile-open={open} onClick={close} />
    <div className={styles.mainArea}>
      {collection.status.type === 'write-error' ? <div className={styles.persistenceError} role="alert">
        <p>{g('Erro de escrita:')} {collection.status.error.message}</p>
        <p>{g('As alterações continuam nesta sessão. Tente salvar novamente.')}</p>
        <button type="button" onClick={collection.retry}>{g('Tentar salvar novamente')}</button>
      </div> : <p className={styles.visuallyHidden} role="status">{g('Salvo')}</p>}
      {collection.activeCharacter ? <OrdemSheet key={collection.activeCharacter.id} character={collection.activeCharacter}
        onChange={collection.updateActive} /> : <div className={styles.emptyState}>
        <small>{t('Arquivo vazio')}</small><h3>{g('Nenhuma ficha criada.')}</h3>
        <p>{t('Crie um agente para começar o seu dossiê de Ordem Paranormal.')}</p>
        <button className={styles.primary} type="button" onClick={collection.create}>{g('Criar ficha')}</button>
      </div>}
    </div>
  </section>
}
