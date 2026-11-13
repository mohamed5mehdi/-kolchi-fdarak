import type { District, DistrictId, LatLng } from './types'

/** Centre de Casablanca utilisé pour le cadrage initial des cartes. */
export const CASABLANCA_CENTER: LatLng = [33.5731, -7.5898]

/** Emprise au-delà de laquelle un point n'est plus considéré comme à Casablanca. */
export const CASABLANCA_BOUNDS: [LatLng, LatLng] = [
  [33.48, -7.75],
  [33.66, -7.42],
]

/** Les 16 arrondissements de la commune, centres approximatifs. */
export const DISTRICTS: District[] = [
  { id: 'anfa', name: 'Anfa', nameAr: 'أنفا', center: [33.5905, -7.6355] },
  { id: 'maarif', name: 'Maârif', nameAr: 'المعاريف', center: [33.5745, -7.6405] },
  { id: 'sidi-belyout', name: 'Sidi Belyout', nameAr: 'سيدي بليوط', center: [33.5985, -7.6125] },
  { id: 'mers-sultan', name: 'Mers Sultan', nameAr: 'مرس السلطان', center: [33.5835, -7.6045] },
  { id: 'al-fida', name: 'Al Fida', nameAr: 'الفداء', center: [33.5685, -7.5975] },
  { id: 'roches-noires', name: 'Roches Noires', nameAr: 'الصخور السوداء', center: [33.6025, -7.5745] },
  { id: 'hay-mohammadi', name: 'Hay Mohammadi', nameAr: 'الحي المحمدي', center: [33.5905, -7.5555] },
  { id: 'ain-sebaa', name: 'Aïn Sebaâ', nameAr: 'عين السبع', center: [33.6005, -7.5355] },
  { id: 'sidi-bernoussi', name: 'Sidi Bernoussi', nameAr: 'سيدي البرنوصي', center: [33.6055, -7.4905] },
  { id: 'sidi-moumen', name: 'Sidi Moumen', nameAr: 'سيدي مومن', center: [33.5805, -7.5005] },
  { id: 'ben-msick', name: "Ben M'Sick", nameAr: 'بن امسيك', center: [33.5505, -7.5755] },
  { id: 'sbata', name: 'Sbata', nameAr: 'سباتة', center: [33.5445, -7.5605] },
  { id: 'moulay-rachid', name: 'Moulay Rachid', nameAr: 'مولاي رشيد', center: [33.5555, -7.5395] },
  { id: 'sidi-othmane', name: 'Sidi Othmane', nameAr: 'سيدي عثمان', center: [33.5605, -7.5555] },
  { id: 'ain-chock', name: 'Aïn Chock', nameAr: 'عين الشق', center: [33.5405, -7.6005] },
  { id: 'hay-hassani', name: 'Hay Hassani', nameAr: 'الحي الحسني', center: [33.5555, -7.6655] },
]

export function getDistrict(id: DistrictId): District {
  const district = DISTRICTS.find((d) => d.id === id)
  if (!district) throw new Error(`Arrondissement inconnu : ${id}`)
  return district
}

/** Nom affiché selon l'écriture de la langue courante. */
export function districtName(district: District, rtl: boolean): string {
  return rtl ? district.nameAr : district.name
}

/** Arrondissement dont le centre est le plus proche (suffisant pour pré-remplir le formulaire). */
export function nearestDistrict([lat, lng]: LatLng): District {
  let best = DISTRICTS[0]
  let bestDist = Infinity
  for (const d of DISTRICTS) {
    const dist = (d.center[0] - lat) ** 2 + (d.center[1] - lng) ** 2
    if (dist < bestDist) {
      best = d
      bestDist = dist
    }
  }
  return best
}

export function isInCasablanca([lat, lng]: LatLng): boolean {
  const [[south, west], [north, east]] = CASABLANCA_BOUNDS
  return lat >= south && lat <= north && lng >= west && lng <= east
}
