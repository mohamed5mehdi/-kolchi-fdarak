import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, Compass } from 'lucide-react'
import type { OfficeService } from '../../data/types'
import { fmt, useI18n } from '../../i18n/I18nProvider'
import { SelectField, TextField } from '../../ui/Field'
import { PageBody, PageHeader } from '../../ui/PageHeader'
import { PROCEDURES } from './procedures'
import { normalizeSearch, procedureText } from './text'

/** Catégories ayant au moins une démarche, dans l'ordre du catalogue. */
const CATEGORIES: OfficeService[] = [...new Set(PROCEDURES.map((p) => p.officeService))]

export function ServicesPage() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<OfficeService | ''>('')

  const q = normalizeSearch(query)
  const list = PROCEDURES.filter((p) => {
    if (category && p.officeService !== category) return false
    if (!q) return true
    const text = procedureText(t, p)
    return normalizeSearch(`${text.title} ${text.summary}`).includes(q)
  })

  const count =
    list.length === 0
      ? t.services.catalog.countNone
      : list.length === 1
        ? t.services.catalog.countOne
        : fmt(t.services.catalog.count, { count: list.length })

  return (
    <>
      <PageHeader title={t.services.title} lead={t.services.lead} />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]" role="search">
          <TextField
            id="services-search"
            type="search"
            label={t.services.catalog.searchLabel}
            hint={t.services.catalog.searchHint}
            optional
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SelectField
            id="services-category"
            label={t.services.catalog.categoryLabel}
            optional
            value={category}
            onChange={(e) => setCategory(e.target.value as OfficeService | '')}
          >
            <option value="">{t.services.catalog.categoryAll}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.common.officeServices[c]}
              </option>
            ))}
          </SelectField>
        </div>

        <p role="status" className="mt-6 font-semibold text-ink">
          {count}
        </p>

        {list.length === 0 ? (
          <div className="mt-3 rounded-md border border-line bg-white p-5">
            <p className="font-semibold text-ink">{t.services.catalog.emptyTitle}</p>
            <p className="mt-1 text-ink-soft">{t.services.catalog.emptyBody}</p>
            <Link to="/orientation" className="mt-3 inline-flex items-center gap-2 font-semibold text-brand-700 underline underline-offset-2">
              <Compass className="size-4" aria-hidden="true" />
              {t.services.catalog.emptyLink}
            </Link>
          </div>
        ) : (
          <ul className="mt-3 grid gap-4 md:grid-cols-2">
            {list.map((p) => {
              const text = procedureText(t, p)
              return (
                <li key={p.id}>
                  <Link
                    to={`/demarches/${p.id}`}
                    className="group flex h-full items-start gap-3 rounded-md border border-line bg-white p-5 hover:border-brand-600"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink-soft">{t.common.officeServices[p.officeService]}</span>
                      <span className="mt-1 block text-lg font-semibold text-brand-700 group-hover:underline">{text.title}</span>
                      <span className="mt-1 block text-ink-soft">{text.summary}</span>
                    </span>
                    <ChevronRight className="mt-1 size-5 shrink-0 text-ink-soft rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </PageBody>
    </>
  )
}
