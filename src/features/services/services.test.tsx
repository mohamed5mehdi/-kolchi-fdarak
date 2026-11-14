import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from '../../test/renderApp'
import { axeViolations } from '../../test/axe'
import { ar } from '../../i18n/locales/ar'
import { darija } from '../../i18n/locales/darija'
import { en } from '../../i18n/locales/en'
import { fr } from '../../i18n/locales/fr'
import { PROCEDURES, getProcedure } from '../../data/procedures'
import { documentLabels, normalizeSearch } from './text'

const status = () => screen.getByRole('status')

describe('données des démarches', () => {
  it('chaque pièce a un libellé dans les 4 langues', () => {
    const missing = [fr, ar, darija, en].flatMap((dict) =>
      PROCEDURES.flatMap((p) => documentLabels(dict, p).filter((d) => !d.label).map((d) => `${p.id}.${d.key}`)),
    )
    expect(missing).toEqual([])
  })

  it('getProcedure renvoie undefined pour un id inconnu', () => {
    expect(getProcedure('birth-certificate')?.officeService).toBe('civil')
    expect(getProcedure('inconnue')).toBeUndefined()
  })

  it('normalise la recherche sans accents ni casse', () => {
    expect(normalizeSearch('  Légalisation ')).toBe('legalisation')
  })
})

describe('catalogue des démarches', () => {
  it('affiche toutes les démarches avec un lien vers leur fiche', () => {
    renderApp('/demarches')
    expect(status()).toHaveTextContent('8 démarches')
    expect(screen.getByRole('link', { name: /Copie intégrale d’acte de naissance/ })).toHaveAttribute(
      'href',
      '/demarches/birth-certificate',
    )
  })

  it('la recherche « naissance » réduit la liste', async () => {
    const { user } = renderApp('/demarches')
    await user.type(screen.getByLabelText(/Rechercher une démarche/), 'naissance')
    expect(status()).toHaveTextContent('3 démarches')
    expect(screen.queryByRole('link', { name: /Certificat de résidence/ })).not.toBeInTheDocument()
  })

  it('la recherche sans accent « legalisation » trouve la légalisation', async () => {
    const { user } = renderApp('/demarches')
    await user.type(screen.getByLabelText(/Rechercher une démarche/), 'LEGALISATION')
    expect(status()).toHaveTextContent('1 démarche')
    expect(screen.getByRole('link', { name: /Légalisation de signature/ })).toBeInTheDocument()
  })

  it('filtre par catégorie', async () => {
    const { user } = renderApp('/demarches')
    await user.selectOptions(screen.getByLabelText(/Catégorie/), 'urbanism')
    expect(status()).toHaveTextContent('1 démarche')
    expect(screen.getByRole('link', { name: /Autorisation de petits travaux/ })).toBeInTheDocument()
  })

  it("propose l'orientation quand rien ne correspond", async () => {
    const { user } = renderApp('/demarches')
    await user.type(screen.getByLabelText(/Rechercher une démarche/), 'passeport biométrique')
    expect(status()).toHaveTextContent('Aucune démarche')
    expect(screen.getByRole('link', { name: 'Trouver la bonne démarche' })).toHaveAttribute('href', '/orientation')
  })

  it('affiche le catalogue en arabe', () => {
    renderApp('/demarches', { lang: 'ar' })
    expect(screen.getByRole('heading', { level: 1, name: 'المساطر' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /نسخة كاملة من رسم الولادة/ })).toBeInTheDocument()
  })
})

describe('fiche démarche', () => {
  it('affiche les pièces et les guichets compétents', () => {
    renderApp('/demarches/minor-works')
    expect(screen.getByRole('heading', { level: 1, name: 'Autorisation de petits travaux' })).toBeInTheDocument()
    const docs = screen.getByRole('heading', { name: 'Pièces à fournir' }).parentElement!
    expect(within(docs).getAllByRole('listitem')).toHaveLength(4)
    const where = screen.getByRole('heading', { name: 'Où s’adresser' }).parentElement!
    expect(within(where).getByText('Guichet Maârif')).toBeInTheDocument()
    expect(within(where).getByText('Guichet Aïn Chock')).toBeInTheDocument()
    expect(within(where).queryByText('Guichet Sidi Belyout')).not.toBeInTheDocument()
    expect(within(where).getByRole('link', { name: 'Horaires et plan des guichets' })).toHaveAttribute('href', '/guichets')
    expect(screen.getByRole('link', { name: 'Préparer ma demande' })).toHaveAttribute('href', '/demarches/minor-works/preparer')
    expect(screen.getByRole('link', { name: 'Prendre rendez-vous' })).toHaveAttribute('href', '/rendez-vous?demarche=minor-works')
  })

  it('une démarche sans rendez-vous le signale', () => {
    renderApp('/demarches/certified-copy')
    expect(screen.queryByRole('link', { name: 'Prendre rendez-vous' })).not.toBeInTheDocument()
    expect(screen.getByText(/sans rendez-vous/)).toBeInTheDocument()
  })

  it('un identifiant inconnu affiche un message et un lien vers le catalogue', () => {
    renderApp('/demarches/inconnue')
    expect(screen.getByRole('heading', { level: 1, name: 'Démarche introuvable' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voir toutes les démarches' })).toHaveAttribute('href', '/demarches')
  })
})

describe('préparer une demande', () => {
  it('cocher toutes les pièces affiche le récapitulatif et le lien de rendez-vous', async () => {
    const { user } = renderApp('/demarches/birth-certificate/preparer')
    expect(status()).toHaveTextContent('0 pièce prête sur 3')
    expect(screen.queryByRole('heading', { name: 'Récapitulatif de la demande' })).not.toBeInTheDocument()

    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(3)
    await user.click(boxes[0])
    await user.click(boxes[1])
    expect(status()).toHaveTextContent('2 pièces prêtes sur 3')
    const missing = screen.getByText('Il vous reste à réunir :').parentElement!
    expect(within(missing).getAllByRole('listitem')).toHaveLength(1)

    await user.selectOptions(screen.getByLabelText(/Guichet où déposer la demande/), 'maarif')
    await user.click(boxes[2])
    expect(screen.getByRole('heading', { name: 'Récapitulatif de la demande' })).toBeInTheDocument()
    expect(screen.getByText(/Guichet Maârif — 27, rue Ibnou Mounir/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Imprimer' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Prendre rendez-vous' })).toHaveAttribute(
      'href',
      '/rendez-vous?demarche=birth-certificate&guichet=maarif',
    )
  })

  it("une démarche sans liste fixe renvoie vers l'agent", () => {
    renderApp('/demarches/administrative-certificate/preparer')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Revenir à la fiche' })).toHaveAttribute('href', '/demarches/administrative-certificate')
  })
})

describe('accessibilité', () => {
  it.each(['/demarches', '/demarches/birth-certificate', '/demarches/certified-copy', '/demarches/inconnue', '/demarches/birth-extract/preparer'])(
    '%s : aucune violation axe',
    async (route) => {
      const { container } = renderApp(route)
      expect(await axeViolations(container)).toEqual([])
    },
  )

  it('récapitulatif complet : aucune violation axe', async () => {
    const { user, container } = renderApp('/demarches/birth-extract/preparer')
    for (const box of screen.getAllByRole('checkbox')) await user.click(box)
    expect(await axeViolations(container)).toEqual([])
  })

  it('catalogue vide : aucune violation axe', async () => {
    const { user, container } = renderApp('/demarches')
    await user.type(screen.getByLabelText(/Rechercher une démarche/), 'zzz')
    expect(await axeViolations(container)).toEqual([])
  })
})
