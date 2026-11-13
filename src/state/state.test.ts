import { describe, expect, it } from 'vitest'
import { bookAppointment, findAppointment, isSlotTaken } from './appointments'
import { allReports, findReport, myReports, submitReport } from './reports'
import { readJson } from '../lib/storage'
import { isRef } from '../lib/reference'

const contact = { fullName: '  Salma Bennani ', cin: 'be 899 512', phone: '06 12 34 56 78' }

describe('signalements', () => {
  it('contient les dossiers existants consultables par référence', () => {
    expect(findReport('KF-2026-004817')?.district).toBe('maarif')
    expect(allReports().length).toBeGreaterThanOrEqual(5)
  })

  it('enregistre un signalement avec référence, statut « reçu » et données normalisées', () => {
    const r = submitReport({
      category: 'lighting',
      district: 'maarif',
      street: ' Rue Ibnou Mounir ',
      position: [33.5772, -7.6338],
      description: ' Lampadaire éteint ',
      contact,
    })
    expect(isRef(r.ref)).toBe(true)
    expect(r.status).toBe('received')
    expect(r.history).toHaveLength(1)
    expect(r.contact).toEqual({ fullName: 'Salma Bennani', cin: 'BE899512', phone: '0612345678' })
    expect(findReport(r.ref)).toEqual(r)
    expect(myReports()[0].ref).toBe(r.ref)
    expect(readJson<unknown[]>('reports', [])).toHaveLength(1)
  })
})

describe('rendez-vous', () => {
  const input = { officeId: 'maarif', procedureId: 'birth-certificate', date: '2026-11-17', slot: '09:00', contact }

  it('réserve un créneau et le rend indisponible', () => {
    const a = bookAppointment(input)
    expect(a.ref).toMatch(/^RDV-\d{4}-\d{6}$/)
    expect(findAppointment(a.ref)?.contact.cin).toBe('BE899512')
    expect(isSlotTaken('maarif', '2026-11-17', '09:00')).toBe(true)
    expect(isSlotTaken('maarif', '2026-11-17', '09:30')).toBe(false)
  })

  it('refuse un créneau déjà pris', () => {
    bookAppointment(input)
    expect(() => bookAppointment(input)).toThrow()
  })
})
