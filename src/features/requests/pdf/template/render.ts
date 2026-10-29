import { jsPDF } from 'jspdf'
import type { MedRequest, ServiceRecord, SystemSettings } from '@/core/api/types'
import {
  addLabelValue, addLabelValueRow, addSectionTitle, addSignatureRow,
  drawHeader, ensureSpace, hexToRgb, loadLogoDataUrl, MARGIN,
} from '../pdfHelpers'
import { resolveBinding, type BindingContext } from './bindings'
import { DEFAULT_TEMPLATES, DOC_FILE_PREFIX } from './defaults'
import type { DocType, DocumentDefinition, SectionBlock, SignaturesBlock, TemplateField } from './types'

const COLUMNS: Record<'half' | 'third', number> = { half: 2, third: 3 }

/** Packs consecutive short fields of the same width into rows; full-width fields stand alone. */
function groupFields(fields: TemplateField[]): TemplateField[][] {
  const groups: TemplateField[][] = []
  let row: TemplateField[] = []
  const flush = () => { if (row.length) { groups.push(row); row = [] } }

  for (const field of fields) {
    if (field.width === 'full') {
      flush()
      groups.push([field])
      continue
    }
    if (row.length && (row[0].width !== field.width || row.length >= COLUMNS[field.width])) flush()
    row.push(field)
  }
  flush()
  return groups
}

function drawSection(doc: jsPDF, y: number, block: SectionBlock, ctx: BindingContext, accent: [number, number, number]): number {
  if (block.title) y = addSectionTitle(doc, y, block.title, accent)

  for (const group of groupFields(block.fields)) {
    if (group[0].width === 'full') {
      const field = group[0]
      y = addLabelValue(doc, y, field.label, resolveBinding(field.source, ctx), field.placeholder ? { placeholder: field.placeholder } : {})
    } else {
      y = addLabelValueRow(doc, y, group.map((field) => ({ label: field.label, value: resolveBinding(field.source, ctx) })))
    }
  }
  return y + (block.spaceAfter ?? 0)
}

function drawSignatures(doc: jsPDF, y: number, block: SignaturesBlock, ctx: BindingContext): number {
  if (block.keepTogether) y = ensureSpace(doc, y, block.keepTogether)
  y += block.spaceBefore ?? 0
  const { request, record } = ctx
  return addSignatureRow(doc, y, block.items.map((item) => ({
    label: `${item.label}${item.appendDoctorName && request.doctor ? ` — ${request.doctor.name}` : ''}${item.suffix ?? ''}`,
    dataUrl: item.who === 'doctor' ? record.doctorSignatureDataUrl : record.affiliateSignatureDataUrl,
    signedAt: item.who === 'doctor' ? record.doctorSignedAt : record.affiliateSignedAt,
  })))
}

function fillSubtitle(template: string, requestId: string): string {
  const date = new Date().toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return template.replace(/\{id\}/g, requestId).replace(/\{date\}/g, date)
}

/** Draws any document definition. The definition is data: unknown bindings print as empty, never as an error. */
export async function renderDocument(
  docType: DocType,
  definition: DocumentDefinition,
  request: MedRequest,
  record: ServiceRecord,
  settings: SystemSettings | null,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const accentRgb = hexToRgb(definition.header.accent ?? settings?.accent ?? '#2563eb')
  const logoDataUrl = definition.header.showLogo ? await loadLogoDataUrl(settings?.logoUrl) : null
  const ctx: BindingContext = { request, record }

  let y = drawHeader(doc, {
    clinicName: definition.header.showClinicName ? settings?.clinicName || 'Atención Domiciliaria' : '',
    logoDataUrl,
    accentRgb,
    title: definition.header.title,
    subtitle: definition.header.subtitle ? fillSubtitle(definition.header.subtitle, request.id) : undefined,
  })

  for (const block of definition.blocks) {
    y = block.type === 'section' ? drawSection(doc, y, block, ctx, accentRgb) : drawSignatures(doc, y, block, ctx)
  }

  if (definition.footer?.showDate) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(161, 161, 170)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })}`, MARGIN, 290)
  }

  doc.save(`${DOC_FILE_PREFIX[docType]}-${request.id}.pdf`)
}

export function renderWithDefault(docType: DocType, request: MedRequest, record: ServiceRecord, settings: SystemSettings | null, template?: DocumentDefinition | null) {
  return renderDocument(docType, template ?? DEFAULT_TEMPLATES[docType], request, record, settings)
}
