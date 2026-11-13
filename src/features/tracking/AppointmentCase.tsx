import { getOffice } from '../../data/offices'
import type { Appointment } from '../../data/types'
import { useI18n } from '../../i18n/I18nProvider'
import { Alert } from '../../ui/Alert'
import { getProcedure } from '../services/procedures'
import { procedureText } from '../services/text'
import { dayIso } from './format'
import { RefHeading } from './RefHeading'

export function AppointmentCase({ appointment }: { appointment: Appointment }) {
  const { t, date } = useI18n()
  const office = getOffice(appointment.officeId)
  const procedure = getProcedure(appointment.procedureId)

  return (
    <article aria-labelledby="case-title" className="space-y-4 rounded-md border border-line bg-white p-5">
      <h2 id="case-title" className="text-2xl font-bold text-ink">
        <RefHeading template={t.tracking.appointment.heading} value={appointment.ref} />
      </h2>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[11rem_1fr]">
        {procedure && (
          <>
            <dt className="text-sm font-semibold text-ink-soft">{t.tracking.appointment.procedure}</dt>
            <dd className="font-semibold text-ink">{procedureText(t, procedure).title}</dd>
          </>
        )}
        <dt className="text-sm font-semibold text-ink-soft">{t.tracking.appointment.office}</dt>
        <dd className="text-ink">
          {office ? (
            <>
              <span className="block font-semibold">{office.name}</span>
              <span className="block text-ink-soft">{office.address}</span>
            </>
          ) : (
            appointment.officeId
          )}
        </dd>
        <dt className="text-sm font-semibold text-ink-soft">{t.tracking.appointment.date}</dt>
        <dd className="text-ink">{date(dayIso(appointment.date), 'dayLong')}</dd>
        <dt className="text-sm font-semibold text-ink-soft">{t.tracking.appointment.slot}</dt>
        <dd className="ref text-ink">{appointment.slot}</dd>
      </dl>
      <Alert>{t.tracking.appointment.bring}</Alert>
    </article>
  )
}
