import { useEffect, useRef, useState } from 'react'
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
  labels: {
    heading: string
    create: string
    delete: string
    confirm: (name: string) => string
    cancel: string
    confirmDelete: string
    unnamed: string
  }
}

// Navegação recebe somente dados de apresentação; cada workspace controla o próprio layout.
export function CharacterSidebar({ items, activeId, collapsed = false, onSelect, onCreate, onDelete, onRequestExpand, labels }: CharacterSidebarProps) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const pendingItem = items.find(({ id }) => id === pendingDelete)
  const confirmationText = pendingItem ? labels.confirm(pendingItem.name) : null
  const deleteButton = useRef<HTMLButtonElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (pendingDelete !== null) cancelButton.current?.focus()
  }, [pendingDelete])

  const cancelDelete = () => {
    setPendingDelete(null)
    deleteButton.current?.focus()
  }

  return (
    <div className={styles.navigation} data-collapsed={collapsed}>
      <div className={styles.heading}><span>{labels.heading}</span><span>{items.length}</span></div>
      <nav className={styles.list} aria-label={labels.heading}>
        {items.map(({ id, name, summary }) => (
          <button className={styles.option} data-active={id === activeId} type="button" key={id}
            aria-label={`${name || labels.unnamed}, ${summary}`}
            aria-current={id === activeId ? 'page' : undefined}
            onClick={() => { setPendingDelete(null); onSelect(id) }}>
            <span className={styles.initial} aria-hidden="true">{(name || '?').charAt(0).toUpperCase()}</span>
            <span className={styles.summary}><strong>{name || labels.unnamed}</strong><small>{summary}</small></span>
          </button>
        ))}
      </nav>
      <div className={styles.actions}>
        <button type="button" aria-label={labels.create} onClick={() => { setPendingDelete(null); onCreate() }}>
          <span className={styles.fullLabel}>+ {labels.create}</span><span className={styles.compactLabel}>+</span>
        </button>
        <button ref={deleteButton} type="button" aria-label={labels.delete} disabled={activeId === null} onClick={() => {
          if (collapsed) onRequestExpand?.()
          setPendingDelete(activeId)
        }}>
          <span className={styles.fullLabel}>{labels.delete}</span><span className={styles.compactLabel}>×</span>
        </button>
        {pendingItem && (
          <div className={styles.confirmation} role="group" aria-label={confirmationText ?? undefined}
            onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); cancelDelete() } }}>
            <p>{confirmationText}</p>
            <button ref={cancelButton} type="button" onClick={cancelDelete}>{labels.cancel}</button>
            <button type="button" onClick={() => { setPendingDelete(null); onDelete(pendingItem.id) }}>{labels.confirmDelete}</button>
          </div>
        )}
      </div>
    </div>
  )
}
