import { AppShell } from '../shared/ui/AppShell'
import { DndWorkspace } from '../systems/dnd/DndWorkspace'
import { OrdemWorkspace } from '../systems/ordem/OrdemWorkspace'
import { SystemChooser } from './SystemChooser'
import { SystemSwitcher } from './SystemSwitcher'
import { useActiveSystem } from './useActiveSystem'
import { LanguageSelector } from '../i18n/LanguageSelector'

export function App() {
  const { activeSystem, selectSystem } = useActiveSystem()
  const systemNavigation = activeSystem
    ? <><SystemSwitcher placement="sidebar" activeSystem={activeSystem} onSelect={(system) => {
      selectSystem(system)
      requestAnimationFrame(() => {
        const trigger = document.querySelector<HTMLButtonElement>('[data-system-menu-trigger]')
        if (trigger?.getClientRects().length) trigger.focus()
        else {
          const navigation = document.querySelector<HTMLElement>('nav[data-placement="sidebar"]')
          if (navigation?.getClientRects().length) navigation.focus()
          else document.querySelector<HTMLButtonElement>('[data-sidebar-collapse]')?.focus()
        }
      })
    }} /><LanguageSelector placement="sidebar" /></>
    : null

  return (
    <AppShell theme={activeSystem ?? undefined} showHeader={activeSystem === null}>
      {activeSystem === null && <SystemChooser onSelect={selectSystem} />}
      <DndWorkspace active={activeSystem === 'dnd'} systemNavigation={systemNavigation} />
      <OrdemWorkspace active={activeSystem === 'ordem'} systemNavigation={systemNavigation} />
    </AppShell>
  )
}

