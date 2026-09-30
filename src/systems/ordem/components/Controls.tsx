import styles from '../styles/ordem.module.css'

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className={styles.editButton} type="button" aria-label={label} onClick={onClick}>Editar</button>
}

export function EditorActions({ onCancel, onSave, canSave }: {
  onCancel: () => void; onSave: () => void; canSave: boolean
}) {
  return <div className={styles.editorActions}>
    <button type="button" onClick={onCancel}>Cancelar</button>
    <button className={styles.primary} type="button" disabled={!canSave} onClick={onSave}>Salvar</button>
  </div>
}
