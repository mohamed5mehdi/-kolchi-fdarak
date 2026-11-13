import { Construction, Droplets, Lightbulb, Trash2, Trees } from 'lucide-react'
import type { ReportCategory } from '../../data/types'
import { useI18n } from '../../i18n/I18nProvider'
import { ChoiceCards } from '../../ui/ChoiceCards'
import { CATEGORIES } from './draft'

const ICONS: Record<ReportCategory, typeof Construction> = {
  road: Construction,
  lighting: Lightbulb,
  cleanliness: Trash2,
  green: Trees,
  water: Droplets,
}

export function CategoryStep({
  value,
  onChange,
  error,
}: {
  value: ReportCategory | null
  onChange: (value: ReportCategory) => void
  error?: string
}) {
  const { t } = useI18n()
  return (
    <ChoiceCards
      name="report-category"
      legend={t.report.category.legend}
      value={value}
      onChange={onChange}
      error={error}
      choices={CATEGORIES.map((c) => {
        const Icon = ICONS[c]
        return {
          value: c,
          label: t.common.categories[c],
          description: t.report.category.descriptions[c],
          icon: <Icon className="size-5" />,
        }
      })}
    />
  )
}
