import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  allAppointments,
  bookAppointment,
  findAppointment,
  isSlotTaken,
  resetAppointments,
  type NewAppointment,
} from './appointments'
import { RETENTION_DAYS, allReports, findReport, myReports, resetReports, submitReport, type NewReport } from './reports'
import { StoreError, readJson } from '../lib/storage'
import { isRef } from '../lib/reference'

const contact = { fullName: '  Salma Bennani ', cin: 'be 899 512', phone: '06 12 34 56 78' }
/** Samedi 14 novembre 2026, 11 h à Casablanca (UTC+1). */
const NOW = new Date('2026-11-14T10:00:00Z')
const DAY = 24 * 60 * 60 * 1000

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

/** Simule l'événement storage reçu quand un autre onglet modifie la clé : l'onglet relit le stockage. */
function storageEvent(key: string) {
  window.dispatchEvent(new StorageEvent('storage', { key: `kolchi-fdarak:${key}` }))
}

const raw = (key: string) => localStorage.getItem(`kolchi-fdarak:${key}`)

/** Aucune trace du nom, de la CIN (même masquée ou partielle) ni du téléphone. */
function expectNoIdentity(stored: string | null) {
  expect(stored).not.toBeNull()
  for (const fragment of ['contact', 'Salma', 'Bennani', 'BE899', '899512', 'BE*', '****', '0612345678', '612345678', '06 12'])
    expect(stored).not.toContain(fragment)
}

// L'horloge est figée au samedi 14 novembre 2026 : les relectures (événement storage) appliquent
// la durée de conservation à cette date, quel que soit le jour où les tests tournent.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('signalements', () => {
  it('contient les dossiers existants consultables par référence', () => {
    expect(findReport('KF-2026-004817')?.district).toBe('maarif')
    expect(allReports().length).toBeGreaterThanOrEqual(5)
  })

  it('enregistre un signalement normalisé, sans aucune donnée d’identité', () => {
    const r = submitReport(report, NOW)
    expect(isRef(r.ref)).toBe(true)
    expect(r.status).toBe('received')
    expect(r.history).toHaveLength(1)
    expect(r.street).toBe('Rue Ibnou Mounir')
    expect(r).not.toHaveProperty('contact')
    expect(findReport(r.ref)).toEqual(r)
    expect(myReports()[0].ref).toBe(r.ref)
    expectNoIdentity(raw('reports'))
  })

  it(`efface un signalement ${RETENTION_DAYS} jours après sa création et réécrit la clé`, () => {
    const r = submitReport(report, NOW)
    vi.setSystemTime(new Date(NOW.getTime() + 29 * DAY))
    storageEvent('reports')
    expect(findReport(r.ref)).toBeDefined()

    vi.setSystemTime(new Date(NOW.getTime() + 31 * DAY))
    storageEvent('reports')
    expect(findReport(r.ref)).toBeUndefined()
    expect(myReports()).toEqual([])
    expect(readJson('reports', null)).toEqual([])
  })

  it('purge aussi au moment d’enregistrer, avec la date injectée', () => {
    const old = submitReport(report, NOW)
    const later = submitReport(report, new Date(NOW.getTime() + 31 * DAY))
    expect(readJson<{ ref: string }[]>('reports', []).map((r) => r.ref)).toEqual([later.ref])
    expect(findReport(old.ref)).toBeUndefined()
  })

  it('migre une ancienne entrée : la propriété contact est retirée du stockage', () => {
    const r = submitReport(report, NOW)
    writeFromOtherTab('reports', [{ ...r, contact: { fullName: 'Salma Bennani', cin: 'BE****12', phone: '0612345678' } }])
    storageEvent('reports')
    expect(myReports()[0]).toEqual(r)
    expectNoIdentity(raw('reports'))
  })

  it("ne réécrit pas la clé quand rien n'a changé (pas de boucle d'événements entre onglets)", () => {
    submitReport(report, NOW)
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    storageEvent('reports')
    expect(setItem).not.toHaveBeenCalled()
  })

  it('efface les dossiers et vérifie la suppression', () => {
    submitReport(report, NOW)
    expect(resetReports()).toBe(true)
    expect(raw('reports')).toBeNull()
    expect(myReports()).toEqual([])
  })

  it("signale un effacement impossible au lieu d'annoncer un succès", () => {
    const r = submitReport(report, NOW)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('bloqué', 'SecurityError')
    })
    expect(resetReports()).toBe(false)
    // Rien n'a été supprimé : le dossier reste affiché.
    expect(findReport(r.ref)).toBeDefined()
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
  it('réserve un créneau sans conserver d’identité et rend le créneau indisponible', () => {
    const a = bookAppointment(booking, NOW)
    expect(a.ref).toMatch(/^RDV-\d{4}-\d{6}$/)
    expect(findAppointment(a.ref)).toEqual(a)
    expect(a).not.toHaveProperty('contact')
    expectNoIdentity(raw('appointments'))
    expect(isSlotTaken('maarif', '2026-11-17', '09:00')).toBe(true)
    expect(isSlotTaken('maarif', '2026-11-17', '09:30')).toBe(false)
  })

  it('purge un rendez-vous de la veille (heure de Casablanca) et garde celui du jour', () => {
    const entry = { ref: 'RDV-2026-000001', officeId: 'maarif', procedureId: 'birth-certificate', slot: '11:30', createdAt: '2026-11-10T10:00:00.000Z' }
    writeFromOtherTab('appointments', [
      { ...entry, date: '2026-11-13' },
      { ...entry, ref: 'RDV-2026-000002', date: '2026-11-14' },
    ])
    storageEvent('appointments')
    expect(allAppointments().map((a) => a.ref)).toEqual(['RDV-2026-000002'])
    expect(readJson<{ ref: string }[]>('appointments', []).map((a) => a.ref)).toEqual(['RDV-2026-000002'])
  })

  it(`purge un rendez-vous créé il y a plus de ${RETENTION_DAYS} jours`, () => {
    const entry = { ref: 'RDV-2026-000001', officeId: 'maarif', procedureId: 'birth-certificate', date: '2026-12-20', slot: '09:00' }
    writeFromOtherTab('appointments', [{ ...entry, createdAt: new Date(NOW.getTime() - 31 * DAY).toISOString() }])
    storageEvent('appointments')
    expect(findAppointment('RDV-2026-000001')).toBeUndefined()
    expect(readJson('appointments', null)).toEqual([])
  })

  it('migre un ancien rendez-vous : la propriété contact est retirée du stockage', () => {
    const a = bookAppointment(booking, NOW)
    writeFromOtherTab('appointments', [{ ...a, contact: { fullName: 'Salma Bennani', cin: 'BE****12', phone: '0612345678' } }])
    storageEvent('appointments')
    expect(findAppointment(a.ref)).toEqual(a)
    expectNoIdentity(raw('appointments'))
  })

  it('efface les rendez-vous et vérifie la suppression', () => {
    bookAppointment(booking, NOW)
    expect(resetAppointments()).toBe(true)
    expect(raw('appointments')).toBeNull()
    expect(isSlotTaken('maarif', '2026-11-17', '09:00')).toBe(false)
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
