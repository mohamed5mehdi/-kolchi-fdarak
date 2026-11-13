import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { resetAppointments } from '../../state/appointments'
import { resetReports } from '../../state/reports'
import { Alert } from '../../ui/Alert'
import { Button } from '../../ui/Button'
import { PageBody, PageHeader } from '../../ui/PageHeader'

export function AboutPage() {
  const { t } = useI18n()
  const [cleared, setCleared] = useState(false)

  return (
    <>
      <PageHeader title={t.about.title} lead={t.about.intro} />
      <PageBody narrow>
        <div className="space-y-8 text-ink">
          <section>
            <h2 className="text-xl font-bold">{t.about.notAffiliatedTitle}</h2>
            <p className="mt-2">{t.about.notAffiliated}</p>
            <p className="mt-2 font-semibold">{t.about.emergency}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">{t.about.goalsTitle}</h2>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              <li>{t.about.goals.one}</li>
              <li>{t.about.goals.two}</li>
              <li>{t.about.goals.three}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold">{t.about.techTitle}</h2>
            <p className="mt-2">{t.about.tech}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">{t.about.privacyTitle}</h2>
            <p className="mt-2">{t.about.privacy}</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                resetReports()
                resetAppointments()
                setCleared(true)
              }}
            >
              {t.about.clear}
            </Button>
            <div aria-live="polite" className="mt-4">
              {cleared && <Alert tone="success">{t.about.cleared}</Alert>}
            </div>
          </section>
        </div>
      </PageBody>
    </>
  )
}
