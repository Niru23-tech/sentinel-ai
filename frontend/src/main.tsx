import React from 'react'
import ReactDOM from 'react-dom/client'
import './utils/apiMock.ts' // Local standalone mock fallback if backend is offline
import App from './App.tsx'
import { SentinelProvider } from './context/SentinelContext.tsx'
import ErrorBoundary from './components/ui/ErrorBoundary.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SentinelProvider>
        <App />
      </SentinelProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
