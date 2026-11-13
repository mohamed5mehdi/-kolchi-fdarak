import { useSyncExternalStore } from 'react'
import type { Appointment } from '../data/types'
import { createRef } from '../lib/reference'
import { readJson, writeJson } from '../lib/storage'
import { normalizeCin, normalizePhone } from '../lib/validation'

const KEY = 'appointments'

export type NewAppointment = Omit<Appointment, 'ref' | 'createdAt'>

let items: Appointment[] = readJson<Appointment[]>(KEY, [])
const listeners = new Set<() => void>()

function commit(next: Appointment[]) {
  items = next
  writeJson(KEY, items)
  listeners.forEach((l) => l())
}

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

/** Un créneau est pris s'il est déjà réservé au même guichet, même jour, même heure. */
export function isSlotTaken(officeId: string, date: string, slot: string): boolean {
  return items.some((a) => a.officeId === officeId && a.date === date && a.slot === slot)
}

export function bookAppointment(input: NewAppointment, now = new Date()): Appointment {
  if (isSlotTaken(input.officeId, input.date, input.slot)) throw new Error('Créneau déjà réservé')
  const appointment: Appointment = {
    ...input,
    contact: {
      fullName: input.contact.fullName.trim(),
      cin: normalizeCin(input.contact.cin),
      phone: normalizePhone(input.contact.phone),
    },
    ref: createRef('RDV', items.map((a) => a.ref), now),
    createdAt: now.toISOString(),
  }
  commit([appointment, ...items])
  return appointment
}

export function useAppointments(): Appointment[] {
  return useSyncExternalStore(subscribe, allAppointments, allAppointments)
}

/** Réservé aux tests : repart d'un état vierge. */
export function resetAppointments() {
  commit([])
}
