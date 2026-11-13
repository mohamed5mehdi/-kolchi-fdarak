import { describe, expect, it } from 'vitest'
import { getOffice } from '../../data/offices'
import { bookAppointment } from '../../state/appointments'
import { availableSlots, bookableDays, dayToDate, daySlots, toIsoDay } from './slots'

const maarif = getOffice('maarif')!
const ainChock = getOffice('ain-chock')!
// Samedi 14 novembre 2026, 10 h 05.
const NOW = new Date(2026, 10, 14, 10, 5)

describe('créneaux', () => {
  it('découpe la journée en créneaux de 30 min, le dernier 30 min avant la fermeture', () => {
    const monday = daySlots(maarif, '2026-11-16')
    expect(monday[0]).toBe('08:30')
    expect(monday.at(-1)).toBe('16:00')
    expect(monday).toHaveLength(16)
    expect(daySlots(maarif, '2026-11-14')).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'])
  })

  it("aucun créneau le dimanche, ni le samedi pour un guichet fermé ce jour-là", () => {
    expect(daySlots(maarif, '2026-11-15')).toEqual([])
    expect(daySlots(ainChock, '2026-11-14')).toEqual([])
  })

  it("retire les créneaux déjà passés aujourd'hui", () => {
    expect(availableSlots(maarif, '2026-11-14', NOW)).toEqual(['10:30', '11:00', '11:30', '12:00'])
    expect(availableSlots(maarif, '2026-11-13', NOW)).toEqual([])
  })

  it('retire les créneaux déjà réservés', () => {
    bookAppointment({
      officeId: 'maarif',
      procedureId: 'birth-certificate',
      date: '2026-11-16',
      slot: '09:00',
      contact: { fullName: 'Salma Bennani', cin: 'BE899512', phone: '0612345678' },
    })
    expect(availableSlots(maarif, '2026-11-16', NOW)).not.toContain('09:00')
    expect(availableSlots(maarif, '2026-11-16', NOW)).toContain('09:30')
    expect(availableSlots(getOffice('sidi-belyout')!, '2026-11-16', NOW)).toContain('09:00')
  })

  it("propose les 10 prochains jours d'ouverture, sans dimanche", () => {
    const days = bookableDays(maarif, NOW)
    expect(days).toHaveLength(10)
    expect(days[0]).toBe('2026-11-14')
    expect(days).not.toContain('2026-11-15')
    expect(days.every((d) => dayToDate(d).getDay() !== 0)).toBe(true)
    expect(days.at(-1)).toBe('2026-11-25')
  })

  it("passe à demain quand la journée est terminée", () => {
    const evening = new Date(2026, 10, 16, 16, 0)
    expect(bookableDays(maarif, evening)[0]).toBe('2026-11-17')
    expect(bookableDays(ainChock, NOW)[0]).toBe('2026-11-16')
  })

  it('formate les jours en date locale', () => {
    expect(toIsoDay(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})
