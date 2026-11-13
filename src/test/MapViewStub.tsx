import type { LatLng } from '../data/types'
import { useI18n } from '../i18n/I18nProvider'
import type { MapViewProps } from '../map/MapView'

/** Position posée par le bouton « centre de la carte » dans les tests (Maârif). */
// eslint-disable-next-line react-refresh/only-export-components
export const TEST_PICK: LatLng = [33.5745, -7.6405]

/**
 * Remplace la carte Leaflet dans jsdom (pas de rendu de tuiles ni de géométrie).
 * Expose les mêmes interactions sous forme de boutons : un par repère, et le bouton de choix d'emplacement.
 */
export function MapView({ label, markers = [], onSelectMarker, onPick, picked }: MapViewProps) {
  const { t } = useI18n()
  return (
    <div role="region" aria-label={label}>
      {markers.map((m) => (
        <button key={m.id} type="button" onClick={() => onSelectMarker?.(m.id)}>
          {m.label}
        </button>
      ))}
      {onPick && (
        <button type="button" onClick={() => onPick(TEST_PICK)}>
          {t.common.map.pickCenter}
        </button>
      )}
      {picked && <p data-testid="map-picked">{picked.join(',')}</p>}
    </div>
  )
}
