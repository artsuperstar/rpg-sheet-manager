import { useState } from 'react'
import styles from './CharacterSidebar.module.css'

export interface CharacterNavItem {
  id: string
  name: string
  summary: string
}

interface CharacterSidebarProps {
  items: CharacterNavItem[]
  activeId: string | null
  collapsed?: boolean
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onRequestExpand?: () => void
  labels?: {
    heading: string
    create: string
    delete: string
    confirm: (name: string) => string
    cancel: string
    confirmDelete: string
  }
}

// Navegação recebe somente dados de apresentação; cada workspace controla o próprio layout.
const defaultLabels = {
  heading: 'Your characters', create: 'New character', delete: 'Delete selected',
  confirm: (name: string) => `Delete ${name || 'this character'}?`, cancel: 'Cancel', confirmDelete: 'Delete character',
}

export function CharacterSidebar({ items, activeId, collapsed = false, onSelect, onCreate, onDelete, onRequestExpand, labels = defaultLabels }: CharacterSidebarProps) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const pendingItem = items.find(({ id }) => id === pendingDelete)

  return (
    <div className={styles.navigation} data-collapsed={collapsed}>
      <div className={styles.heading}><span>{labels.heading}</span><span>{items.length}</span></div>
      <nav className={styles.list} aria-label="Characters">
        {items.map(({ id, name, summary }) => (
          <button className={styles.option} data-active={id === activeId} type="button" key={id}
            aria-label={`${name || 'Unnamed character'}, ${summary}`}
            aria-current={id === activeId ? 'page' : undefined}
            onClick={() => { setPendingDelete(null); onSelect(id) }}>
            <span className={styles.initial} aria-hidden="true">{(name || '?').charAt(0).toUpperCase()}</span>
            <span className={styles.summary}><strong>{name || 'Unnamed character'}</strong><small>{summary}</small></span>
          </button>
        ))}
      </nav>
      <div className={styles.actions}>
        <button type="button" aria-label={labels.create} onClick={() => { setPendingDelete(null); onCreate() }}>
          <span className={styles.fullLabel}>+ {labels.create}</span><span className={styles.compactLabel}>+</span>
        </button>
        <button type="button" aria-label={labels.delete} disabled={activeId === null} onClick={() => {
          if (collapsed) onRequestExpand?.()
          setPendingDelete(activeId)
        }}>
          <span className={styles.fullLabel}>{labels.delete}</span><span className={styles.compactLabel}>×</span>
        </button>
        {pendingItem && (
          <div className={styles.confirmation} role="group" aria-label="Confirm character deletion">
            <p>{labels.confirm(pendingItem.name)}</p>
            <button type="button" onClick={() => setPendingDelete(null)}>{labels.cancel}</button>
            <button type="button" onClick={() => { setPendingDelete(null); onDelete(pendingItem.id) }}>{labels.confirmDelete}</button>
          </div>
        )}
      </div>
    </div>
  )
}
