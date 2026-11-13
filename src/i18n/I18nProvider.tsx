import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ar } from './locales/ar'
import { darija } from './locales/darija'
import { en } from './locales/en'
import { fr } from './locales/fr'
import { LANGS, type Dict, type Lang, type LangMeta } from './types'
import { readJson, writeJson } from '../lib/storage'

const DICTS: Record<Lang, Dict> = { fr, ar, darija, en }
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

function storedLang(): Lang {
  const stored = readJson<string>(STORAGE_KEY, 'fr')
  return stored in DICTS ? (stored as Lang) : 'fr'
}

const DATE_STYLES: Record<'day' | 'dayLong' | 'dateTime', Intl.DateTimeFormatOptions> = {
  day: { day: 'numeric', month: 'short', year: 'numeric' },
  dayLong: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  dateTime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
}

export function I18nProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(() => initialLang ?? storedLang())
  const meta = LANGS.find((l) => l.code === lang) ?? LANGS[0]

  useEffect(() => {
    document.documentElement.lang = meta.htmlLang
    document.documentElement.dir = meta.dir
  }, [meta])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    writeJson(STORAGE_KEY, next)
  }, [])

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      meta,
      rtl: meta.dir === 'rtl',
      t: DICTS[lang],
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
