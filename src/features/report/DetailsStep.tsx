import { fmt, useI18n } from '../../i18n/I18nProvider'
import type { FieldError } from '../../ui/ErrorSummary'
import { TextArea, TextField } from '../../ui/Field'
import { DESCRIPTION_MAX, errorFor, type Draft } from './draft'

export function DetailsStep({
  draft,
  update,
  errors,
}: {
  draft: Draft
  update: (patch: Partial<Draft>) => void
  errors: FieldError[]
}) {
  const { t } = useI18n()
  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <TextArea
          id="report-description"
          label={t.report.details.description}
          hint={t.report.details.descriptionHint}
          error={errorFor(errors, 'report-description')}
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          maxLength={DESCRIPTION_MAX}
          rows={5}
        />
        <p className="text-sm text-ink-soft" aria-live="polite">
          {fmt(t.report.details.counter, { count: draft.description.length, max: DESCRIPTION_MAX })}
        </p>
      </div>

      <fieldset className="space-y-5" aria-describedby="report-contact-hint">
        <legend className="text-lg font-semibold text-ink">{t.report.details.contactTitle}</legend>
        <p id="report-contact-hint" className="text-sm text-ink-soft">
          {t.report.details.contactHint}
        </p>
        <TextField
          id="report-name"
          label={t.common.form.fullName}
          error={errorFor(errors, 'report-name')}
          value={draft.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          autoComplete="name"
        />
        <TextField
          id="report-cin"
          label={t.common.form.cin}
          hint={t.common.form.cinHint}
          error={errorFor(errors, 'report-cin')}
          value={draft.cin}
          onChange={(e) => update({ cin: e.target.value })}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          className="ref max-w-xs uppercase"
        />
        <TextField
          id="report-phone"
          type="tel"
          label={t.common.form.phone}
          hint={t.common.form.phoneHint}
          error={errorFor(errors, 'report-phone')}
          value={draft.phone}
          onChange={(e) => update({ phone: e.target.value })}
          autoComplete="tel"
          inputMode="tel"
          dir="ltr"
          className="ref max-w-xs"
        />
      </fieldset>
    </div>
  )
}
