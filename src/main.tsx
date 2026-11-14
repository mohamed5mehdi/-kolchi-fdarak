import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-sans/latin-700.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css'
import '@fontsource/ibm-plex-sans-arabic/latin-400.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css'
import '@fontsource/ibm-plex-sans-arabic/latin-500.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css'
import '@fontsource/ibm-plex-sans-arabic/latin-600.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css'
import '@fontsource/ibm-plex-sans-arabic/latin-700.css'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './app/App'
import { ErrorBoundary } from './app/ErrorBoundary'
import { I18nProvider, loadLang, storedLang } from './i18n/I18nProvider'

// Après un nouveau déploiement, un onglet resté ouvert peut réclamer un morceau qui n'existe plus : on recharge,
// une seule fois par session pour ne pas boucler si le morceau manque durablement.
window.addEventListener('vite:preloadError', () => {
  try {
    if (sessionStorage.getItem('kolchi-fdarak:reloaded')) return
    sessionStorage.setItem('kolchi-fdarak:reloaded', '1')
  } catch {
    return
  }
  window.location.reload()
})

// La langue enregistrée est chargée avant le premier rendu : pas de passage visible du français à l'arabe.
loadLang(storedLang())
  .catch(() => {})
  .finally(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <I18nProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ErrorBoundary>
        </I18nProvider>
      </StrictMode>,
    ),
  )
