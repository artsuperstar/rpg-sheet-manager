import { useEffect, useRef, useState } from 'react'

export function useResponsiveMenu(active: boolean, desktopMinWidth: number) {
  const [open, setOpen] = useState(false)
  const [wasActive, setWasActive] = useState(active)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // O Workspace continua montado ao alternar sistemas; o menu não deve continuar aberto.
  if (wasActive !== active) {
    setWasActive(active)
    if (!active) setOpen(false)
  }

  function close() {
    setOpen(false)
    openButtonRef.current?.focus()
  }

  function closeIfOpen() {
    if (open) close()
  }

  useEffect(() => {
    if (!active || !open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    const desktop = window.matchMedia(`(min-width: ${desktopMinWidth}px)`)
    const onResize = () => { if (desktop.matches) setOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onResize)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onResize)
      document.body.style.overflow = previousOverflow
    }
  }, [active, desktopMinWidth, open])

  return { open, openButtonRef, closeButtonRef, openMenu: () => setOpen(true), close, closeIfOpen }
}
