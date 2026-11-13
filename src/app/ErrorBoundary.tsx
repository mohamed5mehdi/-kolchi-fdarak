import { Component, type ReactNode } from 'react'
import { useI18n } from '../i18n/I18nProvider'

function ErrorScreen() {
  const { t } = useI18n()
  return (
    <div role="alert" className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold text-ink">{t.common.error.title}</h1>
      <p className="mt-3 text-ink-soft">{t.common.error.body}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 rounded-md bg-brand-700 px-5 py-2.5 font-semibold text-white hover:bg-brand-800"
      >
        {t.common.error.reload}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <ErrorScreen /> : this.props.children
  }
}
