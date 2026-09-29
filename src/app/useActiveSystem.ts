import { useCallback, useEffect, useState } from 'react'
import { isRpgSystemId, type RpgSystemId } from './systemRegistry'

function readActiveSystem(): RpgSystemId | null {
  const value = new URL(window.location.href).searchParams.get('system')
  return value !== null && isRpgSystemId(value) ? value : null
}

function removeInvalidSystemParameter(): void {
  const url = new URL(window.location.href)
  const value = url.searchParams.get('system')
  if (value === null || isRpgSystemId(value)) return

  url.searchParams.delete('system')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

export function useActiveSystem() {
  const [activeSystem, setActiveSystem] = useState<RpgSystemId | null>(readActiveSystem)

  useEffect(() => {
    removeInvalidSystemParameter()

    function onPopState() {
      removeInvalidSystemParameter()
      setActiveSystem(readActiveSystem())
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const selectSystem = useCallback((system: RpgSystemId) => {
    if (readActiveSystem() === system) return

    const url = new URL(window.location.href)
    url.searchParams.set('system', system)
    url.hash = ''
    window.history.pushState(window.history.state, '', `${url.pathname}${url.search}`)
    setActiveSystem(system)
  }, [])

  return { activeSystem, selectSystem }
}

