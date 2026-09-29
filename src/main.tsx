import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cinzel/latin-600.css'
import '@fontsource/source-sans-3/latin-400.css'
import '@fontsource/source-sans-3/latin-600.css'
import './shared/styles/tokens.css'
import './shared/styles/base.css'
import './systems/dnd/styles/theme.css'
import './systems/ordem/styles/theme.css'
import { App } from './app/App'

const root = document.getElementById('root')
if (!root) throw new Error('Elemento raiz não encontrado.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

