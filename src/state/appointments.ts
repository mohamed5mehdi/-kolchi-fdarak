import { useSyncExternalStore } from 'react'
import { getOffice } from '../data/offices'
import { getProcedure } from '../data/procedures'
import { casablancaNow, daySlots, isIsoDay, isPastSlot } from '../data/schedule'
import type { Appointment } from '../data/types'
import { createRef } from '../lib/reference'
import { StoreError, onExternalChange, readJson, writeJson } from '../lib/storage'
import { invalidContactFields, maskCin, normalizeCin, normalizePhone } from '../lib/validation'

const KEY = 'appointments'

export type NewAppointment = Omit<Appointment, 'ref' | 'createdAt'>

function isAppointment(value: unknown): value is Appointment {
  const a = value as Appointment
  return (
    typeof a === 'object' &&
    a !== null &&
    typeof a.ref === 'string' &&
    typeof a.officeId === 'string' &&
    typeof a.procedureId === 'string' &&
    typeof a.date === 'string' &&
    typeof a.slot === 'string'
  )
}

function isAppointmentList(value: unknown): value is Appointment[] {
  return Array.isArray(value)
}

/** Lit le stockage (source de vérité partagée entre onglets) en écartant les entrées invalides. */
function load(): Appointment[] {
  return readJson<Appointment[]>(KEY, [], isAppointmentList).filter(isAppointment)
}

let items: Appointment[] = load()
const listeners = new Set<() => void>()

function publish(next: Appointment[]) {
  items = next
  listeners.forEach((l) => l())
}

// Une réservation faite dans un autre onglet retire aussitôt le créneau ici.
if (typeof window !== 'undefined') onExternalChange(KEY, () => publish(load()))

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function allAppointments(): Appointment[] {
  return items
}

export function findAppointment(ref: string): Appointment | undefined {
  return items.find((a) => a.ref === ref)
}

function taken(list: Appointment[], officeId: string, date: string, slot: string): boolean {
  return list.some((a) => a.officeId === officeId && a.date === date && a.slot === slot)
}

/** Un créneau est pris s'il est déjà réservé au même guichet, même jour, même heure. */
export function isSlotTaken(officeId: string, date: string, slot: string): boolean {
  return taken(items, officeId, date, slot)
}

/** Règles métier d'une réservation ; renvoie la liste des points refusés. `now` est un instant réel. */
export function invalidAppointmentFields(input: NewAppointment, now = new Date()): string[] {
  const bad: string[] = []
  const procedure = getProcedure(input.procedureId)
  const office = getOffice(input.officeId)
  if (!procedure || !procedure.bookable) bad.push('procedure')
  if (!office) bad.push('office')
  else if (procedure && !office.services.includes(procedure.officeService)) bad.push('office')
  if (!isIsoDay(input.date)) bad.push('date')
  else if (office && !daySlots(office, input.date).includes(input.slot)) bad.push('slot')
  else if (isPastSlot(input.date, input.slot, casablancaNow(now))) bad.push('slot')
  bad.push(...invalidContactFields(input.contact))
  return bad
}

/**
 * Réserve un créneau. Lève une StoreError :
 * - `invalid` si une règle métier n'est pas respectée ;
 * - `conflict` si le créneau a été pris entre-temps (y compris depuis un autre onglet) ;
 * - `storage` si le navigateur refuse l'écriture.
 */
export function bookAppointment(input: NewAppointment, now = new Date()): Appointment {
  const bad = invalidAppointmentFields(input, now)
  if (bad.length > 0) throw new StoreError('invalid', `Rendez-vous refusé : ${bad.join(', ')}`)

  // Relecture juste avant l'écriture : la vérification porte sur l'état réel, pas sur la copie de cet onglet.
  const current = load()
  if (taken(current, input.officeId, input.date, input.slot)) {
    publish(current)
    throw new StoreError('conflict', 'Créneau déjà réservé')
  }
  const appointment: Appointment = {
    officeId: input.officeId,
    procedureId: input.procedureId,
    date: input.date,
    slot: input.slot,
    contact: {
      fullName: input.contact.fullName.trim(),
      // Minimisation : seule la CIN masquée est conservée dans le navigateur.
      cin: maskCin(normalizeCin(input.contact.cin)),
      phone: normalizePhone(input.contact.phone),
    },
    ref: createRef('RDV', current.map((a) => a.ref), now),
    createdAt: now.toISOString(),
  }
  const next = [appointment, ...current]
  if (!writeJson(KEY, next)) throw new StoreError('storage', 'Stockage du navigateur indisponible')
  publish(next)
  return appointment
}

export function useAppointments(): Appointment[] {
  return useSyncExternalStore(subscribe, allAppointments, allAppointments)
}

/** Efface les rendez-vous de ce navigateur (page À propos, tests). */
export function resetAppointments() {
  writeJson(KEY, [])
  publish([])
}
