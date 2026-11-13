import { describe, expect, it } from 'vitest'
import { fmt } from './I18nProvider'
import { ar } from './locales/ar'
import { darija } from './locales/darija'
import { en } from './locales/en'
import { fr } from './locales/fr'

type Tree = { [key: string]: unknown }

/** Aplatit un dictionnaire en { 'module.section.cle': valeur }. */
function flatten(tree: Tree, prefix = ''): Map<string, unknown> {
  const out = new Map<string, unknown>()
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object') {
      for (const [k, v] of flatten(value as Tree, path)) out.set(k, v)
    } else {
      out.set(path, value)
    }
  }
  return out
}

const placeholders = (s: string) => new Set(s.match(/\{\w+\}/g) ?? [])

const source = flatten(fr)
const translations: Record<string, Map<string, unknown>> = { ar: flatten(ar), darija: flatten(darija), en: flatten(en) }
const all: Record<string, Map<string, unknown>> = { fr: source, ...translations }

describe('dictionnaires', () => {
  it.each(Object.keys(translations))('%s a exactement les mêmes clés que fr', (lang) => {
    expect([...translations[lang].keys()].sort()).toEqual([...source.keys()].sort())
  })

  it.each(Object.keys(all))('%s ne contient que des chaînes non vides', (lang) => {
    const bad = [...all[lang]].filter(([, v]) => typeof v !== 'string' || v.trim() === '').map(([k]) => k)
    expect(bad).toEqual([])
  })

  it.each(Object.keys(translations))('%s conserve chaque {variable} présente en fr', (lang) => {
    const missing: string[] = []
    for (const [key, value] of source) {
      const translated = String(translations[lang].get(key) ?? '')
      for (const ph of placeholders(String(value))) if (!translated.includes(ph)) missing.push(`${key} ${ph}`)
    }
    expect(missing).toEqual([])
  })

  it("l'arabe n'est pas une copie du français", () => {
    const same = [...flatten(ar)].filter(([k, v]) => v === source.get(k) && !/\{year\}|kolchi-fdarak/.test(String(v)))
    expect(same.map(([k]) => k)).toEqual([])
  })
})

describe('fmt', () => {
  it('remplace les variables connues et laisse les autres', () => {
    expect(fmt('Étape {current} sur {total}', { current: 2, total: 4 })).toBe('Étape 2 sur 4')
    expect(fmt('{a} {b}', { a: 0 })).toBe('0 {b}')
  })
})
