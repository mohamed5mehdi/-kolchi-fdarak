import type { Office } from './types'

export const SLOT_MINUTES = 30

const pad = (n: number) => String(n).padStart(2, '0')

const CASABLANCA_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Casablanca',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/**
 * Heure murale de Casablanca, renvoyée comme une Date « locale » (getHours() = heure à Casablanca).
 * Les horaires des guichets sont exprimés à l'heure marocaine : un visiteur à Montréal ou Paris
 * doit voir les mêmes créneaux et le même « ouvert / fermé » qu'un habitant.
 */
export function casablancaNow(at: Date = new Date()): Date {
  const p = Object.fromEntries(CASABLANCA_PARTS.formatToParts(at).map((x) => [x.type, x.value]))
  return new Date(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute))
}

/** Date locale au format AAAA-MM-JJ (pas toISOString, qui passe en UTC). */
export function toIsoDay(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Midi local : évite qu'un formatage en UTC affiche la veille. */
export function dayToDate(isoDay: string): Date {
  const [y, m, d] = isoDay.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export function isIsoDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return toIsoDay(dayToDate(value)) === value
}

export function toMinutes(hhmm: string): number {
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

/** Créneau déjà commencé ou dans le passé, à l'heure de Casablanca. */
export function isPastSlot(isoDay: string, slot: string, casablanca: Date): boolean {
  const today = toIsoDay(casablanca)
  if (isoDay !== today) return isoDay < today
  return toMinutes(slot) <= casablanca.getHours() * 60 + casablanca.getMinutes()
}

/** Indique si le guichet est ouvert à l'heure de Casablanca donnée. */
export function isOpenAt(office: Office, casablanca: Date): boolean {
  const day = casablanca.getDay() === 0 ? 7 : casablanca.getDay()
  const hhmm = `${pad(casablanca.getHours())}:${pad(casablanca.getMinutes())}`
  return office.hours.some((h) => h.days.includes(day) && hhmm >= h.open && hhmm < h.close)
}
