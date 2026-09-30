import { useEffect, useRef } from 'react'
import styles from '../styles/ordem.module.css'

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className={styles.editButton} type="button" aria-label={label}
    data-editor-trigger onClick={onClick}>Editar</button>
}

export function EditorActions({ onCancel, onSave, canSave }: {
  onCancel: () => void; onSave: () => void; canSave: boolean
}) {
  const actions = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      const section = actions.current?.closest('section')
      if (event.key === 'Escape' && event.target instanceof Node && section?.contains(event.target)) {
        requestAnimationFrame(() => section.querySelector<HTMLButtonElement>('[data-editor-trigger]')?.focus())
      }
    }
    window.addEventListener('keydown', onEscape, true)
    return () => window.removeEventListener('keydown', onEscape, true)
  }, [])

  function finish(event: React.MouseEvent<HTMLButtonElement>, action: () => void) {
    const section = event.currentTarget.closest('section')
    action()
    requestAnimationFrame(() => section?.querySelector<HTMLButtonElement>('[data-editor-trigger]')?.focus())
  }
  return <div ref={actions} className={styles.editorActions}>
    <button type="button" onClick={(event) => finish(event, onCancel)}>Cancelar</button>
    <button className={styles.primary} type="button" disabled={!canSave}
      onClick={(event) => finish(event, onSave)}>Salvar</button>
  </div>
}
