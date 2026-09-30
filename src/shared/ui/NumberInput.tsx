import { useRef, useState } from 'react'
import styles from './NumberInput.module.css'

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number | 'any'
}

export function NumberInput({ label, value, onChange, min, max, step = 1 }: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const cancelNextBlur = useRef(false)

  function commit() {
    if (cancelNextBlur.current) {
      cancelNextBlur.current = false
      setDraft(null)
      return
    }
    if (draft === null) return
    const parsed = Number(draft)
    if (draft.trim() === '' || !Number.isFinite(parsed)) {
      setDraft(null)
      return
    }
    const bounded = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed))
    const base = min ?? 0
    const stepped = typeof step === 'number' && step > 0 && Number.isFinite(step)
      ? Number((base + Math.round((bounded - base) / step) * step).toFixed(10))
      : bounded
    const next = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, stepped))
    if (Number.isFinite(next) && (step === 'any' || !Number.isInteger(step) || Number.isSafeInteger(next)) && next !== value) onChange(next)
    setDraft(null)
  }

  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type="text"
        inputMode={min !== undefined && min >= 0 && step !== 'any' && Number.isInteger(step) ? 'numeric' : 'decimal'}
        value={draft ?? String(value)}
        onFocus={() => setDraft(String(value))}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
          if (event.key === 'Escape') {
            cancelNextBlur.current = true
            setDraft(null)
            event.currentTarget.blur()
          }
        }}
      />
    </label>
  )
}
