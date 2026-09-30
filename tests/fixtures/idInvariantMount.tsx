import { createRoot } from 'react-dom/client'
import { IdInvariantHarness } from './idInvariantHarness'

export function mountIdInvariantHarness() {
  const host = document.createElement('div')
  document.body.append(host)
  createRoot(host).render(<IdInvariantHarness />)
}
