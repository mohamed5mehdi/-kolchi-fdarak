import { daySlots, isPastSlot, toIsoDay } from '../../data/schedule'
import type { Office } from '../../data/types'
import { isSlotTaken } from '../../state/appointments'

export { dayToDate, daySlots, toIsoDay } from '../../data/schedule'

/** Au-delà, on arrête de chercher des jours ouvrés (guichet saturé). */
const MAX_LOOKAHEAD_DAYS = 60

/** Créneaux encore réservables : ni pris, ni déjà commencés. `now` est l'heure de Casablanca. */
export function availableSlots(office: Office, isoDay: string, now: Date): string[] {
  return daySlots(office, isoDay).filter((slot) => !isPastSlot(isoDay, slot, now) && !isSlotTaken(office.id, isoDay, slot))
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
