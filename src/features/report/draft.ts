import { isInCasablanca } from '../../data/districts'
import type { DistrictId, LatLng, ReportCategory } from '../../data/types'
import type { Dict } from '../../i18n/types'
import { isFilled, isValidCin, isValidPhone } from '../../lib/validation'
import type { FieldError } from '../../ui/ErrorSummary'

export type Step = 1 | 2 | 3 | 4

export const CATEGORIES: ReportCategory[] = ['road', 'lighting', 'cleanliness', 'green', 'water']

export const DESCRIPTION_MIN = 15
export const DESCRIPTION_MAX = 500

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
    if (!isFilled(d.street, 3)) errors.push({ field: 'report-street', message: t.report.location.streetError })
  }
  if (step === 3) {
    if (!isFilled(d.description, DESCRIPTION_MIN))
      errors.push({ field: 'report-description', message: t.report.details.descriptionError })
    if (!isFilled(d.fullName, 2)) errors.push({ field: 'report-name', message: t.common.form.fullNameError })
    if (!isValidCin(d.cin)) errors.push({ field: 'report-cin', message: t.common.form.cinError })
    if (!isValidPhone(d.phone)) errors.push({ field: 'report-phone', message: t.common.form.phoneError })
  }
  return errors
}

export function errorFor(errors: FieldError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message
}
