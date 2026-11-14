import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useI18n } from '../i18n/I18nProvider'

export interface Crumb {
  label: string
  to?: string
}

/** Fil d'Ariane + titre de page (h1) + chapeau. Un seul h1 par page. */
export function PageHeader({ title, lead, crumbs = [], children }: {
  title: string
  lead?: string
  crumbs?: Crumb[]
  children?: ReactNode
}) {
  const { t } = useI18n()
  const trail: Crumb[] = [{ label: t.common.nav.home, to: '/' }, ...crumbs]
  useDocumentTitle(title)
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <nav aria-label={t.common.nav.breadcrumb} className="mb-3 text-sm">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-soft">
            {trail.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {c.to ? (
                  <Link to={c.to} className="text-brand-700 underline underline-offset-2 hover:no-underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <span aria-current="page">{title}</span>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {lead && <p className="mt-3 max-w-3xl text-lg text-ink-soft">{lead}</p>}
        {children}
      </div>
    </div>
  )
}

/** Conteneur standard du contenu d'une page. */
export function PageBody({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto px-4 py-8 sm:px-6 ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>{children}</div>
}

/** Titre de l'onglet : « Page — kolchi-fdarak », dans la langue courante (WCAG 2.4.2). */
// eslint-disable-next-line react-refresh/only-export-components
export function useDocumentTitle(page?: string) {
  const { t } = useI18n()
  useEffect(() => {
    document.title = page ? `${page} — ${t.common.brand.name}` : `${t.common.brand.name} — ${t.common.brand.tagline}`
  }, [page, t])
}
