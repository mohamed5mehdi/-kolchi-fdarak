import { useCallback, useEffect, useRef } from 'react'
import L from 'leaflet'
import { AttributionControl, MapContainer, Marker, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import { Crosshair } from 'lucide-react'
import { CASABLANCA_BOUNDS, CASABLANCA_CENTER } from '../data/districts'
import type { LatLng } from '../data/types'
import { useI18n } from '../i18n/I18nProvider'
import { TILE_ATTRIBUTION, TILE_URL } from './tiles'

export interface MapMarker {
  id: string
  position: LatLng
  label: string
}

export interface MapViewProps {
  /** Nom accessible de la carte. */
  label: string
  markers?: MapMarker[]
  activeMarkerId?: string | null
  onSelectMarker?: (id: string) => void
  /** Repère posé par l'utilisateur (mode « choisir un emplacement »). */
  picked?: LatLng | null
  /** Active le mode choix : clic sur la carte ou bouton « centre de la carte ». */
  onPick?: (position: LatLng) => void
  /** Recentre la carte quand cette valeur change (ex. arrondissement choisi dans une liste). */
  focus?: LatLng | null
  zoom?: number
  className?: string
}

function pin(variant: 'default' | 'accent' | 'active') {
  return L.divIcon({
    className: '',
    html: `<div class="kf-pin${variant === 'default' ? '' : ` kf-pin--${variant}`}"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    tooltipAnchor: [0, -26],
  })
}

const ICONS = { default: pin('default'), accent: pin('accent'), active: pin('active') }

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) })
  return null
}

function FlyTo({ focus, zoom }: { focus: LatLng | null | undefined; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    // L'animation est en JavaScript : la règle CSS prefers-reduced-motion ne l'atteint pas.
    const animate = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (focus) map.flyTo(focus, Math.max(map.getZoom(), zoom), { animate, duration: 0.6 })
  }, [focus, zoom, map])
  return null
}

function MapRef({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap()
  useEffect(() => onReady(map), [map, onReady])
  return null
}

/**
 * Carte de Casablanca. Le conteneur Leaflet est focalisable : flèches pour se déplacer, +/- pour zoomer.
 * En mode choix, le bouton « centre de la carte » permet de poser le repère sans souris.
 */
export function MapView({
  label,
  markers = [],
  activeMarkerId,
  onSelectMarker,
  picked,
  onPick,
  focus,
  zoom = 13,
  className = 'h-80',
}: MapViewProps) {
  const { t } = useI18n()
  const mapRef = useRef<L.Map | null>(null)
  const onReady = useCallback((map: L.Map) => {
    mapRef.current = map
  }, [])

  return (
    <div>
      <div role="region" aria-label={label} className={`relative overflow-hidden rounded-md border border-line-strong ${className}`}>
        <MapContainer
          center={CASABLANCA_CENTER}
          zoom={12}
          minZoom={11}
          maxBounds={CASABLANCA_BOUNDS}
          maxBoundsViscosity={0.8}
          scrollWheelZoom={false}
          attributionControl={false}
          zoomControl={false}
          className="h-full w-full"
        >
          <AttributionControl prefix={false} />
          <ZoomControl zoomInTitle={t.common.map.zoomIn} zoomOutTitle={t.common.map.zoomOut} />
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <MapRef onReady={onReady} />
          <FlyTo focus={focus} zoom={zoom} />
          {onPick && <ClickToPick onPick={onPick} />}
          {markers.map((m) => (
            <Marker
              key={m.id}
              position={m.position}
              icon={m.id === activeMarkerId ? ICONS.active : ICONS.default}
              title={m.label}
              alt={m.label}
              keyboard={!!onSelectMarker}
              interactive={!!onSelectMarker}
              eventHandlers={onSelectMarker ? { click: () => onSelectMarker(m.id) } : undefined}
            >
              <Tooltip>{m.label}</Tooltip>
            </Marker>
          ))}
          {picked && (
            <Marker position={picked} icon={ICONS.accent} title={t.common.map.placed} alt={t.common.map.placed} keyboard={false} interactive={false} />
          )}
        </MapContainer>
        {onPick && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center text-brand-700/70"
          >
            <Crosshair className="size-6" />
          </span>
        )}
      </div>
      {onPick && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const c = mapRef.current?.getCenter()
              if (c) onPick([c.lat, c.lng])
            }}
            className="inline-flex items-center gap-2 rounded-md border border-brand-700 bg-white px-4 py-2 font-semibold text-brand-700 hover:bg-brand-50"
          >
            <Crosshair className="size-4" aria-hidden="true" />
            {t.common.map.pickCenter}
          </button>
          <p className="text-sm text-ink-soft">{t.common.map.pickHint}</p>
        </div>
      )}
    </div>
  )
}
