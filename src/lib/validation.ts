/** Retire espaces, points et tirets d'une saisie libre. */
export function compact(value: string): string {
  return value.replace(/[\s.-]/g, '')
}

/** CIN marocaine : 1 ou 2 lettres suivies de 4 à 6 chiffres (ex. BE899512). */
export function normalizeCin(value: string): string {
  return compact(value).toUpperCase()
}

export function isValidCin(value: string): boolean {
  return /^[A-Z]{1,2}\d{4,6}$/.test(normalizeCin(value))
}

/** Téléphone marocain : 0 ou +212 suivi de 9 chiffres. */
export function normalizePhone(value: string): string {
  return compact(value).replace(/^\+212|^00212/, '0')
}

/** Format de mobile marocain : 06 ou 07 suivi de 8 chiffres (les fixes en 05 sont refusés). */
export function isValidPhone(value: string): boolean {
  return /^0[67]\d{8}$/.test(normalizePhone(value))
}

/** Affiche un numéro sous la forme 06 12 34 56 78. */
export function formatPhone(value: string): string {
  const n = normalizePhone(value)
  return /^\d{10}$/.test(n) ? n.replace(/(\d{2})(?=\d)/g, '$1 ').trim() : value
}

export function isFilled(value: string, min = 1): boolean {
  return value.trim().length >= min
}

export interface Contact {
  fullName: string
  cin: string
  phone: string
}

export const NAME_MIN = 2
export const NAME_MAX = 80

/** Règles communes à tous les formulaires : renvoie les champs invalides. */
export function invalidContactFields(c: Contact): Array<keyof Contact> {
  const bad: Array<keyof Contact> = []
  const name = c.fullName.trim()
  if (name.length < NAME_MIN || name.length > NAME_MAX) bad.push('fullName')
  if (!isValidCin(c.cin)) bad.push('cin')
  if (!isValidPhone(c.phone)) bad.push('phone')
  return bad
}
