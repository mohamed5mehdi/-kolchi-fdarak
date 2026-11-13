import type { ReportStatus } from '../data/types'
import { useI18n } from '../i18n/I18nProvider'

const TONES: Record<ReportStatus, string> = {
  received: 'bg-brand-100 text-brand-800',
  assigned: 'bg-brand-100 text-brand-800',
  scheduled: 'bg-warning-50 text-warning-700',
  resolved: 'bg-success-50 text-success-700',
  closed: 'bg-line text-ink-soft',
}

/** Statut d'un dossier : couleur + libellé (jamais la couleur seule). */
export function StatusBadge({ status }: { status: ReportStatus }) {
  const { t } = useI18n()
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold ${TONES[status]}`}>
      <span className="size-2 rounded-full bg-current" aria-hidden="true" />
      {t.common.status[status]}
    </span>
  )
}
