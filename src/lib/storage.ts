const PREFIX = 'kolchi-fdarak:'

/** Lit une valeur JSON du localStorage ; renvoie `fallback` si absente, illisible ou stockage bloqué. */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
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
