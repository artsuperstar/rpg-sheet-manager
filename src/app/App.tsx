import { AppShell } from '../shared/ui/AppShell'
import { DndWorkspace } from '../systems/dnd/DndWorkspace'
import { OrdemWorkspace } from '../systems/ordem/OrdemWorkspace'
import { SystemChooser } from './SystemChooser'
import { SystemSwitcher } from './SystemSwitcher'
import { useActiveSystem } from './useActiveSystem'

export function App() {
  const { activeSystem, selectSystem } = useActiveSystem()

  return (
    <AppShell
      theme={activeSystem ?? undefined}
      headerAction={activeSystem
        ? <SystemSwitcher activeSystem={activeSystem} onSelect={selectSystem} />
        : undefined}
    >
      {activeSystem === null && <SystemChooser onSelect={selectSystem} />}
      <DndWorkspace active={activeSystem === 'dnd'} />
      <OrdemWorkspace active={activeSystem === 'ordem'} />
    </AppShell>
  )
}

