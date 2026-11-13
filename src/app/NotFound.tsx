import { useI18n } from '../i18n/I18nProvider'
import { ButtonLink } from '../ui/Button'
import { PageBody } from '../ui/PageHeader'

export function NotFound() {
  const { t } = useI18n()
  return (
    <PageBody narrow>
      <h1 className="text-3xl font-bold text-ink">{t.common.notFound.title}</h1>
      <p className="mt-3 text-lg text-ink-soft">{t.common.notFound.body}</p>
      <ButtonLink to="/" className="mt-6">
        {t.common.actions.backHome}
      </ButtonLink>
    </PageBody>
  )
}
