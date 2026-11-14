import { useSyncExternalStore } from 'react'
import { DISTRICTS, isInCasablanca } from '../data/districts'
import { sampleReports } from '../data/sampleReports'
import type { DistrictId, LatLng, Report, ReportCategory } from '../data/types'
import { createRef } from '../lib/reference'
import { StoreError, isExpired, onExternalChange, readList, removeKeys, writeJson } from '../lib/storage'
import { invalidContactFields, type Contact } from '../lib/validation'

export { RETENTION_DAYS } from '../lib/storage'

const KEY = 'reports'

export const REPORT_CATEGORIES: ReportCategory[] = ['road', 'lighting', 'cleanliness', 'green', 'water']
export const DESCRIPTION_MIN = 15
export const DESCRIPTION_MAX = 500
export const STREET_MIN = 3
export const STREET_MAX = 120

export interface NewReport {
  category: ReportCategory
  district: DistrictId
  street: string
  position: LatLng
  description: string
  /** Sert uniquement à la validation du formulaire : n'est ni conservé ni renvoyé. */
  contact: Contact
}

/** Rejette tout ce qui ne ressemble pas à un dossier (ancien format, données modifiées à la main). */
function isReport(value: unknown): value is Report {
  const r = value as Report
  return (
    typeof r === 'object' &&
    r !== null &&
    typeof r.ref === 'string' &&
    REPORT_CATEGORIES.includes(r.category) &&
    DISTRICTS.some((d) => d.id === r.district) &&
    Array.isArray(r.position) &&
    r.position.length === 2 &&
    r.position.every(Number.isFinite) &&
    typeof r.createdAt === 'string' &&
    Array.isArray(r.history) &&
    r.history.length > 0
  )
}

/**
 * Lit le stockage (source de vérité partagée entre onglets) en écartant les entrées invalides
 * et celles créées il y a plus de RETENTION_DAYS jours. `now` est injectable pour les tests.
 */
function load(now = new Date()): Report[] {
  return readList(KEY, isReport, (r) => isExpired(r.createdAt, now))
}

const samples = sampleReports()
let mine: Report[] = load()
let snapshot: Report[] = [...mine, ...samples]
const listeners = new Set<() => void>()

function publish(next: Report[]) {
  mine = next
  snapshot = [...mine, ...samples]
  listeners.forEach((l) => l())
}

// Un dossier déposé dans un autre onglet apparaît ici sans rechargement.
if (typeof window !== 'undefined') onExternalChange(KEY, () => publish(load()))

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Tous les dossiers : ceux déposés depuis ce navigateur d'abord, puis les dossiers existants. */
export function allReports(): Report[] {
  return snapshot
}

export function findReport(ref: string): Report | undefined {
  return snapshot.find((r) => r.ref === ref)
}

/** Dossiers déposés depuis ce navigateur. */
export function myReports(): Report[] {
  return mine
}

/** Règles métier d'un signalement ; renvoie la liste des champs refusés. */
export function invalidReportFields(input: NewReport): string[] {
  const bad: string[] = []
  if (!REPORT_CATEGORIES.includes(input.category)) bad.push('category')
  if (!DISTRICTS.some((d) => d.id === input.district)) bad.push('district')
  if (!Array.isArray(input.position) || !input.position.every(Number.isFinite) || !isInCasablanca(input.position))
    bad.push('position')
  const street = input.street.trim().length
  if (street < STREET_MIN || street > STREET_MAX) bad.push('street')
  const description = input.description.trim().length
  if (description < DESCRIPTION_MIN || description > DESCRIPTION_MAX) bad.push('description')
  bad.push(...invalidContactFields(input.contact))
  return bad
}

/**
 * Enregistre un signalement et renvoie le dossier avec sa référence.
 * Lève une StoreError si une règle n'est pas respectée ou si le stockage refuse l'écriture :
 * on ne remet jamais une référence qui ne serait pas retrouvable ensuite.
 */
export function submitReport(input: NewReport, now = new Date()): Report {
  const bad = invalidReportFields(input)
  if (bad.length > 0) throw new StoreError('invalid', `Signalement refusé : ${bad.join(', ')}`)

  // Relecture juste avant l'écriture : un autre onglet a pu enregistrer entre-temps.
  const current = load(now)
  const at = now.toISOString()
  const report: Report = {
    category: input.category,
    district: input.district,
    position: input.position,
    street: input.street.trim(),
    description: input.description.trim(),
    // Minimisation : nom, CIN et téléphone servent à la validation et ne sont jamais conservés.
    ref: createRef('KF', [...current, ...samples].map((r) => r.ref), now),
    createdAt: at,
    status: 'received',
    history: [{ status: 'received', at }],
  }
  const next = [report, ...current]
  if (!writeJson(KEY, next)) throw new StoreError('storage', 'Stockage du navigateur indisponible')
  publish(next)
  return report
}

export function useReports(): Report[] {
  return useSyncExternalStore(subscribe, allReports, allReports)
}

/**
 * Efface les dossiers de ce navigateur (page À propos, tests).
 * Renvoie false si la suppression n'a pas pu être vérifiée ; la liste affichée reflète alors ce qui reste stocké.
 */
export function resetReports(): boolean {
  const ok = removeKeys([KEY])
  publish(ok ? [] : load())
  return ok
}
