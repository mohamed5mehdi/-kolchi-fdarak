import { useState } from 'react'
import { useParams } from 'react-router'
import { CalendarClock, Printer } from 'lucide-react'
import { OFFICES, getOffice } from '../../data/offices'
import { fmt, useI18n } from '../../i18n/I18nProvider'
import { Alert } from '../../ui/Alert'
import { Button, ButtonLink } from '../../ui/Button'
import { SelectField } from '../../ui/Field'
import { PageBody, PageHeader } from '../../ui/PageHeader'
import { getProcedure } from '../../data/procedures'
import { UnknownProcedure } from './ServiceDetailPage'
import { documentLabels, procedureText } from './text'

export function PreparePage() {
  const { t } = useI18n()
  const { id } = useParams()
  const procedure = getProcedure(id)
  const [ready, setReady] = useState<Set<string>>(() => new Set())
  const [officeId, setOfficeId] = useState('')

  if (!procedure) return <UnknownProcedure />

  const text = procedureText(t, procedure)
  const crumbs = [
    { label: t.services.title, to: '/demarches' },
    { label: text.title, to: `/demarches/${procedure.id}` },
  ]

  if (!procedure.preparable) {
    return (
      <>
        <PageHeader title={t.services.prepare.title} crumbs={crumbs} />
        <PageBody narrow>
          <Alert>{t.services.prepare.notPreparable}</Alert>
          <ButtonLink to={`/demarches/${procedure.id}`} variant="secondary" className="mt-4">
            {t.services.prepare.backToDetail}
          </ButtonLink>
        </PageBody>
      </>
    )
  }

  const documents = documentLabels(t, procedure)
  const missing = documents.filter((d) => !ready.has(d.key))
  const complete = missing.length === 0
  const offices = OFFICES.filter((o) => o.services.includes(procedure.officeService))
  const office = getOffice(officeId)
  const bookParams = new URLSearchParams({ demarche: procedure.id })
  if (office) bookParams.set('guichet', office.id)

  function toggle(key: string) {
    setReady((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <>
      <PageHeader title={t.services.prepare.title} lead={t.services.prepare.lead} crumbs={crumbs}>
        <p className="mt-2 font-semibold text-ink">{text.title}</p>
      </PageHeader>
      <PageBody narrow>
        <div className="space-y-6">
          <fieldset className="no-print">
            <legend className="mb-3 text-lg font-semibold text-ink">{t.services.prepare.checklist}</legend>
            <ul className="space-y-2">
              {documents.map((d) => (
                <li key={d.key}>
                  <label
                    htmlFor={`doc-${d.key}`}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-line-strong bg-white p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600"
                  >
                    <input
                      id={`doc-${d.key}`}
                      type="checkbox"
                      checked={ready.has(d.key)}
                      onChange={() => toggle(d.key)}
                      className="mt-1 size-4 shrink-0 accent-brand-700 focus-visible:outline-none"
                    />
                    <span className="text-ink">{d.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <p role="status" className="no-print font-semibold text-ink">
            {fmt(ready.size <= 1 ? t.services.prepare.progressOne : t.services.prepare.progress, {
              ready: ready.size,
              total: documents.length,
            })}
          </p>

          <div className="no-print max-w-md">
            <SelectField
              id="prepare-office"
              label={t.services.prepare.officeLabel}
              optional
              value={officeId}
              onChange={(e) => setOfficeId(e.target.value)}
            >
              <option value="">{t.services.prepare.officeLater}</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </SelectField>
          </div>

          {complete ? (
            <>
              <div className="no-print">
                <Alert tone="success">{t.services.prepare.complete}</Alert>
              </div>
              <section aria-labelledby="prepare-summary" className="rounded-md border border-line bg-white p-5">
                <h2 id="prepare-summary" className="text-xl font-bold text-ink">
                  {t.services.prepare.summaryTitle}
                </h2>
                <dl className="mt-3 space-y-3">
                  <div>
                    <dt className="font-semibold text-ink">{t.services.prepare.summaryProcedure}</dt>
                    <dd className="text-ink">{text.title}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">{t.services.prepare.summaryOffice}</dt>
                    <dd className="text-ink">
                      {office ? `${office.name} — ${office.address}` : t.services.prepare.summaryNoOffice}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">{t.services.prepare.summaryDocuments}</dt>
                    <dd>
                      <ul className="list-disc space-y-1 ps-5 text-ink">
                        {documents.map((d) => (
                          <li key={d.key}>{d.label}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">{t.services.detail.delay}</dt>
                    <dd className="text-ink">{text.delay}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">{t.services.detail.fee}</dt>
                    <dd className="text-ink">{text.fee}</dd>
                  </div>
                </dl>
              </section>
              <div className="no-print flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer className="size-5" aria-hidden="true" />
                  {t.common.actions.print}
                </Button>
                {procedure.bookable ? (
                  <ButtonLink to={`/rendez-vous?${bookParams.toString()}`}>
                    <CalendarClock className="size-5" aria-hidden="true" />
                    {t.services.prepare.book}
                  </ButtonLink>
                ) : (
                  <p className="self-center text-ink-soft">{t.services.detail.walkIn}</p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-md border border-line bg-white p-4">
              <p className="font-semibold text-ink">{t.services.prepare.missing}</p>
              <ul className="mt-2 list-disc space-y-1 ps-5 text-ink">
                {missing.map((d) => (
                  <li key={d.key}>{d.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PageBody>
    </>
  )
}
