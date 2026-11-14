const PREFIX = 'kolchi-fdarak:'

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

/** Écrit une valeur JSON ; renvoie false si le stockage est indisponible (navigation privée, quota). */
export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
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
