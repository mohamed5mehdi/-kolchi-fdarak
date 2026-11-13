import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../../test/renderApp'
import { axeViolations } from '../../test/axe'

const next = () => screen.getByRole('button', { name: 'Continuer' })

describe('orientation', () => {
  it("mène à une démarche avec le fil des réponses", async () => {
    const { user } = renderApp('/orientation')
    expect(screen.getByRole('group', { name: 'Que souhaitez-vous faire ?' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Obtenir un acte d’état civil' }))
    await user.click(next())
    expect(screen.getByRole('group', { name: 'Pour qui ?' })).toHaveFocus()
    await user.click(screen.getByRole('radio', { name: 'Pour votre enfant' }))
    await user.click(next())
    await user.click(screen.getByRole('radio', { name: 'Une copie intégrale, avec toutes les mentions' }))
    await user.click(next())

    expect(screen.getByRole('heading', { level: 2, name: 'La démarche à suivre' })).toHaveFocus()
    expect(screen.getByRole('heading', { level: 3, name: 'Copie intégrale d’acte de naissance' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voir la fiche' })).toHaveAttribute('href', '/demarches/birth-certificate')
    expect(screen.getByRole('link', { name: 'Préparer ma demande' })).toHaveAttribute('href', '/demarches/birth-certificate/preparer')
    expect(screen.getByRole('link', { name: 'Prendre rendez-vous' })).toHaveAttribute('href', '/rendez-vous?demarche=birth-certificate')
    expect(screen.getByText('Pour votre enfant')).toBeInTheDocument()
  })

  it('oriente vers le signalement', async () => {
    const { user } = renderApp('/orientation')
    await user.click(screen.getByRole('radio', { name: 'Signaler un problème dans la rue' }))
    await user.click(next())
    expect(screen.getByRole('link', { name: 'Faire un signalement' })).toHaveAttribute('href', '/signaler')
  })

  it('demande une réponse avant de continuer', async () => {
    const { user } = renderApp('/orientation')
    await user.click(next())
    expect(screen.getByText('Choisissez une réponse.')).toBeInTheDocument()
  })

  it('Retour revient à la question précédente, Recommencer à la première', async () => {
    const { user } = renderApp('/orientation')
    await user.click(screen.getByRole('radio', { name: 'Faire légaliser une signature ou certifier une copie' }))
    await user.click(next())
    await user.click(screen.getByRole('radio', { name: 'Des photocopies de documents' }))
    await user.click(next())
    expect(screen.getByRole('heading', { level: 3, name: 'Certification conforme de copies' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retour' }))
    expect(screen.getByRole('group', { name: 'Que faut-il faire certifier ?' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Des photocopies de documents' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Recommencer' }))
    expect(screen.getByRole('group', { name: 'Que souhaitez-vous faire ?' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Vos réponses' })).not.toBeInTheDocument()
  })

  it('aucune violation axe sur une question et sur le résultat', async () => {
    const { user, container } = renderApp('/orientation')
    expect(await axeViolations(container)).toEqual([])
    await user.click(screen.getByRole('radio', { name: 'Faire des travaux chez vous' }))
    await user.click(next())
    expect(await axeViolations(container)).toEqual([])
  })
})
