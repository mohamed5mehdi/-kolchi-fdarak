import { describe, expect, it } from 'vitest'
import { ar } from '../../i18n/locales/ar'
import { darija } from '../../i18n/locales/darija'
import { en } from '../../i18n/locales/en'
import { fr } from '../../i18n/locales/fr'
import { PROCEDURES, getProcedure } from '../../data/procedures'
import { QUESTIONS, allPaths, resolve, type QuestionId } from './tree'

describe("arbre d'orientation", () => {
  const paths = allPaths()

  it('aucune feuille ne pointe vers une démarche inconnue', () => {
    const unknown = paths.filter((p) => 'procedure' in p.outcome && !getProcedure(p.outcome.procedure))
    expect(unknown).toEqual([])
  })

  it('chaque démarche du catalogue est atteignable', () => {
    const reached = new Set(paths.flatMap((p) => ('procedure' in p.outcome ? [p.outcome.procedure] : [])))
    expect([...reached].sort()).toEqual(PROCEDURES.map((p) => p.id).sort())
  })

  it('au plus 3 questions par parcours', () => {
    expect(Math.max(...paths.map((p) => p.answers.length))).toBeLessThanOrEqual(3)
  })

  it('chaque question et chaque réponse a un texte dans les 4 langues', () => {
    const missing: string[] = []
    for (const dict of [fr, ar, darija, en]) {
      for (const [id, q] of Object.entries(QUESTIONS)) {
        const text = dict.guide.questions[id as QuestionId]
        if (!text?.title) missing.push(id)
        for (const key of Object.keys(q.options))
          if (!(text?.options as Record<string, string> | undefined)?.[key]) missing.push(`${id}.${key}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('rejoue un parcours et s’arrête sur une réponse inconnue', () => {
    expect(resolve([]).position).toEqual({ kind: 'question', question: 'start' })
    expect(resolve(['civil', 'self']).position).toEqual({ kind: 'question', question: 'civilCopy' })
    expect(resolve(['civil', 'self', 'extract']).position).toEqual({ kind: 'result', outcome: { procedure: 'birth-extract' } })
    expect(resolve(['report']).position).toEqual({ kind: 'result', outcome: { page: 'report' } })
    const broken = resolve(['civil', 'nimporte'])
    expect(broken.position).toEqual({ kind: 'question', question: 'civil' })
    expect(broken.steps).toHaveLength(1)
  })
})
