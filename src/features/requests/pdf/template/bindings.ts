import type { MedicationItem, MedRequest, OtherMedicationItem, ServiceRecord, SupplyItem } from '@/core/api/types'

export interface BindingContext {
  request: MedRequest
  record: ServiceRecord
}

export interface Binding {
  label: string
  group: string
  /** Long, free-text values suit a full-width field; short ones fit in a row. */
  kind: 'short' | 'long'
  resolve: (ctx: BindingContext) => string
}

const bullets = <T,>(items: T[], line: (item: T) => string) => items.map((i) => `• ${line(i)}`).join('\n')
const join = (parts: (string | undefined)[], sep: string) => parts.filter(Boolean).join(sep)
const withUnit = (value: string, unit: string) => (value ? `${value}${unit}` : '')

const SWAB_KIND: Record<string, string> = { particular: 'Particular', venemergencia: 'Venemergencia' }
const SWAB_RESULT: Record<string, string> = { positive: 'Positivo', negative: 'Negativo' }

/** Closed catalog: the only data a template field may show. */
export const BINDINGS: Record<string, Binding> = {
  'patient.name': { label: 'Nombre del paciente', group: 'Paciente', kind: 'short', resolve: ({ request }) => request.patient.name },
  'patient.age': { label: 'Edad', group: 'Paciente', kind: 'short', resolve: ({ request }) => `${request.patient.age} años` },
  'patient.phone': { label: 'Teléfono', group: 'Paciente', kind: 'short', resolve: ({ request }) => request.patient.phone },
  'patient.address': { label: 'Dirección', group: 'Paciente', kind: 'long', resolve: ({ request }) => request.address },
  'affiliate.idNumber': { label: 'Cédula', group: 'Afiliado', kind: 'short', resolve: ({ record }) => record.affiliate.idNumber },
  'affiliate.sex': { label: 'Sexo', group: 'Afiliado', kind: 'short', resolve: ({ record }) => record.affiliate.sex },
  'affiliate.insurancePlan': { label: 'Plan', group: 'Afiliado', kind: 'short', resolve: ({ record }) => record.affiliate.insurancePlan },
  'affiliate.insuranceBranch': { label: 'Ramo', group: 'Afiliado', kind: 'short', resolve: ({ record }) => record.affiliate.insuranceBranch },
  'affiliate.policyHolder': { label: 'Contratante', group: 'Afiliado', kind: 'long', resolve: ({ record }) => record.affiliate.policyHolder },

  'request.symptoms': { label: 'Motivo de consulta', group: 'Solicitud', kind: 'long', resolve: ({ request }) => request.symptoms },
  'request.doctorName': { label: 'Médico asignado', group: 'Solicitud', kind: 'short', resolve: ({ request }) => request.doctor?.name ?? '' },

  'record.serviceType': { label: 'Tipo de servicio', group: 'Servicio', kind: 'short', resolve: ({ record }) => record.serviceType },
  'record.swab': {
    label: 'Hisopado', group: 'Servicio', kind: 'short',
    resolve: ({ record }) => {
      const s = record.swabTest
      return s.type ? `${SWAB_KIND[s.type] ?? s.type} · ${SWAB_RESULT[s.result] ?? 'Sin resultado'}` : ''
    },
  },
  'record.provider': {
    label: 'Proveedor', group: 'Servicio', kind: 'short',
    resolve: ({ record }) => (record.externalProvider.enabled ? record.externalProvider.providerName : ''),
  },
  'record.start': { label: 'Inicio del servicio', group: 'Servicio', kind: 'short', resolve: ({ record }) => join([record.timing.startDate, record.timing.startTime], ' ') },
  'record.end': { label: 'Fin del servicio', group: 'Servicio', kind: 'short', resolve: ({ record }) => join([record.timing.endDate, record.timing.endTime], ' ') },

  'record.medicalBackground': { label: 'Antecedentes', group: 'Clínico', kind: 'long', resolve: ({ record }) => record.medicalBackground },
  'record.currentIllness': { label: 'Enfermedad actual', group: 'Clínico', kind: 'long', resolve: ({ record }) => record.currentIllness },
  'record.symptomsList': { label: 'Síntomas', group: 'Clínico', kind: 'long', resolve: ({ record }) => record.symptomsList.join(', ') },
  'record.physicalExam': { label: 'Examen físico', group: 'Clínico', kind: 'long', resolve: ({ record }) => record.physicalExam },
  'record.functionalExam': { label: 'Examen funcional', group: 'Clínico', kind: 'long', resolve: ({ record }) => record.functionalExam },
  'record.diagnosis': { label: 'Diagnóstico', group: 'Clínico', kind: 'long', resolve: ({ record }) => record.diagnosis },
  'record.diagnosisNotes': { label: 'Observaciones del diagnóstico', group: 'Clínico', kind: 'long', resolve: ({ record }) => record.diagnosisNotes },

  'vitals.bp': { label: 'Tensión arterial', group: 'Signos vitales', kind: 'short', resolve: ({ record }) => withUnit(record.fullVitals.bp, ' mmHg') },
  'vitals.hr': { label: 'Frecuencia cardíaca', group: 'Signos vitales', kind: 'short', resolve: ({ record }) => withUnit(record.fullVitals.hr, ' lpm') },
  'vitals.rr': { label: 'Frecuencia respiratoria', group: 'Signos vitales', kind: 'short', resolve: ({ record }) => withUnit(record.fullVitals.rr, ' rpm') },
  'vitals.temp': { label: 'Temperatura', group: 'Signos vitales', kind: 'short', resolve: ({ record }) => withUnit(record.fullVitals.temp, ' °C') },
  'vitals.spo2': { label: 'SpO₂', group: 'Signos vitales', kind: 'short', resolve: ({ record }) => withUnit(record.fullVitals.spo2, '%') },
  'vitals.glucose': { label: 'Glicemia', group: 'Signos vitales', kind: 'short', resolve: ({ record }) => withUnit(record.fullVitals.glucose, ' mg/dL') },

  'record.medications': {
    label: 'Medicamentos', group: 'Tratamiento', kind: 'long',
    resolve: ({ record }) => bullets<MedicationItem>(record.medications, (m) => join([m.activeIngredient, m.presentation, m.quantity], ' — ')),
  },
  'record.otherMedications': {
    label: 'Otros medicamentos', group: 'Tratamiento', kind: 'long',
    resolve: ({ record }) => bullets<OtherMedicationItem>(record.otherMedications, (m) => join([m.name, m.indications], ' — ')),
  },
  'record.medicalExclusions': { label: 'Exclusiones médicas', group: 'Tratamiento', kind: 'long', resolve: ({ record }) => record.medicalExclusions },
  'record.supplies': {
    label: 'Insumos médicos', group: 'Tratamiento', kind: 'long',
    resolve: ({ record }) => bullets<SupplyItem>(record.supplies, (s) => join([s.name, s.quantity], ' — ')),
  },
  'record.recipeText': { label: 'Récipe', group: 'Tratamiento', kind: 'long', resolve: ({ record }) => record.recipeText },
  'record.indicationsText': { label: 'Indicaciones', group: 'Tratamiento', kind: 'long', resolve: ({ record }) => record.indicationsText },

  'record.paraclinicalExams': { label: 'Exámenes paraclínicos', group: 'Seguimiento', kind: 'long', resolve: ({ record }) => record.paraclinicalExams },
  'record.medicalRecommendations': { label: 'Recomendaciones médicas', group: 'Seguimiento', kind: 'long', resolve: ({ record }) => record.medicalRecommendations },
  'record.specialistReferences': { label: 'Referencias a especialistas', group: 'Seguimiento', kind: 'long', resolve: ({ record }) => record.specialistReferences },
  'record.interconsultaText': { label: 'Informe de interconsulta', group: 'Seguimiento', kind: 'long', resolve: ({ record }) => record.interconsultaText },
}

export function resolveBinding(source: string, ctx: BindingContext): string {
  return BINDINGS[source]?.resolve(ctx) ?? ''
}
