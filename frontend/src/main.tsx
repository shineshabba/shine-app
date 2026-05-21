import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { init } from '@telegram-apps/sdk-react'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import App from './App.tsx'

try {
  init()
} catch {
  // Outside Telegram (dev mode) — continue without SDK init
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
