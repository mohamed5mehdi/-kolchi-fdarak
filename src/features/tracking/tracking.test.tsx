import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from '../../test/renderApp'
import { axeViolations } from '../../test/axe'
import { bookAppointment } from '../../state/appointments'
import { submitReport } from '../../state/reports'
import { maskCin, shortName, upcomingSteps } from './format'

function addMyReport() {
  return submitReport({
    category: 'lighting',
    district: 'anfa',
    street: 'Boulevard d’Anfa, face au n° 12',
    position: [33.5905, -7.6355],
    description: 'Deux lampadaires éteints depuis lundi.',
    contact: { fullName: 'Salma Bennani', cin: 'be 899512', phone: '0612345678' },
  })
}

describe('suivi', () => {
  it('affiche le statut et l’historique de KF-2026-004817', () => {
    renderApp('/suivi/KF-2026-004817')
    expect(screen.getByRole('heading', { level: 1, name: 'Suivre un dossier' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Signalement KF-2026-004817' })).toBeInTheDocument()
    expect(screen.getAllByText('Intervention planifiée').length).toBeGreaterThan(0)

    const history = screen.getByRole('heading', { name: 'Historique' }).parentElement!
    const items = within(history).getAllByRole('listitem')
    expect(items.map((li) => li.querySelector('p')?.textContent)).toEqual([
      'Reçu',
      'Pris en charge',
      'Intervention planifiée',
      'Résolu',
    ])
    expect(items[1]).toHaveTextContent('Service de la voirie')
    expect(items[3]).toHaveTextContent('À venir')
    expect(screen.getByRole('region', { name: 'Carte : emplacement signalé' })).toBeInTheDocument()
    // Dossier public : pas de mention de déposant.
    expect(screen.queryByText(/Déposé depuis cet appareil/)).not.toBeInTheDocument()
  })

  it('normalise une référence saisie à la main', async () => {
    const { user } = renderApp('/suivi')
    await user.type(screen.getByLabelText('Référence du dossier'), 'kf 2026 4817')
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Signalement KF-2026-004817' })).toBeInTheDocument()
    expect(screen.getByLabelText('Référence du dossier')).toHaveValue('KF-2026-004817')
  })

  it('signale une saisie qui n’est pas une référence', async () => {
    const { user } = renderApp('/suivi')
    await user.type(screen.getByLabelText('Référence du dossier'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))
    expect(screen.getByLabelText('Référence du dossier')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/ne correspond pas à une référence/)).toBeInTheDocument()
  })

  it('explique quand la référence est introuvable', () => {
    renderApp('/suivi/KF-2026-999999')
    expect(screen.getByRole('heading', { level: 1, name: 'Suivre un dossier' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Aucun dossier ne correspond à KF-2026-999999' })).toBeInTheDocument()
    expect(screen.getByText(/une référence de signalement a la forme KF-2026-004817/)).toBeInTheDocument()
    expect(screen.getByLabelText('Référence du dossier')).toBeInTheDocument()
  })

  it('affiche un état vide « Sur cet appareil »', () => {
    renderApp('/suivi')
    expect(screen.getByRole('heading', { level: 2, name: 'Sur cet appareil' })).toBeInTheDocument()
    expect(screen.getByText(/Aucun dossier enregistré sur cet appareil/)).toBeInTheDocument()
  })

  it('liste les dossiers et rendez-vous de cet appareil', () => {
    const report = addMyReport()
    const rdv = bookAppointment({
      officeId: 'maarif',
      procedureId: 'birth-certificate',
      date: '2026-11-20',
      slot: '09:30',
      contact: { fullName: 'Salma Bennani', cin: 'BE899512', phone: '0612345678' },
    })
    renderApp('/suivi')
    expect(screen.getByRole('link', { name: new RegExp(report.ref) })).toHaveAttribute('href', `/suivi/${report.ref}`)
    expect(screen.getByRole('link', { name: new RegExp(rdv.ref) })).toHaveAttribute('href', `/suivi/${rdv.ref}`)
  })

  it('masque la CIN du déposant', () => {
    const report = addMyReport()
    renderApp(`/suivi/${report.ref}`)
    expect(screen.getByText('Déposé depuis cet appareil par S. Bennani · CIN BE****12')).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('BE899512')
  })

  it('affiche un rendez-vous', () => {
    const rdv = bookAppointment({
      officeId: 'maarif',
      procedureId: 'birth-certificate',
      date: '2026-11-20',
      slot: '09:30',
      contact: { fullName: 'Salma Bennani', cin: 'BE899512', phone: '0612345678' },
    })
    renderApp(`/suivi/${rdv.ref}`)
    expect(screen.getByRole('heading', { level: 2, name: `Rendez-vous ${rdv.ref}` })).toBeInTheDocument()
    expect(screen.getByText('Démarche')).toBeInTheDocument()
    expect(screen.getByText('Copie intégrale d’acte de naissance', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Guichet Maârif')).toBeInTheDocument()
    expect(screen.getByText('27, rue Ibnou Mounir, Maârif')).toBeInTheDocument()
    expect(screen.getByText(/vendredi 20 novembre 2026/)).toBeInTheDocument()
    expect(screen.getByText('09:30')).toBeInTheDocument()
  })

  it.each(['/suivi', '/suivi/KF-2026-004817', '/suivi/KF-2026-999999'])('%s : aucune violation axe', async (route) => {
    const { container } = renderApp(route)
    expect(await axeViolations(container)).toEqual([])
  })

  it('aucune violation axe avec des dossiers sur l’appareil', async () => {
    addMyReport()
    const { container } = renderApp('/suivi')
    expect(await axeViolations(container)).toEqual([])
  })
})

describe('format', () => {
  it('masque la CIN et abrège le prénom', () => {
    expect(maskCin('BE899512')).toBe('BE****12')
    expect(maskCin('A1234')).toBe('A1*34')
    expect(shortName('Salma Bennani')).toBe('S. Bennani')
    expect(shortName('Salma')).toBe('Salma')
  })

  it('calcule les étapes à venir', () => {
    expect(upcomingSteps([{ status: 'received', at: '' }])).toEqual(['assigned', 'scheduled', 'resolved'])
    expect(
      upcomingSteps([
        { status: 'received', at: '' },
        { status: 'resolved', at: '' },
      ]),
    ).toEqual([])
    expect(upcomingSteps([{ status: 'closed', at: '' }])).toEqual([])
  })
})
