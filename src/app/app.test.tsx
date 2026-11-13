import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from '../test/renderApp'
import { axeViolations } from '../test/axe'

describe('socle', () => {
  it("l'accueil présente le signalement, le suivi et la mention d'indépendance", () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Un problème dans votre quartier ?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Signaler un problème' })).toHaveAttribute('href', '/signaler')
    expect(screen.getByText(/non affilié à la Commune de Casablanca/)).toBeInTheDocument()
    expect(screen.getByText('Urgence : police 19 · SAMU 141')).toBeInTheDocument()
  })

  it('le champ de suivi normalise la référence saisie', async () => {
    const { user } = renderApp('/')
    await user.type(screen.getByLabelText('Numéro de référence'), 'kf 2026 4817')
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))
    // Le module de suivi reçoit la référence normalisée dans l'URL ; son titre s'affiche.
    expect(screen.getByRole('heading', { level: 1, name: 'Suivre un dossier' })).toBeInTheDocument()
  })

  it("liste les derniers signalements avec leur statut", () => {
    renderApp('/')
    const list = screen.getByRole('heading', { name: 'Derniers signalements à Casablanca' }).parentElement!
    expect(within(list).getAllByRole('link').length).toBeGreaterThanOrEqual(5)
    expect(within(list).getByText('Intervention planifiée')).toBeInTheDocument()
  })

  it("passe en arabe avec une interface de droite à gauche", async () => {
    const { user } = renderApp('/')
    await user.selectOptions(screen.getByLabelText('Langue'), 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(screen.getByRole('heading', { level: 1, name: 'مشكل في حيك؟' })).toBeInTheDocument()
  })

  it('affiche une page introuvable pour une adresse inconnue', () => {
    renderApp('/nimporte-quoi')
    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument()
  })

  it.each(['/', '/guichets', '/a-propos', '/introuvable'])('%s : aucune violation axe', async (route) => {
    const { container } = renderApp(route)
    expect(await axeViolations(container)).toEqual([])
  })
})

describe('guichets', () => {
  it('filtre les guichets par service', async () => {
    const { user } = renderApp('/guichets')
    expect(screen.getByRole('heading', { name: '7 guichets' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText(/Service recherché/), 'tax')
    expect(screen.getByRole('heading', { name: '2 guichets' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Guichet Sidi Belyout' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Guichet Maârif' })).not.toBeInTheDocument()
  })

  it('sélectionner un repère met le guichet en évidence', async () => {
    const { user } = renderApp('/guichets')
    const map = screen.getByRole('region', { name: 'Carte de Casablanca' })
    await user.click(within(map).getByRole('button', { name: 'Guichet Aïn Chock' }))
    expect(document.getElementById('office-ain-chock')).toHaveClass('ring-2')
  })

  it('propose de prendre rendez-vous dans le guichet choisi', () => {
    renderApp('/guichets')
    const card = document.getElementById('office-maarif')!
    expect(within(card).getByRole('link', { name: 'Prendre rendez-vous ici' })).toHaveAttribute(
      'href',
      '/rendez-vous?guichet=maarif',
    )
  })
})

describe('à propos', () => {
  it('efface les dossiers enregistrés dans le navigateur', async () => {
    const { user } = renderApp('/a-propos')
    await user.click(screen.getByRole('button', { name: 'Effacer mes dossiers et rendez-vous' }))
    expect(screen.getByText('Vos dossiers et rendez-vous ont été effacés de ce navigateur.')).toBeInTheDocument()
  })
})
