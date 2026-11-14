import { Link, useParams } from 'react-router'
import { CalendarClock, ClipboardCheck, MapPin } from 'lucide-react'
import { OFFICES } from '../../data/offices'
import { useI18n } from '../../i18n/I18nProvider'
import { Alert } from '../../ui/Alert'
import { ButtonLink } from '../../ui/Button'
import { PageBody, PageHeader } from '../../ui/PageHeader'
import { getProcedure } from '../../data/procedures'
import { documentLabels, procedureText } from './text'

/** Démarche inconnue : message et retour au catalogue. */
export function UnknownProcedure() {
  const { t } = useI18n()
  return (
    <>
      <PageHeader title={t.services.detail.notFoundTitle} crumbs={[{ label: t.services.title, to: '/demarches' }]} />
      <PageBody narrow>
        <p className="text-ink">{t.services.detail.notFoundBody}</p>
        <ButtonLink to="/demarches" variant="secondary" className="mt-4">
          {t.services.detail.backToList}
        </ButtonLink>
      </PageBody>
    </>
  )
}

export function ServiceDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const procedure = getProcedure(id)
  if (!procedure) return <UnknownProcedure />

  const text = procedureText(t, procedure)
  const offices = OFFICES.filter((o) => o.services.includes(procedure.officeService))

  return (
    <>
      <PageHeader title={text.title} lead={text.summary} crumbs={[{ label: t.services.title, to: '/demarches' }]}>
        <p className="mt-2 text-sm text-ink-soft">{t.common.officeServices[procedure.officeService]}</p>
      </PageHeader>
      <PageBody>
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <section aria-labelledby="detail-who">
              <h2 id="detail-who" className="text-xl font-bold text-ink">
                {t.services.detail.who}
              </h2>
              <p className="mt-2 text-ink">{text.who}</p>
            </section>

            <section aria-labelledby="detail-documents">
              <h2 id="detail-documents" className="text-xl font-bold text-ink">
                {t.services.detail.documents}
              </h2>
              <ul className="mt-2 list-disc space-y-1 ps-5 text-ink">
                {documentLabels(t, procedure).map((d) => (
                  <li key={d.key}>{d.label}</li>
                ))}
              </ul>
            </section>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-line bg-white p-4">
                <dt className="font-semibold text-ink">{t.services.detail.delay}</dt>
                <dd className="mt-1 text-ink">{text.delay}</dd>
              </div>
              <div className="rounded-md border border-line bg-white p-4">
                <dt className="font-semibold text-ink">{t.services.detail.fee}</dt>
                <dd className="mt-1 text-ink">{text.fee}</dd>
              </div>
            </dl>
            <p className="text-sm text-ink-soft">{t.services.detail.indicative}</p>

            <div className="flex flex-wrap gap-3">
              {procedure.preparable && (
                <ButtonLink to={`/demarches/${procedure.id}/preparer`}>
                  <ClipboardCheck className="size-5" aria-hidden="true" />
                  {t.services.detail.prepare}
                </ButtonLink>
              )}
              {procedure.bookable && (
                <ButtonLink to={`/rendez-vous?demarche=${procedure.id}`} variant="secondary">
                  <CalendarClock className="size-5" aria-hidden="true" />
                  {t.services.detail.book}
                </ButtonLink>
              )}
            </div>
            {!procedure.bookable && <Alert>{t.services.detail.walkIn}</Alert>}
          </div>

          <section aria-labelledby="detail-where">
            <h2 id="detail-where" className="text-xl font-bold text-ink">
              {t.services.detail.where}
            </h2>
            <ul className="mt-3 space-y-3">
              {offices.map((o) => (
                <li key={o.id} className="rounded-md border border-line bg-white p-4">
                  <p className="font-semibold text-ink">{o.name}</p>
                  <p className="mt-1 flex gap-2 text-sm text-ink-soft">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {o.address}
                  </p>
                </li>
              ))}
            </ul>
            <Link to="/guichets" className="mt-3 inline-block font-semibold text-brand-700 underline underline-offset-2">
              {t.services.detail.officesLink}
            </Link>
          </section>
        </div>
      </PageBody>
    </>
  )
}
