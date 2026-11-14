import { useState } from 'react'
import { DISTRICTS, districtName, getDistrict, isInCasablanca, nearestDistrict } from '../../data/districts'
import type { DistrictId, LatLng } from '../../data/types'
import { fmt, useI18n } from '../../i18n/I18nProvider'
import { MapView } from '../../map/LazyMapView'
import type { FieldError } from '../../ui/ErrorSummary'
import { SelectField, TextField } from '../../ui/Field'
import { errorFor, type Draft } from './draft'

export function LocationStep({
  draft,
  update,
  errors,
}: {
  draft: Draft
  update: (patch: Partial<Draft>) => void
  errors: FieldError[]
}) {
  const { t, rtl } = useI18n()
  // Au retour sur l'étape, la carte se recentre sur le repère déjà posé.
  const [focus, setFocus] = useState<LatLng | null>(
    () => draft.position ?? (draft.district ? getDistrict(draft.district).center : null),
  )
  const mapError = errorFor(errors, 'report-map')

  function pick(position: LatLng) {
    update(isInCasablanca(position) ? { position, district: nearestDistrict(position).id } : { position })
  }

  function chooseDistrict(id: DistrictId | '') {
    update({ district: id })
    if (id) setFocus(getDistrict(id).center)
  }

  const pickedDistrict = draft.position && draft.district ? districtName(getDistrict(draft.district), rtl) : null

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <SelectField
          id="report-district"
          label={t.common.map.district}
          hint={t.report.location.districtHint}
          error={errorFor(errors, 'report-district')}
          value={draft.district}
          onChange={(e) => chooseDistrict(e.target.value as DistrictId | '')}
        >
          <option value="">{t.report.location.districtPlaceholder}</option>
          {DISTRICTS.map((d) => (
            <option key={d.id} value={d.id}>
              {districtName(d, rtl)}
            </option>
          ))}
        </SelectField>
      </div>

      <div
        id="report-map"
        tabIndex={-1}
        role="group"
        aria-labelledby="report-map-title"
        aria-describedby={mapError ? 'report-map-error' : undefined}
        className="space-y-2 focus:outline-none"
      >
        <p id="report-map-title" className="font-semibold text-ink">
          {t.report.location.mapTitle}
        </p>
        {mapError && (
          <p id="report-map-error" className="text-sm font-semibold text-danger-700">
            {mapError}
          </p>
        )}
        <div className={mapError ? 'rounded-md ring-2 ring-danger-700' : ''}>
          <MapView
            label={t.report.location.mapLabel}
            picked={draft.position}
            onPick={pick}
            focus={focus}
            zoom={15}
            className="h-80 sm:h-96"
          />
        </div>
        <p
          role="status"
          className={`text-sm font-semibold ${draft.position && !isInCasablanca(draft.position) ? 'text-danger-700' : 'text-success-700'}`}
        >
          {draft.position && !isInCasablanca(draft.position)
            ? t.report.location.outsideError
            : pickedDistrict
              ? fmt(t.report.location.picked, { district: pickedDistrict })
              : ''}
        </p>
      </div>

      <TextField
        id="report-street"
        label={t.report.location.street}
        hint={t.report.location.streetHint}
        error={errorFor(errors, 'report-street')}
        value={draft.street}
        onChange={(e) => update({ street: e.target.value })}
        autoComplete="street-address"
        maxLength={120}
      />
    </div>
  )
}
