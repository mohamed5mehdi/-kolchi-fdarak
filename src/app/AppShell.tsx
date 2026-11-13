import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { MapPin, Menu, X } from 'lucide-react'
import { LanguagePicker } from './LanguagePicker'
import { fmt, useI18n } from '../i18n/I18nProvider'

const NAV = [
  { to: '/signaler', key: 'report' },
  { to: '/suivi', key: 'tracking' },
  { to: '/demarches', key: 'services' },
  { to: '/rendez-vous', key: 'booking' },
  { to: '/guichets', key: 'offices' },
] as const

function Brand() {
  const { t } = useI18n()
  return (
    <Link to="/" className="flex items-center gap-2.5 text-white no-underline">
      <span className="grid size-9 place-items-center rounded-md bg-white text-brand-700" aria-hidden="true">
        <MapPin className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold">{t.common.brand.name}</span>
        <span className="block text-xs text-brand-100">{t.common.brand.tagline}</span>
      </span>
    </Link>
  )
}

export function AppShell() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)
  // Le menu mobile est ouvert pour une page donnée : il se referme de lui-même quand on change de page.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null)
  const menuOpen = menuOpenOn === pathname
  const setMenuOpen = (open: boolean) => setMenuOpenOn(open ? pathname : null)

  // À chaque changement de page : retour en haut et focus sur le contenu.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo?.(0, 0)
    mainRef.current?.focus()
  }, [pathname])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 font-medium ${isActive ? 'bg-brand-900 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-[1000] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-700"
      >
        {t.common.skipLink}
      </a>

      <header className="bg-brand-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <LanguagePicker />
            <button
              type="button"
              className="rounded-md p-2 text-white hover:bg-brand-800 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="main-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
              <span className="sr-only">{menuOpen ? t.common.nav.closeMenu : t.common.nav.menu}</span>
            </button>
          </div>
        </div>
        <nav
          id="main-nav"
          aria-label={t.common.nav.label}
          className={`border-t border-brand-600 ${menuOpen ? 'block' : 'hidden'} lg:block`}
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2 sm:px-6 lg:flex-row">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass}>
                  {t.common.nav[item.key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm text-ink-soft sm:px-6 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-2">
            <p>{t.common.footer.disclaimer}</p>
            <p className="font-semibold text-ink">{t.common.footer.emergency}</p>
          </div>
          <div className="space-y-2 md:text-end">
            <Link to="/a-propos" className="text-brand-700 underline underline-offset-2 hover:no-underline">
              {t.common.footer.about}
            </Link>
            <p>{fmt(t.common.footer.copyright, { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
