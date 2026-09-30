import { useEditorFocus } from '../../../shared/ui/useEditorFocus'
import styles from '../styles/dnd.module.css'
import { useI18n } from '../../../i18n/useI18n'

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className={styles.editButton} type="button" aria-label={label} title={label}
    data-editor-trigger onClick={onClick}>✎</button>
}

export function EditorActions({ onCancel, onSave, canSave }: {
  onCancel: () => void
  onSave: () => void
  canSave: boolean
}) {
  const { dnd: t } = useI18n()
  const [actionsRef, finish] = useEditorFocus()
  return (
    <div ref={actionsRef} className={styles.editorActions}>
      <button className={styles.button} type="button" onClick={(event) => finish(event, onCancel)}>{t('Cancel')}</button>
      <button className={styles.primaryButton} type="button" disabled={!canSave}
        onClick={(event) => finish(event, onSave)}>{t('Save')}</button>
    </div>
  )
}
