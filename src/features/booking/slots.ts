import type { Office } from '../../data/types'
import { isSlotTaken } from '../../state/appointments'

const SLOT_MINUTES = 30
/** Au-delà, on arrête de chercher des jours ouvrés (guichet saturé). */
const MAX_LOOKAHEAD_DAYS = 60

const pad = (n: number) => String(n).padStart(2, '0')

/** Date locale au format AAAA-MM-JJ (pas toISOString, qui passe en UTC). */
export function toIsoDay(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Midi local : évite qu'un formatage en UTC affiche la veille. */
export function dayToDate(isoDay: string): Date {
  const [y, m, d] = isoDay.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHhmm(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

/** Tous les créneaux d'une journée selon les horaires ; le dernier commence 30 min avant la fermeture. */
export function daySlots(office: Office, isoDay: string): string[] {
  const jsDay = dayToDate(isoDay).getDay()
  const day = jsDay === 0 ? 7 : jsDay
  const slots: string[] = []
  for (const h of office.hours) {
    if (!h.days.includes(day) || day === 7) continue
    for (let m = toMinutes(h.open); m + SLOT_MINUTES <= toMinutes(h.close); m += SLOT_MINUTES) slots.push(toHhmm(m))
  }
  return slots.sort()
}

/** Créneaux encore réservables : ni pris, ni déjà passés si la date est aujourd'hui. */
export function availableSlots(office: Office, isoDay: string, now: Date): string[] {
  const today = toIsoDay(now)
  if (isoDay < today) return []
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return daySlots(office, isoDay).filter(
    (slot) => !(isoDay === today && toMinutes(slot) <= nowMinutes) && !isSlotTaken(office.id, isoDay, slot),
  )
}

/** Prochains jours d'ouverture (aujourd'hui compris) ayant encore au moins un créneau libre. */
export function bookableDays(office: Office, now: Date, count = 10): string[] {
  const days: string[] = []
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  for (let i = 0; i < MAX_LOOKAHEAD_DAYS && days.length < count; i++) {
    const iso = toIsoDay(cursor)
    if (availableSlots(office, iso, now).length > 0) days.push(iso)
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}
