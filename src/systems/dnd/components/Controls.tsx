import styles from '../styles/dnd.module.css'

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className={styles.editButton} type="button" aria-label={label} title={label} onClick={onClick}>✎</button>
}

export function EditorActions({ onCancel, onSave, canSave }: {
  onCancel: () => void
  onSave: () => void
  canSave: boolean
}) {
  return (
    <div className={styles.editorActions}>
      <button className={styles.button} type="button" onClick={onCancel}>Cancel</button>
      <button className={styles.primaryButton} type="button" disabled={!canSave} onClick={onSave}>Save</button>
    </div>
  )
}
