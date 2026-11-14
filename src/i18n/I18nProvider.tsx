import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fr } from './locales/fr'
import { LANGS, type Dict, type Lang, type LangMeta } from './types'
import { readJson, writeJson } from '../lib/storage'

// Seul le français (langue par défaut) est dans le bundle principal ; les autres langues sont chargées à la demande.
const DICTS: Partial<Record<Lang, Dict>> = { fr }
const LOADERS: Record<Exclude<Lang, 'fr'>, () => Promise<Dict>> = {
  ar: () => import('./locales/ar').then((m) => m.ar),
  darija: () => import('./locales/darija').then((m) => m.darija),
  en: () => import('./locales/en').then((m) => m.en),
}

/** Charge le dictionnaire d'une langue (une seule fois). */
// eslint-disable-next-line react-refresh/only-export-components
export function loadLang(lang: Lang): Promise<Dict> {
  const ready = DICTS[lang]
  if (ready) return Promise.resolve(ready)
  return LOADERS[lang as Exclude<Lang, 'fr'>]().then((dict) => (DICTS[lang] = dict))
}
const STORAGE_KEY = 'lang'

interface I18nValue {
  lang: Lang
  meta: LangMeta
  rtl: boolean
  t: Dict
  setLang: (lang: Lang) => void
  /** Date seule (« 12 nov. 2026 ») ou date et heure. */
  date: (iso: string, style?: 'day' | 'dayLong' | 'dateTime') => string
}

const I18nContext = createContext<I18nValue | null>(null)

/** Remplace les {variables} d'un texte traduit. */
// eslint-disable-next-line react-refresh/only-export-components
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}

/** Langue enregistrée, ou français si elle est absente ou inconnue. */
// eslint-disable-next-line react-refresh/only-export-components
export function storedLang(): Lang {
  const stored = readJson<string>(STORAGE_KEY, 'fr')
  return LANGS.some((l) => l.code === stored) ? (stored as Lang) : 'fr'
}

const DATE_STYLES: Record<'day' | 'dayLong' | 'dateTime', Intl.DateTimeFormatOptions> = {
  day: { day: 'numeric', month: 'short', year: 'numeric' },
  dayLong: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  dateTime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
}

export function I18nProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  // `lang` est la langue affichée : elle ne change qu'une fois son dictionnaire chargé,
  // pour ne jamais montrer un texte français dans une page en arabe (ou l'inverse).
  const [requested] = useState<Lang>(() => initialLang ?? storedLang())
  const [lang, setLangState] = useState<Lang>(() => (DICTS[requested] ? requested : 'fr'))

  useEffect(() => {
    if (!DICTS[requested]) loadLang(requested).then(() => setLangState(requested), () => {})
  }, [requested])
  const meta = LANGS.find((l) => l.code === lang) ?? LANGS[0]

  useEffect(() => {
    document.documentElement.lang = meta.htmlLang
    document.documentElement.dir = meta.dir
  }, [meta])

  const setLang = useCallback((next: Lang) => {
    writeJson(STORAGE_KEY, next)
    // En cas d'échec de chargement (réseau), on reste dans la langue actuelle.
    loadLang(next).then(() => setLangState(next), () => {})
  }, [])

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      meta,
      rtl: meta.dir === 'rtl',
      t: DICTS[lang] ?? fr,
      setLang,
      date: (iso, style = 'day') =>
        new Intl.DateTimeFormat(meta.locale, { numberingSystem: 'latn', ...DATE_STYLES[style] }).format(
          new Date(iso),
        ),
    }),
    [lang, meta, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n doit être utilisé dans <I18nProvider>')
  return ctx
}
