import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CalendarClock, ChevronRight, Megaphone, Search, SearchX } from 'lucide-react'
import { getOffice } from '../../data/offices'
import { fmt, useI18n } from '../../i18n/I18nProvider'
import { normalizeRef } from '../../lib/reference'
import { findAppointment, useAppointments } from '../../state/appointments'
import { findReport, myReports, useReports } from '../../state/reports'
import { TextField } from '../../ui/Field'
import { PageBody, PageHeader } from '../../ui/PageHeader'
import { StatusBadge } from '../../ui/StatusBadge'
import { AppointmentCase } from './AppointmentCase'
import { dayIso } from './format'
import { RefHeading } from './RefHeading'
import { ReportCase } from './ReportCase'

function RefForm({ initial }: { initial: string }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [value, setValue] = useState(initial)
  const [error, setError] = useState<string>()

  function submit(e: FormEvent) {
    e.preventDefault()
    const ref = normalizeRef(value)
    if (!ref) {
      setError(t.tracking.form.error)
      document.getElementById('tracking-ref')?.focus()
      return
    }
    setError(undefined)
    setValue(ref)
    navigate(`/suivi/${ref}`)
  }

  return (
    <form noValidate onSubmit={submit} role="search" className="rounded-md border border-line bg-white p-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <TextField
            id="tracking-ref"
            label={t.tracking.form.label}
            hint={t.tracking.form.hint}
            error={error}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            dir="ltr"
            className="ref uppercase"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-5 py-2.5 font-semibold text-white hover:bg-brand-800"
        >
          <Search className="size-4" aria-hidden="true" />
          {t.common.actions.search}
        </button>
      </div>
    </form>
  )
}

function NotFoundCase({ value }: { value: string }) {
  const { t } = useI18n()
  return (
    <section aria-labelledby="case-title" className="rounded-md border-s-4 border-warning-700 bg-warning-50 p-5">
      <h2 id="case-title" className="flex items-start gap-2 text-xl font-bold text-ink">
        <SearchX className="mt-1 size-5 shrink-0 text-warning-700" aria-hidden="true" />
        <span>
          <RefHeading template={t.tracking.notFound.title} value={value} />
        </span>
      </h2>
      <p className="mt-2 text-ink">{t.tracking.notFound.check}</p>
      <p className="mt-2 text-ink-soft">{t.tracking.notFound.delay}</p>
    </section>
  )
}

function OnThisDevice() {
  const { t, date } = useI18n()
  // Abonnement au magasin pour réafficher la liste quand un dossier est ajouté.
  useReports()
  const reports = myReports()
  const appointments = useAppointments()
  const linkClass = 'flex items-center gap-3 p-4 hover:bg-brand-50'

  return (
    <section aria-labelledby="device-title" className="mt-10">
      <h2 id="device-title" className="text-2xl font-bold text-ink">
        {t.tracking.device.title}
      </h2>
      <p className="mt-1 text-ink-soft">{t.tracking.device.lead}</p>
      {reports.length === 0 && appointments.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-line-strong bg-white p-5 text-ink-soft">
          {t.tracking.device.empty}
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {reports.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-ink">{t.tracking.device.reports}</h3>
              <ul className="mt-2 divide-y divide-line rounded-md border border-line bg-white">
                {reports.map((r) => (
                  <li key={r.ref}>
                    <Link to={`/suivi/${r.ref}`} className={linkClass}>
                      <Megaphone className="size-5 shrink-0 text-brand-700" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">{t.common.categories[r.category]}</span>
                        <span className="block text-sm text-ink-soft">
                          {date(r.createdAt)} · <span className="ref">{r.ref}</span>
                        </span>
                      </span>
                      <StatusBadge status={r.status} />
                      <ChevronRight className="size-4 shrink-0 text-ink-soft rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {appointments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-ink">{t.tracking.device.appointments}</h3>
              <ul className="mt-2 divide-y divide-line rounded-md border border-line bg-white">
                {appointments.map((a) => (
                  <li key={a.ref}>
                    <Link to={`/suivi/${a.ref}`} className={linkClass}>
                      <CalendarClock className="size-5 shrink-0 text-brand-700" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">{getOffice(a.officeId)?.name ?? a.officeId}</span>
                        <span className="block text-sm text-ink-soft">
                          {fmt(t.tracking.device.slotAt, { date: date(dayIso(a.date), 'dayLong'), slot: a.slot })} ·{' '}
                          <span className="ref">{a.ref}</span>
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-ink-soft rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export function TrackingPage() {
  const { t } = useI18n()
  const { ref: param } = useParams()
  // Abonnements : la page se met à jour si un dossier est ajouté ou effacé.
  useReports()
  useAppointments()

  const raw = param?.trim() ?? ''
  const ref = normalizeRef(raw) ?? raw.toUpperCase()
  const report = ref ? findReport(ref) : undefined
  const appointment = ref && !report ? findAppointment(ref) : undefined

  return (
    <>
      <PageHeader title={t.tracking.title} lead={t.tracking.lead} />
      <PageBody>
        <div className="max-w-3xl">
          {/* key : le champ reprend la référence affichée à chaque navigation. */}
          <RefForm key={ref} initial={ref} />
        </div>
        {ref && (
          <div className="mt-8">
            {report ? (
              <ReportCase report={report} />
            ) : appointment ? (
              <div className="max-w-3xl">
                <AppointmentCase appointment={appointment} />
              </div>
            ) : (
              <div className="max-w-3xl">
                <NotFoundCase value={ref} />
              </div>
            )}
          </div>
        )}
        {!ref && <OnThisDevice />}
      </PageBody>
    </>
  )
}
