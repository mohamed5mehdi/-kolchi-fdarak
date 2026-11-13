import { Globe } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { LANGS, type Lang } from '../i18n/types'

export function LanguagePicker() {
  const { t, lang, setLang } = useI18n()
  return (
    <div className="flex items-center gap-1.5 text-white">
      <Globe className="size-4" aria-hidden="true" />
      <label htmlFor="lang" className="sr-only">
        {t.common.language.label}
      </label>
      <select
        id="lang"
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="rounded-md border border-brand-600 bg-brand-800 px-2 py-1.5 text-sm text-white"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code} lang={l.htmlLang}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  )
}
