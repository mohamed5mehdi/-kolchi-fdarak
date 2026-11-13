import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CircleCheck } from 'lucide-react'
import { OFFICES, getOffice } from '../../data/offices'
import type { Appointment } from '../../data/types'
import { fmt, useI18n } from '../../i18n/I18nProvider'
import { formatPhone, isFilled, isValidCin, isValidPhone } from '../../lib/validation'
import { bookAppointment } from '../../state/appointments'
import { Alert } from '../../ui/Alert'
import { Button, ButtonLink } from '../../ui/Button'
import { ChoiceCards } from '../../ui/ChoiceCards'
import { ErrorSummary, type FieldError } from '../../ui/ErrorSummary'
import { SelectField, TextField } from '../../ui/Field'
import { PageBody, PageHeader } from '../../ui/PageHeader'
import { Stepper } from '../../ui/Stepper'
import { PROCEDURES, getProcedure } from '../services/procedures'
import { documentLabels, procedureText } from '../services/text'
import { availableSlots, bookableDays, dayToDate } from './slots'

const BOOKABLE = PROCEDURES.filter((p) => p.bookable)

/** Identité d'exemple proposée par défaut, modifiable. */
const SAMPLE_CONTACT = { fullName: 'Salma Bennani', cin: 'BE899512', phone: '06 12 34 56 78' }

type Step = 1 | 2 | 3 | 4 | 5

/** `now` est injectable pour des tests déterministes. */
export function BookingPage({ now }: { now?: Date }) {
  const { t, date } = useI18n()
  const [params] = useSearchParams()
  const [today] = useState(() => now ?? new Date())

  const [procedureId, setProcedureId] = useState<string>(() => {
    const p = getProcedure(params.get('demarche'))
    return p?.bookable ? p.id : ''
  })
  const [officeId, setOfficeId] = useState(() => {
    const office = getOffice(params.get('guichet') ?? '')
    const procedure = getProcedure(params.get('demarche'))
    // Un guichet qui ne traite pas la démarche demandée n'est pas présélectionné.
    return office && (!procedure || office.services.includes(procedure.officeService)) ? office.id : ''
  })
  const [day, setDay] = useState('')
  const [slot, setSlot] = useState('')
  const [contact, setContact] = useState(SAMPLE_CONTACT)
  const [step, setStep] = useState<Step>(1)
  const [errors, setErrors] = useState<FieldError[]>([])
  const [attempt, setAttempt] = useState(0)
  const [done, setDone] = useState<Appointment | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    headingRef.current?.focus()
  }, [step, done])

  const procedure = getProcedure(procedureId)
  const office = getOffice(officeId)
  const offices = procedure ? OFFICES.filter((o) => o.services.includes(procedure.officeService)) : []
  const urlOffice = getOffice(params.get('guichet') ?? '')
  const urlOfficeRejected = urlOffice && procedure && !urlOffice.services.includes(procedure.officeService)

  const days = office ? bookableDays(office, today) : []
  const currentDay = days.includes(day) ? day : (days[0] ?? '')
  const slots = office && currentDay ? availableSlots(office, currentDay, today) : []

  const longDay = (iso: string) => date(dayToDate(iso).toISOString(), 'dayLong')
  const errorFor = (field: string) => errors.find((e) => e.field === field)?.message

  const stepNames = [t.booking.steps.procedure, t.booking.steps.office, t.booking.steps.slot, t.booking.steps.contact, t.booking.steps.review]

  function goTo(next: Step) {
    setErrors([])
    setStep(next)
  }

  function validate(): FieldError[] {
    const found: FieldError[] = []
    if (step === 1 && !procedure) found.push({ field: 'booking-procedure', message: t.booking.procedure.error })
    if (step === 2 && !office) found.push({ field: 'booking-office', message: t.booking.office.error })
    if (step === 3 && (!slot || !slots.includes(slot))) found.push({ field: 'booking-slot', message: t.booking.slot.error })
    if (step === 4) {
      if (!isFilled(contact.fullName)) found.push({ field: 'booking-name', message: t.common.form.fullNameError })
      if (!isValidCin(contact.cin)) found.push({ field: 'booking-cin', message: t.common.form.cinError })
      if (!isValidPhone(contact.phone)) found.push({ field: 'booking-phone', message: t.common.form.phoneError })
    }
    return found
  }

  function next(e: FormEvent) {
    e.preventDefault()
    const found = validate()
    setAttempt((a) => a + 1)
    if (found.length > 0) {
      setErrors(found)
      return
    }
    if (step === 3) setDay(currentDay)
    goTo((step + 1) as Step)
  }

  function confirm(e: FormEvent) {
    e.preventDefault()
    if (!procedure || !office) return
    try {
      setDone(bookAppointment({ procedureId: procedure.id, officeId: office.id, date: currentDay, slot, contact }))
    } catch {
      setSlot('')
      setStep(3)
      setAttempt((a) => a + 1)
      setErrors([{ field: 'booking-slot', message: t.booking.slot.taken }])
    }
  }

  function chooseProcedure(id: string) {
    setProcedureId(id)
    const p = getProcedure(id)
    if (office && p && !office.services.includes(p.officeService)) setOfficeId('')
  }

  function chooseOffice(id: string) {
    setOfficeId(id)
    setDay('')
    setSlot('')
  }

  if (done) return <Confirmation appointment={done} headingRef={headingRef} />

  const heading = (text: string) => (
    <h2 ref={headingRef} tabIndex={-1} className="mb-4 text-2xl font-bold text-ink focus:outline-none">
      {text}
    </h2>
  )

  const actions = (primary: string) => (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Button type="submit">{primary}</Button>
      {step > 1 && (
        <Button variant="ghost" onClick={() => goTo((step - 1) as Step)}>
          {t.common.actions.back}
        </Button>
      )}
    </div>
  )

  return (
    <>
      <PageHeader title={t.booking.title} lead={t.booking.lead} />
      <PageBody narrow>
        <Stepper current={step} steps={stepNames} />
        <form noValidate onSubmit={step === 5 ? confirm : next} className="space-y-6">
          <ErrorSummary errors={errors} attempt={attempt} />

          {step === 1 && (
            <>
              {heading(t.booking.procedure.title)}
              <SelectField
                id="booking-procedure"
                label={t.booking.procedure.label}
                hint={t.booking.procedure.hint}
                error={errorFor('booking-procedure')}
                value={procedureId}
                onChange={(e) => chooseProcedure(e.target.value)}
              >
                <option value="">{t.booking.procedure.choose}</option>
                {BOOKABLE.map((p) => (
                  <option key={p.id} value={p.id}>
                    {procedureText(t, p).title}
                  </option>
                ))}
              </SelectField>
            </>
          )}

          {step === 2 && (
            <>
              {heading(t.booking.office.title)}
              {urlOfficeRejected && <Alert tone="warning">{fmt(t.booking.office.notOffered, { office: urlOffice.name })}</Alert>}
              <ChoiceCards
                name="booking-office"
                legend={t.booking.office.legend}
                columns={1}
                choices={offices.map((o) => ({ value: o.id, label: o.name, description: o.address }))}
                value={officeId || null}
                onChange={chooseOffice}
                error={errorFor('booking-office')}
              />
            </>
          )}

          {step === 3 && (
            <>
              {heading(t.booking.slot.title)}
              {days.length === 0 ? (
                <Alert tone="warning">{t.booking.slot.none}</Alert>
              ) : (
                <>
                  <SelectField
                    id="booking-date"
                    label={t.booking.slot.dateLabel}
                    hint={t.booking.slot.dateHint}
                    value={currentDay}
                    onChange={(e) => {
                      setDay(e.target.value)
                      setSlot('')
                    }}
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {longDay(d)}
                      </option>
                    ))}
                  </SelectField>
                  <ChoiceCards
                    name="booking-slot"
                    legend={`${t.booking.slot.slotLegend} — ${longDay(currentDay)}`}
                    columns={3}
                    choices={slots.map((s) => ({ value: s, label: s }))}
                    value={slot || null}
                    onChange={setSlot}
                    error={errorFor('booking-slot')}
                  />
                </>
              )}
            </>
          )}

          {step === 4 && (
            <>
              {heading(t.booking.contact.title)}
              <Alert>{t.booking.contact.sample}</Alert>
              <TextField
                id="booking-name"
                label={t.common.form.fullName}
                autoComplete="name"
                error={errorFor('booking-name')}
                value={contact.fullName}
                onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
              />
              <TextField
                id="booking-cin"
                label={t.common.form.cin}
                hint={t.common.form.cinHint}
                autoComplete="off"
                spellCheck={false}
                dir="ltr"
                className="uppercase"
                error={errorFor('booking-cin')}
                value={contact.cin}
                onChange={(e) => setContact({ ...contact, cin: e.target.value })}
              />
              <TextField
                id="booking-phone"
                type="tel"
                label={t.common.form.phone}
                hint={t.common.form.phoneHint}
                autoComplete="tel"
                dir="ltr"
                error={errorFor('booking-phone')}
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              />
            </>
          )}

          {step === 5 && procedure && office && (
            <>
              {heading(t.booking.review.title)}
              <dl className="divide-y divide-line rounded-md border border-line bg-white">
                <ReviewRow label={t.booking.review.procedure} onEdit={() => goTo(1)}>
                  {procedureText(t, procedure).title}
                </ReviewRow>
                <ReviewRow label={t.booking.review.office} onEdit={() => goTo(2)}>
                  {office.name}
                  <span className="block text-sm text-ink-soft">{office.address}</span>
                </ReviewRow>
                <ReviewRow label={t.booking.review.when} onEdit={() => goTo(3)}>
                  {fmt(t.booking.when, { date: longDay(currentDay), slot })}
                </ReviewRow>
                <ReviewRow label={t.booking.review.contact} onEdit={() => goTo(4)}>
                  {contact.fullName}
                  <span className="block text-sm text-ink-soft">
                    <span className="ref">{contact.cin.toUpperCase()}</span> · <span className="ref">{formatPhone(contact.phone)}</span>
                  </span>
                </ReviewRow>
              </dl>
            </>
          )}

          {actions(step === 5 ? t.booking.review.confirm : t.common.actions.continue)}
        </form>
      </PageBody>
    </>
  )
}

function ReviewRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <div className="p-4">
      <dt className="text-sm font-semibold text-ink-soft">{label}</dt>
      <dd className="mt-0.5 flex flex-wrap items-start justify-between gap-3">
        <span className="text-ink">{children}</span>
        <Button variant="ghost" onClick={onEdit} className="shrink-0">
          {t.common.actions.edit}{' '}
          <span className="sr-only">— {label}</span>
        </Button>
      </dd>
    </div>
  )
}

function Confirmation({
  appointment,
  headingRef,
}: {
  appointment: Appointment
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  const { t, date } = useI18n()
  const procedure = getProcedure(appointment.procedureId)
  const office = getOffice(appointment.officeId)
  return (
    <>
      <PageHeader title={t.booking.title} />
      <PageBody narrow>
        <div className="rounded-md border border-line bg-white p-6">
          <h2 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 text-2xl font-bold text-success-700 focus:outline-none">
            <CircleCheck className="size-7" aria-hidden="true" />
            {t.booking.done.title}
          </h2>
          <p className="mt-4 font-semibold text-ink">{t.booking.done.refLabel}</p>
          <p className="ref mt-1 text-3xl font-bold text-ink">{appointment.ref}</p>
          <p className="mt-1 text-sm text-ink-soft">{t.booking.done.refHint}</p>

          <dl className="mt-6 space-y-4">
            <div>
              <dt className="font-semibold text-ink">{t.booking.review.when}</dt>
              <dd className="text-ink">
                {fmt(t.booking.when, { date: date(dayToDate(appointment.date).toISOString(), 'dayLong'), slot: appointment.slot })}
              </dd>
            </div>
            {office && (
              <div>
                <dt className="font-semibold text-ink">{t.booking.review.office}</dt>
                <dd className="text-ink">
                  {office.name}
                  <span className="block text-sm text-ink-soft">{office.address}</span>
                </dd>
              </div>
            )}
            {procedure && (
              <div>
                <dt className="font-semibold text-ink">{t.booking.done.bring}</dt>
                <dd>
                  <p className="text-ink">{procedureText(t, procedure).title}</p>
                  <ul className="mt-1 list-disc space-y-1 ps-5 text-ink">
                    {documentLabels(t, procedure).map((d) => (
                      <li key={d.key}>{d.label}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-6 font-semibold text-ink">{t.booking.done.arrive}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to={`/suivi/${appointment.ref}`}>{t.booking.done.track}</ButtonLink>
            <Link to="/" className="self-center font-semibold text-brand-700 underline underline-offset-2">
              {t.common.actions.backHome}
            </Link>
          </div>
        </div>
      </PageBody>
    </>
  )
}
