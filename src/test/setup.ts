import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { resetAppointments } from '../state/appointments'
import { resetReports } from '../state/reports'
import { loadLang } from '../i18n/I18nProvider'

// Les langues sont chargées à la demande dans l'app ; en test, on les précharge pour garder des rendus synchrones.
await Promise.all((['ar', 'darija', 'en'] as const).map((lang) => loadLang(lang)))

// Leaflet ne peut pas s'afficher dans jsdom : la carte est remplacée par un équivalent à boutons.
// La vraie carte est vérifiée dans le navigateur.
vi.mock('../map/MapView', () => import('./MapViewStub'))
vi.mock('../map/LazyMapView', () => import('./MapViewStub'))

// jsdom n'implémente pas le défilement.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

afterEach(() => {
  cleanup()
  resetReports()
  resetAppointments()
  localStorage.clear()
})
