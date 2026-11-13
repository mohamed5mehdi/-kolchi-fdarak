import { describe, expect, it } from 'vitest'
import { createRef, isRef, normalizeRef } from './reference'
import { formatPhone, isValidCin, isValidPhone, normalizeCin, normalizePhone } from './validation'
import { isInCasablanca, nearestDistrict } from '../data/districts'
import { OFFICES, isOpenAt } from '../data/offices'

describe('CIN', () => {
  it.each(['BE899512', 'be 899 512', 'A12345', 'BK1234'])('accepte %s', (v) => expect(isValidCin(v)).toBe(true))
  it.each(['', '899512', 'BEE89951', 'BE1234567', 'B-12'])('refuse %s', (v) => expect(isValidCin(v)).toBe(false))
  it('normalise la casse et les espaces', () => expect(normalizeCin(' be 899-512 ')).toBe('BE899512'))
})

describe('téléphone', () => {
  it.each(['0612345678', '06 12 34 56 78', '+212 6 12 34 56 78', '0522984110', '0700112233'])('accepte %s', (v) =>
    expect(isValidPhone(v)).toBe(true),
  )
  it.each(['061234567', '0812345678', '612345678', 'abc'])('refuse %s', (v) => expect(isValidPhone(v)).toBe(false))
  it('ramène +212 au format national', () => expect(normalizePhone('+212612345678')).toBe('0612345678'))
  it('formate par paires', () => expect(formatPhone('0612345678')).toBe('06 12 34 56 78'))
})

describe('références', () => {
  const now = new Date('2026-11-14T10:00:00')

  it('génère le format KF-AAAA-NNNNNN', () => {
    const ref = createRef('KF', [], now, () => 0.004817)
    expect(ref).toBe('KF-2026-004817')
    expect(isRef(ref)).toBe(true)
  })

  it('évite une référence déjà prise', () => {
    const values = [0.004817, 0.5]
    const ref = createRef('KF', ['KF-2026-004817'], now, () => values.shift() ?? 0)
    expect(ref).toBe('KF-2026-500000')
  })

  it.each([
    ['kf-2026-004817', 'KF-2026-004817'],
    ['KF 2026 4817', 'KF-2026-004817'],
    ['  rdv2026000213 ', 'RDV-2026-000213'],
  ])('normalise %s', (input, expected) => expect(normalizeRef(input)).toBe(expected))

  it.each(['', 'ABC-2026-1', 'KF-26-1', 'KF-2026-1234567'])('rejette %s', (v) => expect(normalizeRef(v)).toBeNull())
})

describe('géographie', () => {
  it("retrouve l'arrondissement le plus proche", () => {
    expect(nearestDistrict([33.5772, -7.6338]).id).toBe('maarif')
    expect(nearestDistrict([33.6031, -7.4952]).id).toBe('sidi-bernoussi')
  })

  it('reconnaît un point hors de Casablanca', () => {
    expect(isInCasablanca([33.5731, -7.5898])).toBe(true)
    expect(isInCasablanca([34.0209, -6.8416])).toBe(false) // Rabat
  })

  it('chaque guichet est dans son arrondissement', () => {
    for (const o of OFFICES) expect(nearestDistrict(o.position).id).toBe(o.district)
  })
})

describe('horaires des guichets', () => {
  const maarif = OFFICES.find((o) => o.id === 'maarif')!
  const hayHassani = OFFICES.find((o) => o.id === 'hay-hassani')!

  it('ouvert un mardi à 10 h, fermé à 17 h', () => {
    expect(isOpenAt(maarif, new Date('2026-11-17T10:00:00'))).toBe(true)
    expect(isOpenAt(maarif, new Date('2026-11-17T17:00:00'))).toBe(false)
  })

  it('le samedi matin seulement pour les guichets concernés, jamais le dimanche', () => {
    expect(isOpenAt(maarif, new Date('2026-11-14T10:00:00'))).toBe(true)
    expect(isOpenAt(hayHassani, new Date('2026-11-14T10:00:00'))).toBe(false)
    expect(isOpenAt(maarif, new Date('2026-11-15T10:00:00'))).toBe(false)
  })
})
