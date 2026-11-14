import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { resetAppointments } from '../../state/appointments'
import { resetReports } from '../../state/reports'
import { Alert } from '../../ui/Alert'
import { Button } from '../../ui/Button'
import { PageBody, PageHeader } from '../../ui/PageHeader'

type ClearState = 'idle' | 'confirming' | 'cleared' | 'failed'

export function AboutPage() {
  const { t } = useI18n()
  const [state, setState] = useState<ClearState>('idle')
  const actionsRef = useRef<HTMLDivElement>(null)
  const wasConfirming = useRef(false)

  // Le bouton cliqué disparaît à chaque étape : le focus est replacé sur le premier bouton affiché.
  useEffect(() => {
    if (state === 'confirming' || wasConfirming.current) actionsRef.current?.querySelector('button')?.focus()
    wasConfirming.current = state === 'confirming'
  }, [state])

  // Suppression en deux temps (WCAG 3.3.4) : seul le clic sur « Confirmer la suppression » efface.
  function confirmClear() {
    // Les deux effacements sont tentés même si le premier échoue.
    const reports = resetReports()
    const appointments = resetAppointments()
    setState(reports && appointments ? 'cleared' : 'failed')
  }

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
            <div ref={actionsRef} className="mt-4 flex flex-wrap gap-3">
              {state === 'confirming' ? (
                <>
                  <Button onClick={confirmClear}>{t.about.confirmClear}</Button>
                  <Button variant="secondary" onClick={() => setState('idle')}>
                    {t.common.actions.cancel}
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setState('confirming')}>
                  {t.about.clear}
                </Button>
              )}
            </div>
            <div aria-live="polite" className="mt-4">
              {state === 'confirming' && <p>{t.about.confirmPrompt}</p>}
              {state === 'cleared' && <Alert tone="success">{t.about.cleared}</Alert>}
              {state === 'failed' && <Alert tone="warning">{t.about.clearFailed}</Alert>}
            </div>
          </section>
        </div>
      </PageBody>
    </>
  )
}
