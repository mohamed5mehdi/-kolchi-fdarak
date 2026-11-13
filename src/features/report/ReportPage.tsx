import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import type { DistrictId, LatLng, Report, ReportCategory } from '../../data/types'
import { useI18n } from '../../i18n/I18nProvider'
import { submitReport } from '../../state/reports'
import { Button } from '../../ui/Button'
import { ErrorSummary, type FieldError } from '../../ui/ErrorSummary'
import { PageBody, PageHeader } from '../../ui/PageHeader'
import { Stepper } from '../../ui/Stepper'
import { CategoryStep } from './CategoryStep'
import { DetailsStep } from './DetailsStep'
import { emptyDraft, errorFor, validateStep, type Draft, type Step } from './draft'
import { LocationStep } from './LocationStep'
import { ReportConfirmation } from './ReportConfirmation'
import { ReviewStep } from './ReviewStep'

export function ReportPage() {
  const { t } = useI18n()
  const [step, setStep] = useState<Step>(1)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [errors, setErrors] = useState<FieldError[]>([])
  const [attempt, setAttempt] = useState(0)
  // Étape ouverte depuis le récapitulatif : « Continuer » y ramène directement.
  const [editing, setEditing] = useState(false)
  const [done, setDone] = useState<Report | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  // Pas de vol de focus au chargement de la page, seulement après un changement d'étape.
  const moved = useRef(false)

  useEffect(() => {
    if (moved.current) headingRef.current?.focus()
  }, [step, done])

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  function goTo(next: Step) {
    moved.current = true
    setErrors([])
    setStep(next)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (step === 4) {
      const report = submitReport({
        category: draft.category as ReportCategory,
        district: draft.district as DistrictId,
        street: draft.street,
        position: draft.position as LatLng,
        description: draft.description,
        contact: { fullName: draft.fullName, cin: draft.cin, phone: draft.phone },
      })
      setDone(report)
      return
    }
    const found = validateStep(step, draft, t)
    setErrors(found)
    setAttempt((a) => a + 1)
    if (found.length > 0) return
    if (editing) {
      setEditing(false)
      goTo(4)
    } else {
      goTo((step + 1) as Step)
    }
  }

  function edit(target: Step) {
    setEditing(true)
    goTo(target)
  }

  function back() {
    setEditing(false)
    goTo((step - 1) as Step)
  }

  function restart() {
    setDraft(emptyDraft())
    setEditing(false)
    setDone(null)
    goTo(1)
  }

  const labels = [t.report.steps.category, t.report.steps.location, t.report.steps.details, t.report.steps.review]
  const headings = [
    t.report.category.heading,
    t.report.location.heading,
    t.report.details.heading,
    t.report.review.heading,
  ]

  return (
    <>
      <PageHeader title={t.report.title} lead={t.report.lead} />
      <PageBody narrow>
        {done ? (
          <ReportConfirmation report={done} onRestart={restart} />
        ) : (
          <form noValidate onSubmit={submit}>
            <Stepper current={step} steps={labels} />
            <h2 ref={headingRef} tabIndex={-1} className="mb-6 text-2xl font-bold text-ink focus:outline-none">
              {headings[step - 1]}
            </h2>
            <div className="mb-6 empty:hidden">
              <ErrorSummary errors={errors} attempt={attempt} />
            </div>

            {step === 1 && (
              <CategoryStep
                value={draft.category}
                onChange={(category) => update({ category })}
                error={errorFor(errors, 'report-category')}
              />
            )}
            {step === 2 && <LocationStep draft={draft} update={update} errors={errors} />}
            {step === 3 && <DetailsStep draft={draft} update={update} errors={errors} />}
            {step === 4 && <ReviewStep draft={draft} onEdit={edit} />}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <Button type="submit">
                {step === 4 ? (
                  <>
                    <Send className="size-4" aria-hidden="true" />
                    {t.report.review.submit}
                  </>
                ) : (
                  <>
                    {t.common.actions.continue}
                    <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                  </>
                )}
              </Button>
              {step > 1 && (
                <Button variant="ghost" onClick={back}>
                  <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                  {t.common.actions.back}
                </Button>
              )}
            </div>
          </form>
        )}
      </PageBody>
    </>
  )
}
