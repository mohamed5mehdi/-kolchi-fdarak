import { useSyncExternalStore } from 'react'
import { sampleReports } from '../data/sampleReports'
import type { DistrictId, LatLng, Report, ReportCategory } from '../data/types'
import { createRef } from '../lib/reference'
import { readJson, writeJson } from '../lib/storage'
import { normalizeCin, normalizePhone } from '../lib/validation'

const KEY = 'reports'

export interface NewReport {
  category: ReportCategory
  district: DistrictId
  street: string
  position: LatLng
  description: string
  contact: { fullName: string; cin: string; phone: string }
}

const samples = sampleReports()
let mine: Report[] = readJson<Report[]>(KEY, [])
let snapshot: Report[] = [...mine, ...samples]
const listeners = new Set<() => void>()

function commit(next: Report[]) {
  mine = next
  snapshot = [...mine, ...samples]
  writeJson(KEY, mine)
  listeners.forEach((l) => l())
}

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

/** Enregistre un signalement dans le navigateur et renvoie le dossier créé avec sa référence. */
export function submitReport(input: NewReport, now = new Date()): Report {
  const at = now.toISOString()
  const report: Report = {
    ...input,
    street: input.street.trim(),
    description: input.description.trim(),
    contact: {
      fullName: input.contact.fullName.trim(),
      cin: normalizeCin(input.contact.cin),
      phone: normalizePhone(input.contact.phone),
    },
    ref: createRef('KF', snapshot.map((r) => r.ref), now),
    createdAt: at,
    status: 'received',
    history: [{ status: 'received', at }],
  }
  commit([report, ...mine])
  return report
}

/** Dossiers déposés depuis ce navigateur. */
export function myReports(): Report[] {
  return mine
}

export function useReports(): Report[] {
  return useSyncExternalStore(subscribe, allReports, allReports)
}

/** Réservé aux tests : repart d'un état vierge. */
export function resetReports() {
  commit([])
}
