import styles from '../../shared/styles/shell.module.css'

interface OrdemWorkspaceProps {
  active: boolean
}

export function OrdemWorkspace({ active }: OrdemWorkspaceProps) {
  if (!active) return null

  return (
    <section className={styles.workspace} aria-labelledby="ordem-workspace-heading">
      <p className={styles.kicker}>Área do sistema</p>
      <h2 id="ordem-workspace-heading">Ordem Paranormal</h2>
      <p>A fundação está pronta. As fichas de Ordem Paranormal serão adicionadas em uma próxima etapa.</p>
    </section>
  )
}
