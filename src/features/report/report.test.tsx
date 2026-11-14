import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { renderApp } from '../../test/renderApp'
import { axeViolations } from '../../test/axe'

const DESCRIPTION = 'Nid-de-poule profond sur la voie de droite, dangereux pour les deux-roues.'
const SUBMIT = 'Enregistrer le signalement'

// La saisie simulée est lente sur une machine chargée : marge au-delà des 5 s par défaut.
vi.setConfig({ testTimeout: 15000 })

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
  it('stockage plein ou bloqué : message clair, aucune référence affichée, saisie conservée', async () => {
    const { user } = renderApp('/signaler')
    await toReview(user)
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    await user.click(screen.getByRole('button', { name: SUBMIT }))
    setItem.mockRestore()

    expect(errorSummary()).toHaveTextContent(/aucune référence n’a été attribuée/)
    expect(screen.queryByText(/KF-\d{4}-\d{6}/)).not.toBeInTheDocument()
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument()

    // Une fois le stockage disponible, le même enregistrement aboutit.
    await user.click(screen.getByRole('button', { name: SUBMIT }))
    expect(screen.getAllByText(/KF-\d{4}-\d{6}/).length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem('kolchi-fdarak:reports')!)).toHaveLength(1)
  })

  it('un double clic sur « Enregistrer » ne crée qu’un seul dossier', async () => {
    const { user } = renderApp('/signaler')
    await toReview(user)
    await user.dblClick(screen.getByRole('button', { name: SUBMIT }))
    expect(JSON.parse(localStorage.getItem('kolchi-fdarak:reports')!)).toHaveLength(1)
  })

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
    expect(screen.getByText(/Gardez-la : rien n’est transmis, n’indiquez pas vos vraies coordonnées/)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Description'), DESCRIPTION)
    expect(screen.getByText(`${DESCRIPTION.length} caractères sur 500`)).toBeInTheDocument()
    await next(user)

    expect(screen.getByRole('heading', { level: 2, name: 'Vérifiez votre signalement' })).toHaveFocus()
    expect(screen.getByText('Voirie et trottoirs')).toBeInTheDocument()
    expect(screen.getByText('Rue Ibnou Mounir, devant le n° 40')).toBeInTheDocument()
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: SUBMIT }))

    expect(screen.getByRole('heading', { level: 2, name: 'Signalement enregistré' })).toHaveFocus()
    const ref = screen.getByText(/^KF-\d{4}-\d{6}$/).textContent!
    expect(screen.getByText('Ce dossier reste sur cet appareil et n’est transmis à aucune administration.')).toBeInTheDocument()
    expect(screen.getByText(/Aucun SMS n’est envoyé/)).toBeInTheDocument()
    expect(screen.getByText(`Vous pouvez le retrouver sur cet appareil avec la référence ${ref}.`)).toBeInTheDocument()
    expect(screen.queryByText(/48 heures|service concerné/)).not.toBeInTheDocument()
    expect(screen.getByText('Danger immédiat ?')).toBeInTheDocument()

    // Le stockage ne garde ni le nom, ni la CIN (même partielle), ni le téléphone.
    const stored = localStorage.getItem('kolchi-fdarak:reports')!
    for (const fragment of ['contact', 'Salma', 'Bennani', 'BE899', '899512', 'BE*', '0612345678']) expect(stored).not.toContain(fragment)

    await user.click(screen.getByRole('button', { name: 'Copier la référence' }))
    expect(await screen.findByText('Référence copiée')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Suivre ce dossier' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Suivre un dossier' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: `Signalement ${ref}` })).toBeInTheDocument()
    expect(screen.getByText(/^Enregistré sur cet appareil — n’est transmis à aucune administration\./)).toBeInTheDocument()
    expect(screen.getByText(/n’évoluera pas/)).toBeInTheDocument()
  })

  it('« Signaler un autre problème » repart d’un formulaire vierge', async () => {
    const { user } = renderApp('/signaler')
    await toReview(user)
    await user.click(screen.getByRole('button', { name: SUBMIT }))
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
    expect(within(summary).getByText(/Indiquez un numéro de mobile marocain/)).toBeInTheDocument()
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
      await user.click(screen.getByRole('button', { name: SUBMIT }))
      expect(await axeViolations(container)).toEqual([])
    })
  })
})
