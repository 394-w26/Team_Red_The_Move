import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { SavedMovesProvider } from './contexts/SavedMovesContext'
import { LocationProvider } from './contexts/LocationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LocationProvider>
        <SavedMovesProvider>
          <App />
        </SavedMovesProvider>
      </LocationProvider>
    </AuthProvider>
  </StrictMode>,
)
