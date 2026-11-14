import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { CalendarClock, ChevronRight, Compass, FileText, Landmark, Megaphone, Search } from 'lucide-react'
import { districtName, getDistrict } from '../../data/districts'
import { normalizeRef } from '../../lib/reference'
import { useI18n } from '../../i18n/I18nProvider'
import { MapView } from '../../map/MapView'
import { useReports } from '../../state/reports'
import { ButtonLink } from '../../ui/Button'
import { useDocumentTitle } from '../../ui/PageHeader'
import { StatusBadge } from '../../ui/StatusBadge'

function TrackForm() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const ref = normalizeRef(value) ?? value.trim()
    if (ref) navigate(`/suivi/${encodeURIComponent(ref)}`)
  }

  return (
    <form onSubmit={submit} className="rounded-md border border-line bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-ink">{t.home.trackTitle}</h2>
      <label htmlFor="home-ref" className="mt-3 block font-semibold text-ink">
        {t.home.trackLabel}
      </label>
      <p id="home-ref-hint" className="text-sm text-ink-soft">
        {t.home.trackHint}
      </p>
      <div className="mt-2 flex gap-2">
        <input
          id="home-ref"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby="home-ref-hint"
          autoComplete="off"
          spellCheck={false}
          dir="ltr"
          className="ref min-w-0 flex-1 rounded-md border border-line-strong px-3 py-2.5 uppercase"
        />
        <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800">
          <Search className="size-4" aria-hidden="true" />
          {t.common.actions.search}
        </button>
      </div>
    </form>
  )
}

export function HomePage() {
  const { t, rtl, date } = useI18n()
  const reports = useReports()
  useDocumentTitle()
  const recent = [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  const quick = [
    { to: '/demarches', icon: FileText, title: t.home.quick.services, desc: t.home.quick.servicesDesc },
    { to: '/rendez-vous', icon: CalendarClock, title: t.home.quick.booking, desc: t.home.quick.bookingDesc },
    { to: '/orientation', icon: Compass, title: t.home.quick.guide, desc: t.home.quick.guideDesc },
    { to: '/guichets', icon: Landmark, title: t.home.quick.offices, desc: t.home.quick.officesDesc },
  ]

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-14">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">{t.home.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-soft">{t.home.lead}</p>
            <ButtonLink to="/signaler" className="mt-6 px-6 py-3 text-lg">
              <Megaphone className="size-5" aria-hidden="true" />
              {t.home.ctaReport}
            </ButtonLink>
          </div>
          <TrackForm />
        </div>
      </section>

      <section aria-labelledby="quick-title" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 id="quick-title" className="text-2xl font-bold text-ink">
          {t.home.quickTitle}
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map(({ to, icon: Icon, title, desc }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex h-full flex-col rounded-md border border-line bg-white p-5 hover:border-brand-600"
              >
                <Icon className="size-6 text-brand-700" aria-hidden="true" />
                <span className="mt-3 font-semibold text-brand-700 group-hover:underline">{title}</span>
                <span className="mt-1 text-sm text-ink-soft">{desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-title" className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 id="recent-title" className="text-2xl font-bold text-ink">
            {t.home.recentTitle}
          </h2>
          {recent.length === 0 ? (
            <p className="mt-4 text-ink-soft">{t.home.recentEmpty}</p>
          ) : (
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <ul className="divide-y divide-line rounded-md border border-line">
                {recent.map((r) => (
                  <li key={r.ref}>
                    <Link to={`/suivi/${r.ref}`} className="flex items-center gap-3 p-4 hover:bg-brand-50">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">{t.common.categories[r.category]}</span>
                        <span className="block break-words text-sm text-ink-soft">
                          {districtName(getDistrict(r.district), rtl)} · {date(r.createdAt)} · <span className="ref">{r.ref}</span>
                        </span>
                      </span>
                      <StatusBadge status={r.status} />
                      <ChevronRight className="size-4 shrink-0 text-ink-soft rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <MapView
                label={t.common.map.label}
                markers={recent.map((r) => ({ id: r.ref, position: r.position, label: t.common.categories[r.category] }))}
                className="h-80 lg:h-full lg:min-h-80"
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
