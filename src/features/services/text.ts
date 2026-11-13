import type { Dict } from '../../i18n/types'
import type { Procedure } from './procedures'

/** Textes d'une démarche dans la langue courante. */
export function procedureText(t: Dict, procedure: Procedure) {
  return t.services.procedures[procedure.id]
}

/** Libellés des pièces à fournir, dans l'ordre défini par la démarche. */
export function documentLabels(t: Dict, procedure: Procedure): { key: string; label: string }[] {
  const labels = t.services.procedures[procedure.id].documents as Record<string, string>
  return procedure.documents.map((key) => ({ key, label: labels[key] }))
}

/** Minuscules sans accents ni signes diacritiques, pour une recherche tolérante. */
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}
