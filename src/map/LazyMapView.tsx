import { Suspense, lazy } from 'react'
import type { MapViewProps } from './MapView'

// Leaflet (≈ 45 Ko compressés) n'est téléchargé que sur les pages qui affichent une carte.
const RealMapView = lazy(() => import('./MapView').then((m) => ({ default: m.MapView })))

/**
 * Même nom et mêmes props que la carte réelle. Pendant le chargement, un bloc de même hauteur
 * réserve la place pour que la page ne saute pas à l'arrivée de la carte.
 */
export function MapView(props: MapViewProps) {
  return (
    <Suspense
      fallback={
        <div
          role="region"
          aria-label={props.label}
          aria-busy="true"
          className={`rounded-md border border-line-strong bg-[#e9edf1] ${props.className ?? 'h-80'}`}
        />
      }
    >
      <RealMapView {...props} />
    </Suspense>
  )
}
