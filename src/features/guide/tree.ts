import type { ProcedureId } from '../services/procedures'

export type QuestionId = 'start' | 'civil' | 'civilCopy' | 'certify'

/** Issue d'une réponse : une autre question, une démarche du catalogue ou une page du portail. */
export type Target =
  | { question: QuestionId }
  | { procedure: ProcedureId }
  | { page: 'report' | 'offices' }

export type Outcome = Exclude<Target, { question: QuestionId }>

export interface Question {
  id: QuestionId
  /** Clé de réponse (texte dans guide.questions.<id>.options) → suite du parcours. */
  options: Record<string, Target>
}

export const START: QuestionId = 'start'

export const QUESTIONS: Record<QuestionId, Question> = {
  start: {
    id: 'start',
    options: {
      report: { page: 'report' },
      civil: { question: 'civil' },
      certify: { question: 'certify' },
      works: { procedure: 'minor-works' },
      address: { procedure: 'residence-certificate' },
      other: { page: 'offices' },
    },
  },
  civil: {
    id: 'civil',
    options: {
      self: { question: 'civilCopy' },
      child: { question: 'civilCopy' },
      declare: { procedure: 'birth-declaration' },
    },
  },
  civilCopy: {
    id: 'civilCopy',
    options: {
      full: { procedure: 'birth-certificate' },
      extract: { procedure: 'birth-extract' },
    },
  },
  certify: {
    id: 'certify',
    options: {
      signature: { procedure: 'signature-legalisation' },
      copy: { procedure: 'certified-copy' },
      situation: { procedure: 'administrative-certificate' },
    },
  },
}

export const PAGE_LINKS: Record<'report' | 'offices', string> = {
  report: '/signaler',
  offices: '/guichets',
}

export interface Step {
  question: QuestionId
  answer: string
}

export type Position = { kind: 'question'; question: QuestionId } | { kind: 'result'; outcome: Outcome }

/**
 * Rejoue les réponses depuis la première question.
 * Une réponse inconnue arrête le parcours sur la question où elle a été donnée.
 */
export function resolve(answers: string[]): { position: Position; steps: Step[] } {
  let current: QuestionId = START
  const steps: Step[] = []
  for (const answer of answers) {
    const target: Target | undefined = QUESTIONS[current].options[answer]
    if (!target) break
    steps.push({ question: current, answer })
    if ('question' in target) current = target.question
    else return { position: { kind: 'result', outcome: target }, steps }
  }
  return { position: { kind: 'question', question: current }, steps }
}

/** Tous les parcours possibles jusqu'à un résultat (pour les tests et la vérification de l'arbre). */
export function allPaths(from: QuestionId = START, prefix: string[] = []): { answers: string[]; outcome: Outcome }[] {
  return Object.entries(QUESTIONS[from].options).flatMap(([answer, target]) =>
    'question' in target
      ? allPaths(target.question, [...prefix, answer])
      : [{ answers: [...prefix, answer], outcome: target as Outcome }],
  )
}
