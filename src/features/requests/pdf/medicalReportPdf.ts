import { jsPDF } from 'jspdf'
import type { MedicationItem, MedRequest, OtherMedicationItem, ServiceRecord, SupplyItem, SystemSettings } from '@/core/api/types'
import {
  addLabelValue, addLabelValueRow, addSectionTitle, addSignatureRow,
  drawHeader, ensureSpace, hexToRgb, loadLogoDataUrl,
} from './pdfHelpers'

function listToText<T>(items: T[], toLine: (item: T) => string): string {
  return items.map(toLine).join('\n')
}

export async function generateMedicalReportPdf(request: MedRequest, record: ServiceRecord, settings: SystemSettings | null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const accentRgb = hexToRgb(settings?.accent ?? '#2563eb')
  const logoDataUrl = await loadLogoDataUrl(settings?.logoUrl)
  const a = record.affiliate

  let y = drawHeader(doc, {
    clinicName: settings?.clinicName || 'Atención Domiciliaria',
    logoDataUrl,
    accentRgb,
    title: 'INFORME DE ATENCIÓN MÉDICA',
    subtitle: `Caso ${request.id} · ${new Date().toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
  })

  y = addSectionTitle(doc, y, 'Datos del paciente', accentRgb)
  y = addLabelValueRow(doc, y, [
    { label: 'Nombres y apellidos', value: request.patient.name },
    { label: 'C.I.', value: a.idNumber },
    { label: 'Edad', value: `${request.patient.age} años` },
  ])
  y = addLabelValueRow(doc, y, [
    { label: 'Teléfono', value: request.patient.phone },
    { label: 'Plan', value: a.insurancePlan },
    { label: 'Ramo', value: a.insuranceBranch },
  ])
  y = addLabelValue(doc, y, 'Contratante', a.policyHolder)
  y = addLabelValue(doc, y, 'Dirección', request.address)

  y = addSectionTitle(doc, y, 'Hábitos y antecedentes médicos', accentRgb)
  y = addLabelValue(doc, y, 'Antecedentes', record.medicalBackground)

  y = addSectionTitle(doc, y, 'Evaluación del caso', accentRgb)
  y = addLabelValue(doc, y, 'Motivo de consulta', request.symptoms)
  y = addLabelValue(doc, y, 'Enfermedad actual', record.currentIllness)

  y = addSectionTitle(doc, y, 'Examen físico', accentRgb)
  const v = record.fullVitals
  y = addLabelValueRow(doc, y, [
    { label: 'TA', value: v.bp ? `${v.bp} mmHg` : '' },
    { label: 'FC', value: v.hr ? `${v.hr} lpm` : '' },
    { label: 'FR', value: v.rr ? `${v.rr} rpm` : '' },
  ])
  y = addLabelValueRow(doc, y, [
    { label: 'Temp', value: v.temp ? `${v.temp} °C` : '' },
    { label: 'SpO₂', value: v.spo2 ? `${v.spo2}%` : '' },
    { label: 'Glicemia', value: v.glucose ? `${v.glucose} mg/dL` : '' },
  ])
  y = addLabelValue(doc, y, 'Síntomas', record.symptomsList.join(', '))
  y = addLabelValue(doc, y, 'Examen físico', record.physicalExam)
  y = addLabelValue(doc, y, 'Examen funcional', record.functionalExam)

  y = addSectionTitle(doc, y, 'Diagnóstico (IDX)', accentRgb)
  y = addLabelValue(doc, y, 'Diagnóstico', record.diagnosis)
  y = addLabelValue(doc, y, 'Observaciones', record.diagnosisNotes)

  y = addSectionTitle(doc, y, 'Tratamiento aplicado', accentRgb)
  y = addLabelValue(
    doc, y, 'Medicamentos',
    listToText<MedicationItem>(record.medications, m => `• ${[m.activeIngredient, m.presentation, m.quantity].filter(Boolean).join(' — ')}`),
    { placeholder: 'No se han asignado medicamentos' },
  )
  y = addLabelValue(
    doc, y, 'Otros medicamentos',
    listToText<OtherMedicationItem>(record.otherMedications, m => `• ${[m.name, m.indications].filter(Boolean).join(' — ')}`),
    { placeholder: 'No se han asignado otros medicamentos' },
  )
  y = addLabelValue(doc, y, 'Exclusiones médicas', record.medicalExclusions)
  y = addLabelValue(
    doc, y, 'Insumos médicos',
    listToText<SupplyItem>(record.supplies, s => `• ${[s.name, s.quantity].filter(Boolean).join(' — ')}`),
    { placeholder: 'No se han asignado insumos' },
  )

  y = addSectionTitle(doc, y, 'Paraclínicos, recomendaciones y referencias', accentRgb)
  y = addLabelValue(doc, y, 'Exámenes paraclínicos', record.paraclinicalExams)
  y = addLabelValue(doc, y, 'Recomendaciones médicas', record.medicalRecommendations)
  y = addLabelValue(doc, y, 'Referencias a especialistas', record.specialistReferences)

  y = addSectionTitle(doc, y, 'Datos del servicio', accentRgb)
  y = addLabelValueRow(doc, y, [
    { label: 'Tipo de servicio', value: record.serviceType },
    { label: 'Hisopado', value: record.swabTest.type ? `${record.swabTest.type === 'particular' ? 'Particular' : 'Venemergencia'} · ${record.swabTest.result === 'positive' ? 'Positivo' : record.swabTest.result === 'negative' ? 'Negativo' : 'Sin resultado'}` : '' },
    { label: 'Proveedor', value: record.externalProvider.enabled ? record.externalProvider.providerName : '' },
  ])
  y = addLabelValueRow(doc, y, [
    { label: 'Inicio del servicio', value: [record.timing.startDate, record.timing.startTime].filter(Boolean).join(' ') },
    { label: 'Fin del servicio', value: [record.timing.endDate, record.timing.endTime].filter(Boolean).join(' ') },
    { label: 'Médico', value: request.doctor?.name ?? '' },
  ])

  y = ensureSpace(doc, y, 32)
  addSignatureRow(doc, y + 2, [
    { label: 'Firma del médico', dataUrl: record.doctorSignatureDataUrl, signedAt: record.doctorSignedAt },
    { label: 'Firma del paciente / afiliado', dataUrl: record.affiliateSignatureDataUrl, signedAt: record.affiliateSignedAt },
  ])

  doc.save(`informe-atencion-medica-${request.id}.pdf`)
}
