import { jsPDF } from 'jspdf'
import type { MedRequest, ServiceRecord, SystemSettings } from '@/core/api/types'
import { addLabelValue, addLabelValueRow, addSignatureRow, drawHeader, hexToRgb, loadLogoDataUrl } from './pdfHelpers'

export async function generateInterconsultaPdf(request: MedRequest, record: ServiceRecord, settings: SystemSettings | null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const accentRgb = hexToRgb(settings?.accent ?? '#2563eb')
  const logoDataUrl = await loadLogoDataUrl(settings?.logoUrl)
  const a = record.affiliate

  let y = drawHeader(doc, {
    clinicName: settings?.clinicName || 'Atención Domiciliaria',
    logoDataUrl,
    accentRgb,
    title: 'INFORME DE INTERCONSULTA',
    subtitle: `Caso ${request.id} · ${new Date().toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
  })

  y = addLabelValue(doc, y, 'Empresa / Contratante', a.policyHolder)
  y = addLabelValueRow(doc, y, [
    { label: 'Nombres y apellidos', value: request.patient.name },
    { label: 'Edad', value: `${request.patient.age} años` },
    { label: 'Sexo', value: a.sex },
  ])
  y = addLabelValue(doc, y, 'C.I.', a.idNumber)
  y += 2

  y = addLabelValue(doc, y, 'Informe', record.interconsultaText, { placeholder: 'Sin contenido registrado' })

  y += 10
  addSignatureRow(doc, y, [
    { label: `Médico${request.doctor ? ` — ${request.doctor.name}` : ''} · CI / M.P.P.S.`, dataUrl: record.doctorSignatureDataUrl, signedAt: record.doctorSignedAt },
  ])

  doc.save(`informe-interconsulta-${request.id}.pdf`)
}
