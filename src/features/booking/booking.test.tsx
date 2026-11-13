import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from '../../test/renderApp'
import { axeViolations } from '../../test/axe'
import { findAppointment } from '../../state/appointments'

const PREFILLED = '/rendez-vous?demarche=birth-certificate&guichet=maarif'
const next = () => screen.getByRole('button', { name: 'Continuer' })

beforeEach(() => {
  // Samedi 14 novembre 2026, 10 h 05 : seule l'horloge est figée, les minuteries restent réelles.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 14, 10, 5))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('prise de rendez-vous', () => {
  it('parcours complet pré-rempli par la démarche et le guichet', async () => {
    const { user, container } = renderApp(PREFILLED)
    expect(screen.getByText(/Étape 1 sur 5/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Démarche/)).toHaveValue('birth-certificate')
    await user.click(next())

    expect(screen.getByRole('heading', { level: 2, name: 'Dans quel guichet ?' })).toHaveFocus()
    expect(screen.getByRole('radio', { name: /Guichet Maârif/ })).toBeChecked()
    await user.click(next())

    const dates = within(screen.getByLabelText(/^Date/)).getAllByRole('option')
    expect(dates).toHaveLength(10)
    expect(dates.some((o) => /dimanche/i.test(o.textContent ?? ''))).toBe(false)
    expect(dates[0]).toHaveTextContent('samedi 14 novembre 2026')
    expect(screen.queryByRole('radio', { name: '10:00' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '10:30' }))
    await user.click(next())

    expect(screen.getByLabelText(/Nom et prénom/)).toHaveValue('Salma Bennani')
    expect(screen.getByLabelText(/Numéro de CIN/)).toHaveValue('BE899512')
    expect(screen.getByLabelText(/Téléphone mobile/)).toHaveValue('06 12 34 56 78')
    await user.click(next())

    expect(screen.getByRole('heading', { level: 2, name: 'Vérifiez votre rendez-vous' })).toHaveFocus()
    expect(screen.getByText('samedi 14 novembre 2026 à 10:30')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmer le rendez-vous' }))

    expect(screen.getByRole('heading', { level: 2, name: 'Rendez-vous confirmé' })).toHaveFocus()
    const ref = container.querySelector('p.ref')!.textContent!
    expect(ref).toMatch(/^RDV-2026-\d{6}$/)
    expect(findAppointment(ref)).toMatchObject({ officeId: 'maarif', date: '2026-11-14', slot: '10:30' })
    expect(screen.getByText(/27, rue Ibnou Mounir/)).toBeInTheDocument()
    expect(screen.getByText('Numéro et année de l’acte (figurent sur le livret de famille)')).toBeInTheDocument()
    expect(screen.getByText(/Présentez-vous 10 minutes avant/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Suivre ce rendez-vous' })).toHaveAttribute('href', `/suivi/${ref}`)
    expect(screen.getByRole('link', { name: "Retour à l'accueil" })).toHaveAttribute('href', '/')
  })

  it("le créneau réservé n'est plus proposé ensuite", async () => {
    const first = renderApp(PREFILLED)
    await first.user.click(next())
    await first.user.click(next())
    await first.user.click(screen.getByRole('radio', { name: '10:30' }))
    await first.user.click(next())
    await first.user.click(next())
    await first.user.click(screen.getByRole('button', { name: 'Confirmer le rendez-vous' }))
    first.unmount()

    const { user } = renderApp(PREFILLED)
    await user.click(next())
    await user.click(next())
    expect(screen.queryByRole('radio', { name: '10:30' })).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '11:00' })).toBeInTheDocument()
  })

  it('signale un créneau manquant et un CIN invalide', async () => {
    const { user } = renderApp(PREFILLED)
    await user.click(next())
    await user.click(next())
    await user.click(next())
    expect(screen.getByRole('alert')).toHaveTextContent('Choisissez un créneau.')
    expect(screen.getAllByText('Choisissez un créneau.')).toHaveLength(2)

    await user.click(screen.getByRole('radio', { name: '11:00' }))
    await user.click(next())
    const cin = screen.getByLabelText(/Numéro de CIN/)
    await user.clear(cin)
    await user.type(cin, '12AB')
    await user.click(next())
    expect(screen.getByRole('alert')).toHaveTextContent(/Le numéro de CIN doit comporter/)
    expect(cin).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/Étape 4 sur 5/)).toBeInTheDocument()
  })

  it('exige une démarche quand aucune n’est indiquée', async () => {
    const { user } = renderApp('/rendez-vous')
    await user.click(next())
    expect(screen.getByRole('alert')).toHaveTextContent('Choisissez une démarche.')
    await user.selectOptions(screen.getByLabelText(/^Démarche/), 'residence-certificate')
    await user.click(next())
    expect(screen.getByRole('radio', { name: /Guichet Sidi Belyout/ })).not.toBeChecked()
    await user.click(next())
    expect(screen.getByRole('alert')).toHaveTextContent('Choisissez un guichet.')
  })

  it('ne présélectionne pas un guichet qui ne traite pas la démarche', async () => {
    const { user } = renderApp('/rendez-vous?demarche=residence-certificate&guichet=ain-chock')
    await user.click(next())
    expect(screen.getByText(/Guichet Aïn Chock ne traite pas cette démarche/)).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /Guichet Aïn Chock/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true)
  })

  it("« Modifier » ramène à l'étape choisie", async () => {
    const { user } = renderApp(PREFILLED)
    await user.click(next())
    await user.click(next())
    await user.click(screen.getByRole('radio', { name: '11:00' }))
    await user.click(next())
    await user.click(next())
    await user.click(screen.getByRole('button', { name: 'Modifier — Coordonnées' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Vos coordonnées' })).toHaveFocus()
  })

  it('aucune violation axe à chaque étape et sur la confirmation', async () => {
    const { user, container } = renderApp(PREFILLED)
    expect(await axeViolations(container)).toEqual([])
    await user.click(next())
    expect(await axeViolations(container)).toEqual([])
    await user.click(next())
    await user.click(next())
    // Étape 3 avec erreurs affichées.
    expect(await axeViolations(container)).toEqual([])
    await user.click(screen.getByRole('radio', { name: '11:30' }))
    await user.click(next())
    expect(await axeViolations(container)).toEqual([])
    await user.click(next())
    expect(await axeViolations(container)).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Confirmer le rendez-vous' }))
    expect(await axeViolations(container)).toEqual([])
  })
})
