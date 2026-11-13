import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { resetAppointments } from '../state/appointments'
import { resetReports } from '../state/reports'

// Leaflet ne peut pas s'afficher dans jsdom : la carte est remplacée par un équivalent à boutons.
// La vraie carte est vérifiée dans le navigateur.
vi.mock('../map/MapView', () => import('./MapViewStub'))

// jsdom n'implémente pas le défilement.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

afterEach(() => {
  cleanup()
  resetReports()
  resetAppointments()
  localStorage.clear()
})
