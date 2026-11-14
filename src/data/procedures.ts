import type { OfficeService } from './types'

export type ProcedureId =
  | 'birth-certificate'
  | 'birth-extract'
  | 'birth-declaration'
  | 'signature-legalisation'
  | 'certified-copy'
  | 'residence-certificate'
  | 'minor-works'
  | 'administrative-certificate'

export interface Procedure {
  id: ProcedureId
  officeService: OfficeService
  /** Clés des pièces à fournir ; les libellés sont dans services.procedures.<id>.documents. */
  documents: string[]
  /** Démarche traitée sur rendez-vous. */
  bookable: boolean
  /** Une liste de pièces fixe permet de préparer le dossier à l'avance. */
  preparable: boolean
}

/** Démarches proposées par les guichets ; les textes sont dans les dictionnaires (services.ts). */
export const PROCEDURES: Procedure[] = [
  {
    id: 'birth-certificate',
    officeService: 'civil',
    documents: ['cin', 'actReference', 'kinship'],
    bookable: true,
    preparable: true,
  },
  {
    id: 'birth-extract',
    officeService: 'civil',
    documents: ['cin', 'actReference'],
    bookable: true,
    preparable: true,
  },
  {
    id: 'birth-declaration',
    officeService: 'civil',
    documents: ['birthNotice', 'parentsCin', 'marriageCertificate', 'familyBook'],
    bookable: true,
    preparable: true,
  },
  {
    id: 'signature-legalisation',
    officeService: 'certificates',
    documents: ['cin', 'unsignedDocument'],
    bookable: false,
    preparable: true,
  },
  {
    id: 'certified-copy',
    officeService: 'certificates',
    documents: ['cin', 'original', 'copies'],
    bookable: false,
    preparable: true,
  },
  {
    id: 'residence-certificate',
    officeService: 'certificates',
    documents: ['cin', 'proofOfAddress', 'housing'],
    bookable: true,
    preparable: true,
  },
  {
    id: 'minor-works',
    officeService: 'urbanism',
    documents: ['cin', 'ownership', 'worksDescription', 'photos'],
    bookable: true,
    preparable: true,
  },
  {
    id: 'administrative-certificate',
    officeService: 'certificates',
    documents: ['cin', 'supporting'],
    bookable: true,
    // Les justificatifs dépendent de l'objet de l'attestation : pas de liste fixe à cocher.
    preparable: false,
  },
]

export function getProcedure(id: string | null | undefined): Procedure | undefined {
  return PROCEDURES.find((p) => p.id === id)
}
