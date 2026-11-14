import { afterEach, describe, expect, it, vi } from 'vitest'
import { bookAppointment, findAppointment, isSlotTaken, type NewAppointment } from './appointments'
import { allReports, findReport, myReports, submitReport, type NewReport } from './reports'
import { StoreError, readJson } from '../lib/storage'
import { isRef } from '../lib/reference'

const contact = { fullName: '  Salma Bennani ', cin: 'be 899 512', phone: '06 12 34 56 78' }
/** Samedi 14 novembre 2026, 11 h à Casablanca (UTC+1). */
const NOW = new Date('2026-11-14T10:00:00Z')

const report: NewReport = {
  category: 'lighting',
  district: 'maarif',
  street: ' Rue Ibnou Mounir ',
  position: [33.5772, -7.6338],
  description: ' Lampadaire éteint depuis trois jours ',
  contact,
}

const booking: NewAppointment = {
  officeId: 'maarif',
  procedureId: 'birth-certificate',
  date: '2026-11-17',
  slot: '09:00',
  contact,
}

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn()
  } catch (err) {
    return err instanceof StoreError ? err.code : 'autre'
  }
  return undefined
}

/** Simule une écriture faite par un autre onglet : le stockage change, la mémoire de cet onglet non. */
function writeFromOtherTab(key: string, value: unknown) {
  localStorage.setItem(`kolchi-fdarak:${key}`, JSON.stringify(value))
}

afterEach(() => vi.restoreAllMocks())

describe('signalements', () => {
  it('contient les dossiers existants consultables par référence', () => {
    expect(findReport('KF-2026-004817')?.district).toBe('maarif')
    expect(allReports().length).toBeGreaterThanOrEqual(5)
  })

  it('enregistre un signalement normalisé, avec la CIN conservée uniquement masquée', () => {
    const r = submitReport(report, NOW)
    expect(isRef(r.ref)).toBe(true)
    expect(r.status).toBe('received')
    expect(r.history).toHaveLength(1)
    expect(r.street).toBe('Rue Ibnou Mounir')
    expect(r.contact).toEqual({ fullName: 'Salma Bennani', cin: 'BE****12', phone: '0612345678' })
    expect(findReport(r.ref)).toEqual(r)
    expect(myReports()[0].ref).toBe(r.ref)
    expect(JSON.stringify(readJson('reports', []))).not.toContain('899512')
  })

  it.each<[string, Partial<NewReport>]>([
    ['catégorie inconnue', { category: 'noise' as NewReport['category'] }],
    ['arrondissement inconnu', { district: 'rabat' as NewReport['district'] }],
    ['repère hors de Casablanca', { position: [34.02, -6.84] }],
    ['coordonnées invalides', { position: [Number.NaN, -7.6] }],
    ['rue vide', { street: '  ' }],
    ['description trop courte', { description: 'Trou' }],
    ['description trop longue', { description: 'x'.repeat(501) }],
    ['CIN invalide', { contact: { ...contact, cin: '123' } }],
    ['téléphone fixe', { contact: { ...contact, phone: '0522984110' } }],
  ])('refuse un signalement avec %s, sans rien écrire', (_, patch) => {
    expect(codeOf(() => submitReport({ ...report, ...patch }, NOW))).toBe('invalid')
    expect(myReports()).toHaveLength(0)
  })

  it("ne perd pas un signalement déposé dans un autre onglet (pas d'écrasement)", () => {
    const first = submitReport(report, NOW)
    const otherTab = { ...first, ref: 'KF-2026-999999' }
    writeFromOtherTab('reports', [otherTab, first])
    const second = submitReport(report, NOW)
    const stored = readJson<{ ref: string }[]>('reports', []).map((r) => r.ref)
    expect(stored).toEqual([second.ref, 'KF-2026-999999', first.ref])
  })

  it("ne donne aucune référence si le navigateur refuse l'écriture", () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    expect(codeOf(() => submitReport(report, NOW))).toBe('storage')
    expect(myReports()).toHaveLength(0)
  })

  it('ignore des données corrompues au lieu de faire tomber la page', () => {
    localStorage.setItem('kolchi-fdarak:reports', '{"pas":"une liste"}')
    window.dispatchEvent(new StorageEvent('storage', { key: 'kolchi-fdarak:reports' }))
    expect(myReports()).toEqual([])
    writeFromOtherTab('reports', [{ ref: 'KF-2026-000001' }, null, 42])
    window.dispatchEvent(new StorageEvent('storage', { key: 'kolchi-fdarak:reports' }))
    expect(myReports()).toEqual([])
  })

  it("reflète un dossier déposé dans un autre onglet dès l'événement storage", () => {
    const r = submitReport(report, NOW)
    writeFromOtherTab('reports', [{ ...r, ref: 'KF-2026-777777' }, r])
    window.dispatchEvent(new StorageEvent('storage', { key: 'kolchi-fdarak:reports' }))
    expect(findReport('KF-2026-777777')).toBeDefined()
  })
})

describe('rendez-vous', () => {
  it('réserve un créneau, masque la CIN et rend le créneau indisponible', () => {
    const a = bookAppointment(booking, NOW)
    expect(a.ref).toMatch(/^RDV-\d{4}-\d{6}$/)
    expect(findAppointment(a.ref)?.contact.cin).toBe('BE****12')
    expect(isSlotTaken('maarif', '2026-11-17', '09:00')).toBe(true)
    expect(isSlotTaken('maarif', '2026-11-17', '09:30')).toBe(false)
  })

  it('refuse un créneau déjà pris dans cet onglet', () => {
    bookAppointment(booking, NOW)
    expect(codeOf(() => bookAppointment(booking, NOW))).toBe('conflict')
  })

  it("refuse un créneau pris dans un autre onglet, même si cet onglet ne l'a pas encore vu", () => {
    writeFromOtherTab('appointments', [{ ...booking, ref: 'RDV-2026-000001', createdAt: NOW.toISOString() }])
    expect(isSlotTaken('maarif', '2026-11-17', '09:00')).toBe(false)
    expect(codeOf(() => bookAppointment(booking, NOW))).toBe('conflict')
    // Le conflit rafraîchit la mémoire de l'onglet : le créneau n'est plus proposé.
    expect(isSlotTaken('maarif', '2026-11-17', '09:00')).toBe(true)
    expect(readJson<unknown[]>('appointments', [])).toHaveLength(1)
  })

  it.each<[string, Partial<NewAppointment>, Date?]>([
    ['démarche inconnue', { procedureId: 'passport' }],
    ['démarche sans rendez-vous', { procedureId: 'signature-legalisation', officeId: 'maarif' }],
    ['guichet inconnu', { officeId: 'rabat' }],
    ["guichet qui ne traite pas la démarche", { procedureId: 'minor-works', officeId: 'sidi-belyout' }],
    ['date invalide', { date: '2026-02-30' }],
    ['dimanche', { date: '2026-11-15' }],
    ['créneau hors horaires', { slot: '17:00' }],
    ['créneau non aligné', { slot: '09:10' }],
    ['samedi après-midi', { date: '2026-11-14', slot: '14:00' }],
    ['créneau déjà passé aujourd’hui', { date: '2026-11-14', slot: '10:30' }],
    ['date passée', { date: '2026-11-13' }],
    ['téléphone fixe', { contact: { ...contact, phone: '0522984110' } }],
  ])('refuse : %s', (_, patch) => {
    expect(codeOf(() => bookAppointment({ ...booking, ...patch }, NOW))).toBe('invalid')
    expect(readJson<unknown[]>('appointments', [])).toHaveLength(0)
  })

  it("le créneau commencé à l'heure de Casablanca est refusé, le suivant accepté", () => {
    // 11 h 00 à Casablanca : 11:00 a commencé, 11:30 est libre.
    expect(codeOf(() => bookAppointment({ ...booking, date: '2026-11-14', slot: '11:00' }, NOW))).toBe('invalid')
    expect(bookAppointment({ ...booking, date: '2026-11-14', slot: '11:30' }, NOW).slot).toBe('11:30')
  })

  it("ne donne aucune référence si le navigateur refuse l'écriture", () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    expect(codeOf(() => bookAppointment(booking, NOW))).toBe('storage')
    expect(isSlotTaken('maarif', '2026-11-17', '09:00')).toBe(false)
  })
})
