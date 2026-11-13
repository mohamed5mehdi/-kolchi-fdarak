import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { App } from '../app/App'
import { I18nProvider } from '../i18n/I18nProvider'
import type { Lang } from '../i18n/types'

/** Monte l'application complète sur une route donnée. */
export function renderApp(route = '/', { lang = 'fr' }: { lang?: Lang } = {}) {
  const user = userEvent.setup()
  const utils = render(
    <I18nProvider initialLang={lang}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </I18nProvider>,
  )
  return { user, ...utils }
}
