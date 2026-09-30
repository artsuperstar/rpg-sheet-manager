import { AppShell } from '../shared/ui/AppShell'
import { DndWorkspace } from '../systems/dnd/DndWorkspace'
import { OrdemWorkspace } from '../systems/ordem/OrdemWorkspace'
import { SystemChooser } from './SystemChooser'
import { SystemSwitcher } from './SystemSwitcher'
import { useActiveSystem } from './useActiveSystem'
import { LanguageSelector } from '../i18n/LanguageSelector'

export function App() {
  const { activeSystem, selectSystem } = useActiveSystem()
  const mobileSwitcher = activeSystem
    ? <><SystemSwitcher placement="sidebar" activeSystem={activeSystem} onSelect={(system) => {
      selectSystem(system)
      requestAnimationFrame(() => {
        const trigger = document.querySelector<HTMLButtonElement>('[data-system-menu-trigger]')
        if (trigger?.getClientRects().length) trigger.focus()
        else document.querySelector<HTMLElement>('nav[data-placement="sidebar"]')?.focus()
      })
    }} /><LanguageSelector placement="sidebar" /></>
    : null

  return (
    <AppShell
      theme={activeSystem ?? undefined}
      headerAction={activeSystem
        ? <SystemSwitcher activeSystem={activeSystem} onSelect={selectSystem} />
        : undefined}
    >
      {activeSystem === null && <SystemChooser onSelect={selectSystem} />}
      <DndWorkspace active={activeSystem === 'dnd'} mobileSystemSwitcher={mobileSwitcher} />
      <OrdemWorkspace active={activeSystem === 'ordem'} mobileSystemSwitcher={mobileSwitcher} />
    </AppShell>
  )
}

