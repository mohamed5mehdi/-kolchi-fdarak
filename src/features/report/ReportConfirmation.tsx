import { useEffect, useRef, useState } from 'react'
import { CircleCheck, Copy, Search } from 'lucide-react'
import type { Report } from '../../data/types'
import { fmt, useI18n } from '../../i18n/I18nProvider'
import { Alert } from '../../ui/Alert'
import { Button, ButtonLink } from '../../ui/Button'

export function ReportConfirmation({ report, onRestart }: { report: Report; onRestart: () => void }) {
  const { t } = useI18n()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(report.ref)
      setCopyMessage(t.common.actions.copied)
    } catch {
      setCopyMessage(t.report.done.copyFailed)
    }
  }

  const steps = [t.report.done.next1, t.report.done.next2, fmt(t.report.done.next3, { ref: report.ref })]

  return (
    <div className="space-y-8">
      <section className="rounded-md border-2 border-success-700 bg-success-50 p-6">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="flex items-center gap-2 text-2xl font-bold text-ink focus:outline-none"
        >
          <CircleCheck className="size-7 shrink-0 text-success-700" aria-hidden="true" />
          {t.report.done.title}
        </h2>
        <p className="mt-4 font-semibold text-ink">{t.report.done.refLabel}</p>
        <p className="ref mt-1 text-3xl font-bold text-ink sm:text-4xl">{report.ref}</p>
        <p className="mt-2 text-ink-soft">{t.report.done.refHint}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={copy}>
            <Copy className="size-4" aria-hidden="true" />
            {t.common.actions.copy}
          </Button>
          <p role="status" className="text-sm font-semibold text-success-700">
            {copyMessage}
          </p>
        </div>
      </section>

      <section aria-labelledby="report-next-title">
        <h2 id="report-next-title" className="text-xl font-bold text-ink">
          {t.report.done.nextTitle}
        </h2>
        <ol className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white"
              >
                {i + 1}
              </span>
              <span className="pt-0.5 text-ink">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <Alert tone="warning" title={t.common.emergency.title}>
        {t.common.emergency.body}
      </Alert>

      <div className="flex flex-wrap gap-3">
        <ButtonLink to={`/suivi/${report.ref}`}>
          <Search className="size-4" aria-hidden="true" />
          {t.report.done.track}
        </ButtonLink>
        <Button variant="secondary" onClick={onRestart}>
          {t.report.done.another}
        </Button>
      </div>
    </div>
  )
}
