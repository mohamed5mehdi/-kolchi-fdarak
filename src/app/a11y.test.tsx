import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/renderApp'

describe('accessibilité transversale', () => {
  it.each([
    ['/', 'fr', 'kolchi-fdarak — Services de proximité · Casablanca'],
    ['/guichets', 'fr', 'Guichets et horaires — kolchi-fdarak'],
    ['/introuvable', 'fr', 'Page introuvable — kolchi-fdarak'],
    ['/guichets', 'ar', 'الشبابيك والتوقيت — kolchi-fdarak'],
  ] as const)('%s (%s) : le titre de l’onglet décrit la page (2.4.2)', (route, lang, title) => {
    renderApp(route, { lang })
    expect(document.title).toBe(title)
  })

  it('après une recherche de dossier, le résultat reçoit le focus (4.1.3)', async () => {
    const { user } = renderApp('/suivi')
    await user.type(screen.getByLabelText(/Référence du dossier/), 'KF-2026-004817')
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))
    expect(screen.getByRole('heading', { level: 2, name: /KF-2026-004817/ })).toHaveFocus()
  })

  it('une référence introuvable est elle aussi annoncée par le focus', async () => {
    const { user } = renderApp('/suivi')
    await user.type(screen.getByLabelText(/Référence du dossier/), 'KF-2026-000000')
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))
    expect(screen.getByRole('heading', { level: 2, name: /KF-2026-000000/ })).toHaveFocus()
  })

  it('orientation : continuer sans réponse place le focus sur la question en erreur (3.3.1)', async () => {
    const { user } = renderApp('/orientation')
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    const question = document.getElementById('guide-start')!
    expect(question).toHaveFocus()
    expect(question.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('rendez-vous : un créneau pris entre-temps laisse le focus sur le récapitulatif d’erreurs', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-14T09:05:00Z'))
    try {
      const { user } = renderApp('/rendez-vous?demarche=birth-certificate&guichet=maarif')
      const next = () => user.click(screen.getByRole('button', { name: 'Continuer' }))
      await next()
      await next()
      await user.click(screen.getByRole('radio', { name: '10:30' }))
      await next()
      await next()
      localStorage.setItem(
        'kolchi-fdarak:appointments',
        JSON.stringify([
          {
            ref: 'RDV-2026-000001',
            officeId: 'maarif',
            procedureId: 'birth-certificate',
            date: '2026-11-14',
            slot: '10:30',
            createdAt: new Date().toISOString(),
          },
        ]),
      )
      await user.click(screen.getByRole('button', { name: /Enregistrer le rendez-vous/ }))
      expect(screen.getByRole('alert')).toHaveFocus()
    } finally {
      vi.useRealTimers()
    }
  })
})
