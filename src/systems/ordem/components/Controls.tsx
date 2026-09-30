import { useEditorFocus } from '../../../shared/ui/useEditorFocus'
import styles from '../styles/ordem.module.css'
import { useI18n } from '../../../i18n/useI18n'

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  const { ordem: t } = useI18n()
  return <button className={styles.editButton} type="button" aria-label={label}
    data-editor-trigger onClick={onClick}>{t('Editar')}</button>
}

export function EditorActions({ onCancel, onSave, canSave }: {
  onCancel: () => void; onSave: () => void; canSave: boolean
}) {
  const { ordem: t } = useI18n()
  const [actionsRef, finish] = useEditorFocus()
  return <div ref={actionsRef} className={styles.editorActions}>
    <button type="button" onClick={(event) => finish(event, onCancel)}>{t('Cancelar')}</button>
    <button className={styles.primary} type="button" disabled={!canSave}
      onClick={(event) => finish(event, onSave)}>{t('Salvar')}</button>
  </div>
}
