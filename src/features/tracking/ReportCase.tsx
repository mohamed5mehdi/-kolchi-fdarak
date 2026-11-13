import { Smartphone } from 'lucide-react'
import { districtName, getDistrict } from '../../data/districts'
import type { Report } from '../../data/types'
import { fmt, useI18n } from '../../i18n/I18nProvider'
import { MapView } from '../../map/MapView'
import { StatusBadge } from '../../ui/StatusBadge'
import { maskCin, shortName, upcomingSteps } from './format'
import { RefHeading } from './RefHeading'

export function ReportCase({ report }: { report: Report }) {
  const { t, rtl, date } = useI18n()
  const units = t.common.units
  const upcoming = upcomingSteps(report.history)

  return (
    <article aria-labelledby="case-title" className="space-y-6">
      <div className="rounded-md border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id="case-title" className="text-2xl font-bold text-ink">
            <RefHeading template={t.tracking.report.heading} value={report.ref} />
          </h2>
          <StatusBadge status={report.status} />
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-[11rem_1fr]">
          <dt className="text-sm font-semibold text-ink-soft">{t.tracking.report.category}</dt>
          <dd className="font-semibold text-ink">{t.common.categories[report.category]}</dd>
          <dt className="text-sm font-semibold text-ink-soft">{t.tracking.report.status}</dt>
          <dd className="text-ink">{t.common.status[report.status]}</dd>
          <dt className="text-sm font-semibold text-ink-soft">{t.tracking.report.district}</dt>
          <dd className="text-ink">{districtName(getDistrict(report.district), rtl)}</dd>
          <dt className="text-sm font-semibold text-ink-soft">{t.tracking.report.street}</dt>
          <dd className="text-ink">{report.street}</dd>
          <dt className="text-sm font-semibold text-ink-soft">{t.tracking.report.createdAt}</dt>
          <dd className="text-ink">
            <time dateTime={report.createdAt}>{date(report.createdAt, 'dateTime')}</time>
          </dd>
          <dt className="text-sm font-semibold text-ink-soft">{t.tracking.report.description}</dt>
          <dd className="whitespace-pre-line text-ink">{report.description}</dd>
        </dl>
        {report.contact && (
          <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm text-ink-soft">
            <Smartphone className="size-4 shrink-0" aria-hidden="true" />
            {fmt(t.tracking.report.byDevice, {
              name: shortName(report.contact.fullName),
              cin: maskCin(report.contact.cin),
            })}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="case-history">
          <h3 id="case-history" className="text-xl font-bold text-ink">
            {t.tracking.report.historyTitle}
          </h3>
          <ol className="mt-4 space-y-0">
            {report.history.map((e, i) => (
              <li key={`${e.status}-${i}`} className="relative border-s-2 border-brand-700 pb-5 ps-5">
                <span
                  aria-hidden="true"
                  className="absolute -start-[7px] top-1 size-3 rounded-full bg-brand-700"
                />
                <p className="font-semibold text-ink">{t.common.status[e.status]}</p>
                <p className="text-sm text-ink-soft">
                  <time dateTime={e.at}>{date(e.at, 'dateTime')}</time>
                  {e.unit && e.unit in units && <> · {units[e.unit as keyof typeof units]}</>}
                </p>
              </li>
            ))}
            {upcoming.map((s) => (
              <li key={s} className="relative border-s-2 border-dashed border-line-strong pb-5 ps-5 text-ink-soft">
                <span
                  aria-hidden="true"
                  className="absolute -start-[7px] top-1 size-3 rounded-full border-2 border-line-strong bg-white"
                />
                <p className="font-semibold">{t.common.status[s]}</p>
                <p className="text-sm">{t.tracking.report.upcoming}</p>
              </li>
            ))}
          </ol>
        </section>
        <MapView
          label={t.tracking.report.mapLabel}
          markers={[{ id: report.ref, position: report.position, label: t.common.categories[report.category] }]}
          focus={report.position}
          zoom={15}
          className="h-64"
        />
      </div>
    </article>
  )
}
