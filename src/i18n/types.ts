import type { fr } from './locales/fr'

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }

/** Forme d'un dictionnaire complet, dérivée du français (langue source). */
export type Dict = Widen<typeof fr>

export type Lang = 'fr' | 'ar' | 'darija' | 'en'

export interface LangMeta {
  code: Lang
  /** Nom de la langue dans sa propre écriture. */
  label: string
  /** Valeur de l'attribut lang du document. */
  htmlLang: string
  dir: 'ltr' | 'rtl'
  /** Locale utilisée pour les dates et les nombres. */
  locale: string
}

export const LANGS: LangMeta[] = [
  { code: 'fr', label: 'Français', htmlLang: 'fr', dir: 'ltr', locale: 'fr-MA' },
  { code: 'ar', label: 'العربية', htmlLang: 'ar', dir: 'rtl', locale: 'ar-MA' },
  // Darija en écriture latine : sens LTR, formats marocains francophones.
  { code: 'darija', label: 'Darija', htmlLang: 'ary-Latn', dir: 'ltr', locale: 'fr-MA' },
  { code: 'en', label: 'English', htmlLang: 'en', dir: 'ltr', locale: 'en-GB' },
]
