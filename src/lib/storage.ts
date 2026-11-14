const PREFIX = 'kolchi-fdarak:'

/** Durée de conservation des dossiers et rendez-vous de cet appareil, en jours après leur création. */
export const RETENTION_DAYS = 30

const DAY_MS = 24 * 60 * 60 * 1000

/** Date d'effacement automatique d'une entrée créée à `createdAt` (date ISO). */
export function expiresAt(createdAt: string): Date {
  return new Date(Date.parse(createdAt) + RETENTION_DAYS * DAY_MS)
}

/** Vrai si l'entrée a dépassé la durée de conservation (ou si sa date de création est illisible). */
export function isExpired(createdAt: string, now: Date): boolean {
  const t = expiresAt(createdAt).getTime()
  return Number.isNaN(t) || t <= now.getTime()
}

/**
 * Lit une valeur JSON du localStorage. Renvoie `fallback` si elle est absente, illisible,
 * refusée par `guard` (données corrompues ou d'un ancien format) ou si le stockage est bloqué.
 */
export function readJson<T>(key: string, fallback: T, guard?: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    const value: unknown = JSON.parse(raw)
    return guard && !guard(value) ? fallback : (value as T)
  } catch {
    return fallback
  }
}

/** Copie de l'entrée sans la propriété `contact` des anciennes versions (nom, CIN masquée, téléphone). */
function withoutContact<T extends object>(entry: T): T {
  if (!('contact' in entry)) return entry
  const copy: Record<string, unknown> = { ...entry }
  delete copy.contact
  return copy as T
}

/**
 * Lit une liste du stockage en écartant les entrées invalides ou expirées et en retirant les données
 * d'identité laissées par une ancienne version. La clé n'est réécrite que si quelque chose a changé :
 * une réécriture systématique déclencherait un événement `storage` dans les autres onglets, qui
 * relisent à leur tour, et ainsi de suite.
 */
export function readList<T extends object>(
  key: string,
  isEntry: (value: unknown) => value is T,
  expired: (entry: T) => boolean,
): T[] {
  const raw = readJson<unknown[]>(key, [], (v): v is unknown[] => Array.isArray(v))
  const kept = raw
    .filter(isEntry)
    .filter((entry) => !expired(entry))
    .map(withoutContact)
  const changed = kept.length !== raw.length || kept.some((entry, i) => entry !== raw[i])
  if (changed) writeJson(key, kept)
  return kept
}

/** Écrit une valeur JSON ; renvoie false si le stockage est indisponible (navigation privée, quota). */
export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Supprime des clés puis vérifie qu'elles ont bien disparu.
 * Renvoie false si le stockage refuse la suppression : l'interface ne doit pas annoncer un effacement non vérifié.
 */
export function removeKeys(keys: string[]): boolean {
  try {
    for (const key of keys) localStorage.removeItem(PREFIX + key)
    return keys.every((key) => localStorage.getItem(PREFIX + key) === null)
  } catch {
    return false
  }
}

/** Prévient quand un autre onglet modifie la clé (l'événement `storage` n'est pas émis dans l'onglet auteur). */
export function onExternalChange(key: string, callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === null || e.key === PREFIX + key) callback()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

export type StoreErrorCode = 'invalid' | 'conflict' | 'storage'

/** Échec d'enregistrement : données refusées par une règle métier, conflit (créneau pris) ou stockage indisponible. */
export class StoreError extends Error {
  readonly code: StoreErrorCode

  constructor(code: StoreErrorCode, message: string) {
    super(message)
    this.name = 'StoreError'
    this.code = code
  }
}
