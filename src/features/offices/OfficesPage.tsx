import { useState } from 'react'
import { Clock, MapPin, Phone } from 'lucide-react'
import { OFFICES } from '../../data/offices'
import { casablancaNow, isOpenAt } from '../../data/schedule'
import type { Office, OfficeService } from '../../data/types'
import { fmt, useI18n } from '../../i18n/I18nProvider'
import { MapView } from '../../map/LazyMapView'
import { ButtonLink } from '../../ui/Button'
import { SelectField } from '../../ui/Field'
import { PageBody, PageHeader } from '../../ui/PageHeader'

const SERVICES: OfficeService[] = ['civil', 'certificates', 'urbanism', 'tax', 'reports']

function Hours({ office }: { office: Office }) {
  const { t } = useI18n()
  return (
    <ul className="space-y-0.5">
      {office.hours.map((h) => {
        const first = t.common.days[h.days[0] as keyof typeof t.common.days]
        const last = t.common.days[h.days[h.days.length - 1] as keyof typeof t.common.days]
        return (
          <li key={h.days.join()}>
            {h.days.length > 1 ? `${first} – ${last}` : first} : <span className="ref">{h.open} – {h.close}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function OfficesPage() {
  const { t } = useI18n()
  const [service, setService] = useState<OfficeService | ''>('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const now = casablancaNow()

  const list = service ? OFFICES.filter((o) => o.services.includes(service)) : OFFICES
  const active = list.find((o) => o.id === activeId) ?? null

  function select(id: string) {
    setActiveId(id)
    document.getElementById(`office-${id}`)?.scrollIntoView?.({ block: 'nearest' })
  }

  return (
    <>
      <PageHeader title={t.offices.title} lead={t.offices.lead} />
      <PageBody>
        <div className="max-w-sm">
          <SelectField
            id="office-service"
            label={t.offices.filterLabel}
            optional
            value={service}
            onChange={(e) => setService(e.target.value as OfficeService | '')}
          >
            <option value="">{t.offices.filterAll}</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {t.common.officeServices[s]}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section aria-labelledby="offices-count">
            <h2 id="offices-count" className="text-lg font-semibold text-ink" aria-live="polite">
              {list.length === 1 ? t.offices.listTitleOne : fmt(t.offices.listTitle, { count: list.length })}
            </h2>
            {list.length === 0 ? (
              <p className="mt-3 text-ink-soft">{t.offices.empty}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {list.map((o) => {
                  const open = isOpenAt(o, now)
                  return (
                    <li
                      key={o.id}
                      id={`office-${o.id}`}
                      className={`rounded-md border bg-white p-4 ${o.id === activeId ? 'border-brand-700 ring-2 ring-brand-700' : 'border-line'}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-ink">{o.name}</h3>
                        <span className={`text-sm font-semibold ${open ? 'text-success-700' : 'text-ink-soft'}`}>
                          {open ? t.offices.openNow : t.offices.closedNow}
                        </span>
                      </div>
                      <dl className="mt-2 grid gap-2 text-sm text-ink">
                        <div className="flex gap-2">
                          <dt><MapPin className="size-4 text-ink-soft" aria-hidden="true" /><span className="sr-only">{t.offices.address}</span></dt>
                          <dd>{o.address}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt><Phone className="size-4 text-ink-soft" aria-hidden="true" /><span className="sr-only">{t.offices.phone}</span></dt>
                          <dd className="ref">{o.phone}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt><Clock className="size-4 text-ink-soft" aria-hidden="true" /><span className="sr-only">{t.offices.hours}</span></dt>
                          <dd><Hours office={o} /></dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-sm text-ink-soft">
                        <span className="sr-only">{t.offices.services} : </span>
                        {o.services.map((s) => t.common.officeServices[s]).join(' · ')}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <ButtonLink to={`/rendez-vous?guichet=${o.id}`} variant="secondary" className="px-4 py-2 text-sm">
                          {t.offices.book}
                        </ButtonLink>
                        <button
                          type="button"
                          onClick={() => setActiveId(o.id)}
                          className="text-sm font-semibold text-brand-700 underline underline-offset-2"
                        >
                          {t.offices.showOnMap}
                          <span className="sr-only"> — {o.name}</span>
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
          <div className="lg:sticky lg:top-4 lg:self-start">
            <MapView
              label={t.common.map.label}
              markers={list.map((o) => ({ id: o.id, position: o.position, label: o.name }))}
              activeMarkerId={activeId}
              onSelectMarker={select}
              focus={active?.position ?? null}
              zoom={14}
              className="h-96 lg:h-[34rem]"
            />
          </div>
        </div>
      </PageBody>
    </>
  )
}
