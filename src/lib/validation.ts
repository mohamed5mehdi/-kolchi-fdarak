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

/** Téléphone marocain : 0 ou +212 suivi d'un numéro en 5, 6 ou 7 et de 8 chiffres. */
export function normalizePhone(value: string): string {
  const digits = compact(value).replace(/^\+212|^00212/, '0')
  return digits
}

export function isValidPhone(value: string): boolean {
  return /^0[5-7]\d{8}$/.test(normalizePhone(value))
}

/** Affiche un numéro sous la forme 06 12 34 56 78. */
export function formatPhone(value: string): string {
  const n = normalizePhone(value)
  return /^\d{10}$/.test(n) ? n.replace(/(\d{2})(?=\d)/g, '$1 ').trim() : value
}

export function isFilled(value: string, min = 1): boolean {
  return value.trim().length >= min
}
