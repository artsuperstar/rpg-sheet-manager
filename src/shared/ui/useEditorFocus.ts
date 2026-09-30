import { useEffect, useRef, type MouseEvent } from 'react'

export function useEditorFocus() {
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      const section = actionsRef.current?.closest('section')
      if (event.key === 'Escape' && event.target instanceof Node && section?.contains(event.target)) {
        requestAnimationFrame(() => section.querySelector<HTMLButtonElement>('[data-editor-trigger]')?.focus())
      }
    }
    window.addEventListener('keydown', onEscape, true)
    return () => window.removeEventListener('keydown', onEscape, true)
  }, [])

  function finish(event: MouseEvent<HTMLButtonElement>, action: () => void) {
    const section = event.currentTarget.closest('section')
    action()
    requestAnimationFrame(() => section?.querySelector<HTMLButtonElement>('[data-editor-trigger]')?.focus())
  }

  return [actionsRef, finish] as const
}
