import { useEditorFocus } from '../../../shared/ui/useEditorFocus'
import styles from '../styles/ordem.module.css'

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className={styles.editButton} type="button" aria-label={label}
    data-editor-trigger onClick={onClick}>Editar</button>
}

export function EditorActions({ onCancel, onSave, canSave }: {
  onCancel: () => void; onSave: () => void; canSave: boolean
}) {
  const [actionsRef, finish] = useEditorFocus()
  return <div ref={actionsRef} className={styles.editorActions}>
    <button type="button" onClick={(event) => finish(event, onCancel)}>Cancelar</button>
    <button className={styles.primary} type="button" disabled={!canSave}
      onClick={(event) => finish(event, onSave)}>Salvar</button>
  </div>
}
