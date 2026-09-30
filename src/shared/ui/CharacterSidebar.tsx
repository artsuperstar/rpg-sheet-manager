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
  collapsed: boolean
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onRequestExpand: () => void
}

// API de apresentação provisória: será reavaliada quando Ordem ganhar sua ficha real.
export function CharacterSidebar({ items, activeId, collapsed, onSelect, onCreate, onDelete, onRequestExpand }: CharacterSidebarProps) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const pendingItem = items.find(({ id }) => id === pendingDelete)

  return (
    <div className={styles.navigation} data-collapsed={collapsed}>
      <div className={styles.heading}><span>Your characters</span><span>{items.length}</span></div>
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
        <button type="button" aria-label="New character" onClick={() => { setPendingDelete(null); onCreate() }}>
          <span className={styles.fullLabel}>+ New character</span><span className={styles.compactLabel}>+</span>
        </button>
        <button type="button" aria-label="Delete selected" disabled={activeId === null} onClick={() => {
          if (collapsed) onRequestExpand()
          setPendingDelete(activeId)
        }}>
          <span className={styles.fullLabel}>Delete selected</span><span className={styles.compactLabel}>×</span>
        </button>
        {pendingItem && (
          <div className={styles.confirmation} role="group" aria-label="Confirm character deletion">
            <p>Delete {pendingItem.name || 'this character'}?</p>
            <button type="button" onClick={() => setPendingDelete(null)}>Cancel</button>
            <button type="button" onClick={() => { setPendingDelete(null); onDelete(pendingItem.id) }}>Delete character</button>
          </div>
        )}
      </div>
    </div>
  )
}
