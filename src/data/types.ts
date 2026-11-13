/** Coordonnées géographiques [latitude, longitude]. */
export type LatLng = [number, number]

export type DistrictId =
  | 'anfa'
  | 'maarif'
  | 'sidi-belyout'
  | 'mers-sultan'
  | 'al-fida'
  | 'roches-noires'
  | 'hay-mohammadi'
  | 'ain-sebaa'
  | 'sidi-bernoussi'
  | 'sidi-moumen'
  | 'ben-msick'
  | 'sbata'
  | 'moulay-rachid'
  | 'sidi-othmane'
  | 'ain-chock'
  | 'hay-hassani'

export interface District {
  id: DistrictId
  /** Nom propre, identique dans toutes les langues latines. */
  name: string
  nameAr: string
  center: LatLng
}

export type ReportCategory = 'road' | 'lighting' | 'cleanliness' | 'green' | 'water'

export type ReportStatus = 'received' | 'assigned' | 'scheduled' | 'resolved' | 'closed'

export interface ReportEvent {
  status: ReportStatus
  /** Date ISO. */
  at: string
  /** Service qui a traité l'étape (clé de traduction dans common.units). */
  unit?: string
}

export interface Report {
  /** Référence du dossier, ex. KF-2026-004817. */
  ref: string
  category: ReportCategory
  district: DistrictId
  /** Rue ou repère saisi par le citoyen. */
  street: string
  position: LatLng
  description: string
  createdAt: string
  status: ReportStatus
  history: ReportEvent[]
  /** Coordonnées du déclarant (facultatives pour les dossiers publics d'exemple). */
  contact?: { fullName: string; cin: string; phone: string }
}

export interface OpeningHours {
  /** Jours ouvrés, 1 = lundi … 6 = samedi. */
  days: number[]
  open: string
  close: string
}

export type OfficeService = 'civil' | 'urbanism' | 'certificates' | 'reports' | 'tax'

export interface Office {
  id: string
  name: string
  district: DistrictId
  address: string
  position: LatLng
  phone: string
  hours: OpeningHours[]
  services: OfficeService[]
}

export interface Appointment {
  ref: string
  officeId: string
  procedureId: string
  /** Date ISO (jour) + créneau HH:MM. */
  date: string
  slot: string
  createdAt: string
  contact: { fullName: string; cin: string; phone: string }
}
