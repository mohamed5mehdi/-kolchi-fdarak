import { useEffect, useRef, useState, type FormEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import type { Dict } from '../../i18n/types'
import { Button, ButtonLink } from '../../ui/Button'
import { ChoiceCards } from '../../ui/ChoiceCards'
import { PageBody, PageHeader } from '../../ui/PageHeader'
import { getProcedure } from '../services/procedures'
import { procedureText } from '../services/text'
import { PAGE_LINKS, QUESTIONS, resolve, type Outcome, type QuestionId } from './tree'

function questionText(t: Dict, id: QuestionId) {
  const q = t.guide.questions[id]
  return { title: q.title, options: q.options as Record<string, string> }
}

function Result({ outcome }: { outcome: Outcome }) {
  const { t } = useI18n()
  const card = 'rounded-md border border-brand-700 bg-white p-5'

  if ('page' in outcome) {
    const text = t.guide.results[outcome.page]
    return (
      <div className={card}>
        <h3 className="text-xl font-semibold text-ink">{text.title}</h3>
        <p className="mt-2 text-ink">{text.body}</p>
        <ButtonLink to={PAGE_LINKS[outcome.page]} className="mt-4">
          {text.link}
        </ButtonLink>
      </div>
    )
  }

  const procedure = getProcedure(outcome.procedure)
  if (!procedure) return null
  const text = procedureText(t, procedure)
  return (
    <div className={card}>
      <h3 className="text-xl font-semibold text-ink">{text.title}</h3>
      <p className="mt-2 text-ink">{text.summary}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink to={`/demarches/${procedure.id}`}>{t.guide.seeDetail}</ButtonLink>
        {procedure.preparable && (
          <ButtonLink to={`/demarches/${procedure.id}/preparer`} variant="secondary">
            {t.guide.prepare}
          </ButtonLink>
        )}
        {procedure.bookable && (
          <ButtonLink to={`/rendez-vous?demarche=${procedure.id}`} variant="secondary">
            {t.guide.book}
          </ButtonLink>
        )}
      </div>
    </div>
  )
}

export function GuidePage() {
  const { t } = useI18n()
  const [answers, setAnswers] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const { position, steps } = resolve(answers)

  const resultRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    // La question suivante (ou le résultat) reçoit le focus pour être annoncée.
    if (position.kind === 'result') resultRef.current?.focus()
    else document.getElementById(`guide-${position.question}`)?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers.length])

  function answer(e: FormEvent) {
    e.preventDefault()
    if (!selected) {
      setError(true)
      return
    }
    setAnswers([...answers, selected])
    setSelected(null)
    setError(false)
  }

  function back() {
    setSelected(answers[answers.length - 1] ?? null)
    setAnswers(answers.slice(0, -1))
    setError(false)
  }

  function restart() {
    setAnswers([])
    setSelected(null)
    setError(false)
  }

  const nav = answers.length > 0 && (
    <div className="mt-6 flex flex-wrap gap-3">
      <Button variant="ghost" onClick={back}>
        {t.common.actions.back}
      </Button>
      <Button variant="ghost" onClick={restart}>
        <RotateCcw className="size-4" aria-hidden="true" />
        {t.guide.restart}
      </Button>
    </div>
  )

  return (
    <>
      <PageHeader title={t.guide.title} lead={t.guide.lead} />
      <PageBody narrow>
        {steps.length > 0 && (
          <section aria-labelledby="guide-answers" className="mb-6 rounded-md border border-line bg-white p-4">
            <h2 id="guide-answers" className="font-semibold text-ink">
              {t.guide.answersTitle}
            </h2>
            <ol className="mt-2 space-y-1 text-ink">
              {steps.map((s) => {
                const q = questionText(t, s.question)
                return (
                  <li key={s.question}>
                    <span className="text-ink-soft">{q.title}</span> {q.options[s.answer]}
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {position.kind === 'question' ? (
          <form noValidate onSubmit={answer}>
            <ChoiceCards
              name={`guide-${position.question}`}
              legend={questionText(t, position.question).title}
              columns={1}
              choices={Object.keys(QUESTIONS[position.question].options).map((key) => ({
                value: key,
                label: questionText(t, position.question).options[key],
              }))}
              value={selected}
              onChange={(v) => {
                setSelected(v)
                setError(false)
              }}
              error={error ? t.guide.chooseError : undefined}
            />
            <Button type="submit" className="mt-6">
              {t.common.actions.continue}
            </Button>
          </form>
        ) : (
          <section aria-labelledby="guide-result">
            <h2 id="guide-result" ref={resultRef} tabIndex={-1} className="mb-3 text-2xl font-bold text-ink focus:outline-none">
              {t.guide.resultTitle}
            </h2>
            <Result outcome={position.outcome} />
          </section>
        )}
        {nav}
      </PageBody>
    </>
  )
}
