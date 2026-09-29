import styles from '../../shared/styles/shell.module.css'

interface DndWorkspaceProps {
  active: boolean
}

export function DndWorkspace({ active }: DndWorkspaceProps) {
  if (!active) return null

  return (
    <section className={styles.workspace} aria-labelledby="dnd-workspace-heading">
      <p className={styles.kicker}>Área do sistema</p>
      <h2 id="dnd-workspace-heading">D&D</h2>
      <p>A fundação está pronta. As fichas de D&D serão adicionadas em uma próxima etapa.</p>
    </section>
  )
}

