import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useI18n } from '../i18n/I18nProvider'

interface FieldShellProps {
  id: string
  label: string
  hint?: string
  error?: string
  /** Affiche « (facultatif) » après le libellé. Les champs sont obligatoires par défaut. */
  optional?: boolean
  children: (aria: { 'aria-describedby'?: string; 'aria-invalid'?: true }) => ReactNode
}

const CONTROL =
  'block w-full rounded-md border border-line-strong bg-white px-3 py-2.5 text-base text-ink placeholder:text-ink-soft aria-[invalid=true]:border-danger-700 aria-[invalid=true]:border-2'

/** Libellé, aide et message d'erreur reliés au champ par aria-describedby. */
function FieldShell({ id, label, hint, error, optional, children }: FieldShellProps) {
  const { t } = useI18n()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-ink-soft"> ({t.common.form.optional})</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-semibold text-danger-700">
          {error}
        </p>
      )}
      {children({ 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
    </div>
  )
}

type Common = Omit<FieldShellProps, 'children'>

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  className = '',
  ...input
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      {(aria) => <input id={id} className={`${CONTROL} ${className}`} required={!optional} {...aria} {...input} />}
    </FieldShell>
  )
}

export function TextArea({
  id,
  label,
  hint,
  error,
  optional,
  className = '',
  ...input
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      {(aria) => (
        <textarea id={id} rows={4} className={`${CONTROL} ${className}`} required={!optional} {...aria} {...input} />
      )}
    </FieldShell>
  )
}

export function SelectField({
  id,
  label,
  hint,
  error,
  optional,
  className = '',
  children,
  ...select
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      {(aria) => (
        <select id={id} className={`${CONTROL} ${className}`} required={!optional} {...aria} {...select}>
          {children}
        </select>
      )}
    </FieldShell>
  )
}
