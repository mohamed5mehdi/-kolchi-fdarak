import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'

export interface FieldError {
  /** id du champ concerné, pour que le lien y place le focus. */
  field: string
  message: string
}

/**
 * Récapitulatif des erreurs affiché en tête de formulaire après une tentative d'envoi.
 * Reçoit le focus à chaque nouvelle tentative pour être annoncé par les lecteurs d'écran.
 */
export function ErrorSummary({ errors, attempt }: { errors: FieldError[]; attempt: number }) {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (errors.length > 0) ref.current?.focus()
    // Uniquement à chaque tentative : ne pas voler le focus pendant la saisie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  if (errors.length === 0) return null
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-md border-2 border-danger-700 bg-danger-50 p-4 focus:outline-none"
    >
      <p className="font-semibold text-danger-700">{t.common.form.errorSummary}</p>
      <ul className="mt-2 list-disc space-y-1 ps-5">
        {errors.map((e) => (
          <li key={e.field}>
            <a
              href={`#${e.field}`}
              className="text-danger-700 underline"
              onClick={(ev) => {
                ev.preventDefault()
                document.getElementById(e.field)?.focus()
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
