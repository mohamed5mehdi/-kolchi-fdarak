import { fmt, useI18n } from '../i18n/I18nProvider'

/** Indicateur d'étapes : texte lisible + barre de progression décorative. */
export function Stepper({ current, steps }: { current: number; steps: string[] }) {
  const { t } = useI18n()
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-ink-soft">
        {fmt(t.common.steps.label, { current, total: steps.length })}
        <span className="text-ink"> — {steps[current - 1]}</span>
      </p>
      <ol className="mt-2 flex gap-1.5" aria-hidden="true">
        {steps.map((s, i) => (
          <li key={s} className={`h-1.5 flex-1 rounded-full ${i < current ? 'bg-brand-700' : 'bg-line'}`} />
        ))}
      </ol>
    </div>
  )
}
