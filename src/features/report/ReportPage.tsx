import { useI18n } from '../../i18n/I18nProvider'
import { PageHeader } from '../../ui/PageHeader'

// Écran provisoire, remplacé par l'implémentation du module.
export function ReportPage() {
  const { t } = useI18n()
  return <PageHeader title={t.report.title} lead={t.report.lead} />
}