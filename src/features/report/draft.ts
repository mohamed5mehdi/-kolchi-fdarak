import { isInCasablanca } from '../../data/districts'
import type { DistrictId, LatLng, ReportCategory } from '../../data/types'
import type { Dict } from '../../i18n/types'
import { invalidContactFields, isFilled } from '../../lib/validation'
import { DESCRIPTION_MIN, STREET_MIN } from '../../state/reports'
import type { FieldError } from '../../ui/ErrorSummary'

export type Step = 1 | 2 | 3 | 4

// Les seuils viennent de la couche de données : l'interface et l'enregistrement appliquent la même règle.
export { DESCRIPTION_MAX, DESCRIPTION_MIN, REPORT_CATEGORIES as CATEGORIES } from '../../state/reports'

/** Service municipal qui reçoit chaque catégorie (clé de common.units). */
export const UNIT_BY_CATEGORY: Record<ReportCategory, keyof Dict['common']['units']> = {
  road: 'roads',
  lighting: 'lighting',
  cleanliness: 'cleanliness',
  green: 'green',
  water: 'water',
}

export interface Draft {
  category: ReportCategory | null
  district: DistrictId | ''
  position: LatLng | null
  street: string
  description: string
  fullName: string
  cin: string
  phone: string
}

/** Identité pré-remplie, modifiable, pour que le parcours se fasse sans ressaisie. */
export function emptyDraft(): Draft {
  return {
    category: null,
    district: '',
    position: null,
    street: '',
    description: '',
    fullName: 'Salma Bennani',
    cin: 'BE899512',
    phone: '06 12 34 56 78',
  }
}

export function validateStep(step: Step, d: Draft, t: Dict): FieldError[] {
  const errors: FieldError[] = []
  if (step === 1 && !d.category) errors.push({ field: 'report-category', message: t.report.category.error })
  if (step === 2) {
    if (!d.position) errors.push({ field: 'report-map', message: t.report.location.mapError })
    else if (!isInCasablanca(d.position)) errors.push({ field: 'report-map', message: t.report.location.outsideError })
    if (!d.district) errors.push({ field: 'report-district', message: t.report.location.districtError })
    if (!isFilled(d.street, STREET_MIN)) errors.push({ field: 'report-street', message: t.report.location.streetError })
  }
  if (step === 3) {
    if (!isFilled(d.description, DESCRIPTION_MIN))
      errors.push({ field: 'report-description', message: t.report.details.descriptionError })
    const contact = invalidContactFields({ fullName: d.fullName, cin: d.cin, phone: d.phone })
    if (contact.includes('fullName')) errors.push({ field: 'report-name', message: t.common.form.fullNameError })
    if (contact.includes('cin')) errors.push({ field: 'report-cin', message: t.common.form.cinError })
    if (contact.includes('phone')) errors.push({ field: 'report-phone', message: t.common.form.phoneError })
  }
  return errors
}

export function errorFor(errors: FieldError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message
}

/** Première étape dont les données ne passent plus la validation, ou null si le brouillon est complet. */
export function firstInvalidStep(d: Draft, t: Dict): Step | null {
  for (const step of [1, 2, 3] as const) if (validateStep(step, d, t).length > 0) return step
  return null
}
