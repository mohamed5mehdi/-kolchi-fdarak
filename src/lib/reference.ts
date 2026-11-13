export type RefPrefix = 'KF' | 'RDV'

/** Format d'une référence : KF-2026-004817 (signalement) ou RDV-2026-000213 (rendez-vous). */
const REF_PATTERN = /^(KF|RDV)-(\d{4})-(\d{6})$/

/**
 * Construit une référence unique parmi celles déjà utilisées.
 * `random` est injectable pour rendre les tests déterministes.
 */
export function createRef(
  prefix: RefPrefix,
  taken: Iterable<string>,
  now = new Date(),
  random: () => number = Math.random,
): string {
  const used = new Set(taken)
  for (let i = 0; i < 1000; i++) {
    const n = Math.floor(random() * 1_000_000)
    const ref = `${prefix}-${now.getFullYear()}-${String(n).padStart(6, '0')}`
    if (!used.has(ref)) return ref
  }
  throw new Error('Impossible de générer une référence libre')
}

/**
 * Normalise une référence saisie à la main : casse, espaces, tirets oubliés.
 * « kf 2026 4817 » → « KF-2026-004817 ». Renvoie null si la saisie ne ressemble pas à une référence.
 */
export function normalizeRef(input: string): string | null {
  const m = input
    .toUpperCase()
    .trim()
    .match(/^(KF|RDV)[\s-]*(\d{4})[\s-]*(\d{1,6})$/)
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3].padStart(6, '0')}`
}

export function isRef(value: string): boolean {
  return REF_PATTERN.test(value)
}
