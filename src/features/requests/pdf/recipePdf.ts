import { jsPDF } from 'jspdf'
import type { MedRequest, ServiceRecord, SystemSettings } from '@/core/api/types'
import { addLabelValue, addLabelValueRow, addSignatureRow, drawHeader, hexToRgb, loadLogoDataUrl, MARGIN } from './pdfHelpers'

export async function generateRecipePdf(request: MedRequest, record: ServiceRecord, settings: SystemSettings | null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const accentRgb = hexToRgb(settings?.accent ?? '#2563eb')
  const logoDataUrl = await loadLogoDataUrl(settings?.logoUrl)

  let y = drawHeader(doc, {
    clinicName: settings?.clinicName || 'Atención Domiciliaria',
    logoDataUrl,
    accentRgb,
    title: 'RÉCIPE',
    subtitle: `Servicio ${request.id}`,
  })

  y = addLabelValueRow(doc, y, [
    { label: 'Nombre y apellido', value: request.patient.name },
    { label: 'C.I.', value: record.affiliate.idNumber },
    { label: 'Edad', value: `${request.patient.age} años` },
  ])
  y += 4

  y = addLabelValue(doc, y, 'Récipe', record.recipeText, { placeholder: 'No se han asignado récipes' })
  y += 3
  y = addLabelValue(doc, y, 'Indicaciones', record.indicationsText, { placeholder: 'No se han asignado indicaciones' })

  y += 10
  addSignatureRow(doc, y, [
    { label: `Médico${request.doctor ? ` — ${request.doctor.name}` : ''}`, dataUrl: record.doctorSignatureDataUrl, signedAt: record.doctorSignedAt },
  ])

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(161, 161, 170)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })}`, MARGIN, 290)

  doc.save(`recipe-${request.id}.pdf`)
}
