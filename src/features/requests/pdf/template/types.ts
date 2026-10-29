/**
 * A document template is data, not code: an admin edits it, the backend stores
 * it as jsonb, and one generic renderer draws any of them. Fields can only be
 * bound to values from the closed catalog in bindings.ts, so a template can
 * never reach data outside the service record.
 */

export const DOC_TYPES = ['recipe', 'report', 'interconsulta'] as const
export type DocType = typeof DOC_TYPES[number]

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  recipe: 'Récipe',
  report: 'Informe de atención médica',
  interconsulta: 'Informe de interconsulta',
}

/** Short fields share a row: "half" = 2 per row, "third" = 3 per row. "full" is a wrapped, full-width paragraph. */
export type FieldWidth = 'full' | 'half' | 'third'

export interface TemplateField {
  id: string
  label: string
  /** Id from the binding catalog. */
  source: string
  width: FieldWidth
  /** Shown in italics when the value is empty (full-width fields only). */
  placeholder?: string
}

export interface SectionBlock {
  type: 'section'
  id: string
  /** Rendered as an uppercase accent-colored heading with a rule; omit for an untitled group. */
  title?: string
  fields: TemplateField[]
  /** Extra vertical space (mm) after the section. */
  spaceAfter?: number
}

export interface SignatureItem {
  label: string
  who: 'doctor' | 'affiliate'
  /** Appends " — <doctor name>" when the request has an assigned doctor. */
  appendDoctorName?: boolean
  /** Fixed text appended to the label. */
  suffix?: string
}

export interface SignaturesBlock {
  type: 'signatures'
  id: string
  items: SignatureItem[]
  /** Extra vertical space (mm) before the signature row. */
  spaceBefore?: number
  /** If less than this (mm) remains on the page, start a new one first. */
  keepTogether?: number
}

export type TemplateBlock = SectionBlock | SignaturesBlock

export interface DocumentDefinition {
  version: 1
  header: {
    /** Printed at the right of the header, e.g. "RÉCIPE". */
    title: string
    /** Supports {id} (request id) and {date} (today, dd/mm/yyyy). */
    subtitle?: string
    showLogo: boolean
    showClinicName: boolean
    /** Hex color; falls back to the clinic accent from settings. */
    accent?: string
  }
  blocks: TemplateBlock[]
  footer?: { showDate: boolean }
}
