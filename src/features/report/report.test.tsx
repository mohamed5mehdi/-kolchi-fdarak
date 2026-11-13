import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { renderApp } from '../../test/renderApp'
import { axeViolations } from '../../test/axe'

const DESCRIPTION = 'Nid-de-poule profond sur la voie de droite, dangereux pour les deux-roues.'

async function next(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
}

async function toLocation(user: UserEvent) {
  await user.click(screen.getByRole('radio', { name: /Voirie et trottoirs/ }))
  await next(user)
}

async function toDetails(user: UserEvent) {
  await toLocation(user)
  await user.click(screen.getByRole('button', { name: 'Placer le repère au centre de la carte' }))
  await user.type(screen.getByLabelText('Rue ou repère'), 'Rue Ibnou Mounir, devant le n° 40')
  await next(user)
}

async function toReview(user: UserEvent) {
  await toDetails(user)
  await user.type(screen.getByLabelText('Description'), DESCRIPTION)
  await next(user)
}

function errorSummary() {
  return screen.getByRole('alert')
}

describe('signalement', () => {
  it('parcours complet jusqu’à la référence, retrouvée dans le suivi', async () => {
    const { user } = renderApp('/signaler')
    expect(screen.getByText('Étape 1 sur 4')).toBeInTheDocument()

    await toLocation(user)
    expect(screen.getByRole('heading', { level: 2, name: 'Où se trouve le problème ?' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Placer le repère au centre de la carte' }))
    // Le clic sur la carte pré-sélectionne l'arrondissement le plus proche.
    expect(screen.getByLabelText(/Arrondissement/)).toHaveValue('maarif')
    expect(screen.getByText('Repère placé, arrondissement Maârif.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Rue ou repère'), 'Rue Ibnou Mounir, devant le n° 40')
    await next(user)

    expect(screen.getByLabelText('Nom et prénom')).toHaveValue('Salma Bennani')
    expect(screen.getByLabelText('Numéro de CIN')).toHaveValue('BE899512')
    expect(screen.getByLabelText('Téléphone mobile')).toHaveValue('06 12 34 56 78')
    await user.type(screen.getByLabelText('Description'), DESCRIPTION)
    expect(screen.getByText(`${DESCRIPTION.length} caractères sur 500`)).toBeInTheDocument()
    await next(user)

    expect(screen.getByRole('heading', { level: 2, name: 'Vérifiez votre signalement' })).toHaveFocus()
    expect(screen.getByText('Voirie et trottoirs')).toBeInTheDocument()
    expect(screen.getByText('Rue Ibnou Mounir, devant le n° 40')).toBeInTheDocument()
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Envoyer le signalement' }))

    expect(screen.getByRole('heading', { level: 2, name: 'Signalement enregistré' })).toHaveFocus()
    const ref = screen.getByText(/^KF-\d{4}-\d{6}$/).textContent!
    expect(screen.getByText(/48 heures ouvrées par le service concerné \(Service de la voirie\)/)).toBeInTheDocument()
    expect(screen.getByText('Danger immédiat ?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Copier la référence' }))
    expect(await screen.findByText('Référence copiée')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Suivre ce dossier' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Suivre un dossier' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: `Signalement ${ref}` })).toBeInTheDocument()
    expect(screen.getByText('Déposé depuis cet appareil par S. Bennani · CIN BE****12')).toBeInTheDocument()
  })

  it('« Signaler un autre problème » repart d’un formulaire vierge', async () => {
    const { user } = renderApp('/signaler')
    await toReview(user)
    await user.click(screen.getByRole('button', { name: 'Envoyer le signalement' }))
    await user.click(screen.getByRole('button', { name: 'Signaler un autre problème' }))
    expect(screen.getByText('Étape 1 sur 4')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Voirie et trottoirs/ })).not.toBeChecked()
  })

  it('refuse de continuer sans catégorie', async () => {
    const { user } = renderApp('/signaler')
    await next(user)
    expect(errorSummary()).toHaveFocus()
    expect(within(errorSummary()).getByRole('link', { name: 'Choisissez le type de problème.' })).toBeInTheDocument()
    expect(screen.getByText('Étape 1 sur 4')).toBeInTheDocument()
  })

  it('refuse de continuer sans repère ni rue', async () => {
    const { user } = renderApp('/signaler')
    await toLocation(user)
    await next(user)
    const summary = errorSummary()
    expect(within(summary).getByText('Placez le repère sur la carte à l’endroit du problème.')).toBeInTheDocument()
    expect(within(summary).getByText('Indiquez la rue ou un repère proche.')).toBeInTheDocument()
    expect(screen.getByLabelText('Rue ou repère')).toHaveAttribute('aria-invalid', 'true')
  })

  it('refuse une description trop courte, une CIN et un téléphone invalides', async () => {
    const { user } = renderApp('/signaler')
    await toDetails(user)
    await user.type(screen.getByLabelText('Description'), 'Trou')
    await user.clear(screen.getByLabelText('Numéro de CIN'))
    await user.type(screen.getByLabelText('Numéro de CIN'), '123BE')
    await user.clear(screen.getByLabelText('Téléphone mobile'))
    await user.type(screen.getByLabelText('Téléphone mobile'), '01 23')
    await next(user)

    const summary = errorSummary()
    expect(summary).toHaveFocus()
    expect(within(summary).getByText('Décrivez le problème en 15 caractères au moins.')).toBeInTheDocument()
    expect(within(summary).getByText(/Le numéro de CIN doit comporter/)).toBeInTheDocument()
    expect(within(summary).getByText(/Indiquez un numéro marocain à 10 chiffres/)).toBeInTheDocument()
    expect(screen.getByLabelText('Numéro de CIN')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Étape 3 sur 4')).toBeInTheDocument()
  })

  it('« Modifier » ramène à l’étape concernée en conservant les saisies', async () => {
    const { user } = renderApp('/signaler')
    await toReview(user)

    await user.click(screen.getByRole('button', { name: /Modifier.*Emplacement/ }))
    expect(screen.getByRole('heading', { level: 2, name: 'Où se trouve le problème ?' })).toHaveFocus()
    expect(screen.getByLabelText('Rue ou repère')).toHaveValue('Rue Ibnou Mounir, devant le n° 40')
    expect(screen.getByLabelText(/Arrondissement/)).toHaveValue('maarif')
    await user.clear(screen.getByLabelText('Rue ou repère'))
    await user.type(screen.getByLabelText('Rue ou repère'), 'Angle boulevard Zerktouni')
    await next(user)

    // Retour direct au récapitulatif, la description saisie est intacte.
    expect(screen.getByRole('heading', { level: 2, name: 'Vérifiez votre signalement' })).toBeInTheDocument()
    expect(screen.getByText('Angle boulevard Zerktouni')).toBeInTheDocument()
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Modifier.*Problème/ }))
    expect(screen.getByRole('radio', { name: /Voirie et trottoirs/ })).toBeChecked()

    await next(user)
    await user.click(screen.getByRole('button', { name: /Modifier.*Coordonnées/ }))
    expect(screen.getByLabelText('Description')).toHaveValue(DESCRIPTION)
  })

  it('affiche le titre arabe', () => {
    renderApp('/signaler', { lang: 'ar' })
    expect(screen.getByRole('heading', { level: 1, name: 'التبليغ عن مشكل' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /حفرة في الطريق/ })).toBeInTheDocument()
  })

  describe('accessibilité', () => {
    it('étape 1, avec erreur', async () => {
      const { user, container } = renderApp('/signaler')
      expect(await axeViolations(container)).toEqual([])
      await next(user)
      expect(await axeViolations(container)).toEqual([])
    })

    it('étape 2, avec erreurs puis repère placé', async () => {
      const { user, container } = renderApp('/signaler')
      await toLocation(user)
      await next(user)
      expect(await axeViolations(container)).toEqual([])
      await user.click(screen.getByRole('button', { name: 'Placer le repère au centre de la carte' }))
      expect(await axeViolations(container)).toEqual([])
    })

    it('étape 3, avec erreurs', async () => {
      const { user, container } = renderApp('/signaler')
      await toDetails(user)
      expect(await axeViolations(container)).toEqual([])
      await next(user)
      expect(await axeViolations(container)).toEqual([])
    })

    it('récapitulatif et confirmation', async () => {
      const { user, container } = renderApp('/signaler')
      await toReview(user)
      expect(await axeViolations(container)).toEqual([])
      await user.click(screen.getByRole('button', { name: 'Envoyer le signalement' }))
      expect(await axeViolations(container)).toEqual([])
    })
  })
})
