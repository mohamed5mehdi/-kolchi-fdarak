import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { districtName, getDistrict } from '../../data/districts'
import { useI18n } from '../../i18n/I18nProvider'
import { formatPhone, normalizeCin } from '../../lib/validation'
import type { Draft, Step } from './draft'

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <section className="rounded-md border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 font-semibold text-brand-700 underline underline-offset-2 hover:no-underline"
        >
          <Pencil className="size-4" aria-hidden="true" />
          {t.common.actions.edit}
          <span className="sr-only"> : {title}</span>
        </button>
      </div>
      <dl className="mt-3 grid gap-3 sm:grid-cols-[12rem_1fr]">{children}</dl>
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-sm font-semibold text-ink-soft">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </>
  )
}

export function ReviewStep({ draft, onEdit }: { draft: Draft; onEdit: (step: Step) => void }) {
  const { t, rtl } = useI18n()
  return (
    <div className="space-y-4">
      <p className="text-ink-soft">{t.report.review.lead}</p>
      <Section title={t.report.review.problem} onEdit={() => onEdit(1)}>
        <Row label={t.report.review.category}>{draft.category && t.common.categories[draft.category]}</Row>
      </Section>
      <Section title={t.report.review.location} onEdit={() => onEdit(2)}>
        <Row label={t.report.review.district}>{draft.district && districtName(getDistrict(draft.district), rtl)}</Row>
        <Row label={t.report.review.street}>{draft.street.trim()}</Row>
        {draft.position && (
          <Row label={t.report.review.position}>
            <span className="ref">{draft.position.map((n) => n.toFixed(5)).join(', ')}</span>
          </Row>
        )}
      </Section>
      <Section title={t.report.review.description} onEdit={() => onEdit(3)}>
        <Row label={t.report.review.description}>
          <span className="whitespace-pre-line">{draft.description.trim()}</span>
        </Row>
      </Section>
      <Section title={t.report.review.contact} onEdit={() => onEdit(3)}>
        <Row label={t.common.form.fullName}>{draft.fullName.trim()}</Row>
        <Row label={t.common.form.cin}>
          <span className="ref">{normalizeCin(draft.cin)}</span>
        </Row>
        <Row label={t.common.form.phone}>
          <span className="ref">{formatPhone(draft.phone)}</span>
        </Row>
      </Section>
    </div>
  )
}
