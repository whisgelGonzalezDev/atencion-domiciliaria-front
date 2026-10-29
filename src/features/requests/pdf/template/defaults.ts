import type { DocType, DocumentDefinition, FieldWidth, TemplateField } from './types'

const f = (id: string, label: string, source: string, width: FieldWidth = 'full', placeholder?: string): TemplateField =>
  ({ id, label, source, width, ...(placeholder ? { placeholder } : {}) })

const recipe: DocumentDefinition = {
  version: 1,
  header: { title: 'RÉCIPE', subtitle: 'Servicio {id}', showLogo: true, showClinicName: true },
  blocks: [
    {
      type: 'section', id: 'patient', spaceAfter: 4,
      fields: [
        f('name', 'Nombre y apellido', 'patient.name', 'third'),
        f('id', 'C.I.', 'affiliate.idNumber', 'third'),
        f('age', 'Edad', 'patient.age', 'third'),
      ],
    },
    { type: 'section', id: 'recipe', spaceAfter: 3, fields: [f('recipe', 'Récipe', 'record.recipeText', 'full', 'No se han asignado récipes')] },
    { type: 'section', id: 'indications', fields: [f('indications', 'Indicaciones', 'record.indicationsText', 'full', 'No se han asignado indicaciones')] },
    { type: 'signatures', id: 'sign', spaceBefore: 10, items: [{ label: 'Médico', who: 'doctor', appendDoctorName: true }] },
  ],
  footer: { showDate: true },
}

const report: DocumentDefinition = {
  version: 1,
  header: { title: 'INFORME DE ATENCIÓN MÉDICA', subtitle: 'Caso {id} · {date}', showLogo: true, showClinicName: true },
  blocks: [
    {
      type: 'section', id: 'patient', title: 'Datos del paciente',
      fields: [
        f('name', 'Nombres y apellidos', 'patient.name', 'third'),
        f('id', 'C.I.', 'affiliate.idNumber', 'third'),
        f('age', 'Edad', 'patient.age', 'third'),
        f('phone', 'Teléfono', 'patient.phone', 'third'),
        f('plan', 'Plan', 'affiliate.insurancePlan', 'third'),
        f('branch', 'Ramo', 'affiliate.insuranceBranch', 'third'),
        f('holder', 'Contratante', 'affiliate.policyHolder'),
        f('address', 'Dirección', 'patient.address'),
      ],
    },
    { type: 'section', id: 'background', title: 'Hábitos y antecedentes médicos', fields: [f('background', 'Antecedentes', 'record.medicalBackground')] },
    {
      type: 'section', id: 'case', title: 'Evaluación del caso',
      fields: [f('reason', 'Motivo de consulta', 'request.symptoms'), f('illness', 'Enfermedad actual', 'record.currentIllness')],
    },
    {
      type: 'section', id: 'exam', title: 'Examen físico',
      fields: [
        f('bp', 'TA', 'vitals.bp', 'third'),
        f('hr', 'FC', 'vitals.hr', 'third'),
        f('rr', 'FR', 'vitals.rr', 'third'),
        f('temp', 'Temp', 'vitals.temp', 'third'),
        f('spo2', 'SpO₂', 'vitals.spo2', 'third'),
        f('glucose', 'Glicemia', 'vitals.glucose', 'third'),
        f('symptoms', 'Síntomas', 'record.symptomsList'),
        f('physical', 'Examen físico', 'record.physicalExam'),
        f('functional', 'Examen funcional', 'record.functionalExam'),
      ],
    },
    {
      type: 'section', id: 'diagnosis', title: 'Diagnóstico (IDX)',
      fields: [f('diagnosis', 'Diagnóstico', 'record.diagnosis'), f('notes', 'Observaciones', 'record.diagnosisNotes')],
    },
    {
      type: 'section', id: 'treatment', title: 'Tratamiento aplicado',
      fields: [
        f('meds', 'Medicamentos', 'record.medications', 'full', 'No se han asignado medicamentos'),
        f('others', 'Otros medicamentos', 'record.otherMedications', 'full', 'No se han asignado otros medicamentos'),
        f('exclusions', 'Exclusiones médicas', 'record.medicalExclusions'),
        f('supplies', 'Insumos médicos', 'record.supplies', 'full', 'No se han asignado insumos'),
      ],
    },
    {
      type: 'section', id: 'followup', title: 'Paraclínicos, recomendaciones y referencias',
      fields: [
        f('exams', 'Exámenes paraclínicos', 'record.paraclinicalExams'),
        f('recommendations', 'Recomendaciones médicas', 'record.medicalRecommendations'),
        f('referrals', 'Referencias a especialistas', 'record.specialistReferences'),
      ],
    },
    {
      type: 'section', id: 'service', title: 'Datos del servicio',
      fields: [
        f('type', 'Tipo de servicio', 'record.serviceType', 'third'),
        f('swab', 'Hisopado', 'record.swab', 'third'),
        f('provider', 'Proveedor', 'record.provider', 'third'),
        f('start', 'Inicio del servicio', 'record.start', 'third'),
        f('end', 'Fin del servicio', 'record.end', 'third'),
        f('doctor', 'Médico', 'request.doctorName', 'third'),
      ],
    },
    {
      type: 'signatures', id: 'sign', keepTogether: 32, spaceBefore: 2,
      items: [
        { label: 'Firma del médico', who: 'doctor' },
        { label: 'Firma del paciente / afiliado', who: 'affiliate' },
      ],
    },
  ],
}

const interconsulta: DocumentDefinition = {
  version: 1,
  header: { title: 'INFORME DE INTERCONSULTA', subtitle: 'Caso {id} · {date}', showLogo: true, showClinicName: true },
  blocks: [
    {
      type: 'section', id: 'patient', spaceAfter: 2,
      fields: [
        f('holder', 'Empresa / Contratante', 'affiliate.policyHolder'),
        f('name', 'Nombres y apellidos', 'patient.name', 'third'),
        f('age', 'Edad', 'patient.age', 'third'),
        f('sex', 'Sexo', 'affiliate.sex', 'third'),
        f('id', 'C.I.', 'affiliate.idNumber'),
      ],
    },
    { type: 'section', id: 'report', fields: [f('report', 'Informe', 'record.interconsultaText', 'full', 'Sin contenido registrado')] },
    {
      type: 'signatures', id: 'sign', spaceBefore: 10,
      items: [{ label: 'Médico', who: 'doctor', appendDoctorName: true, suffix: ' · CI / M.P.P.S.' }],
    },
  ],
}

/** Used when neither the request's entity nor the clinic has a custom template. */
export const DEFAULT_TEMPLATES: Record<DocType, DocumentDefinition> = { recipe, report, interconsulta }

export const DOC_FILE_PREFIX: Record<DocType, string> = {
  recipe: 'recipe',
  report: 'informe-atencion-medica',
  interconsulta: 'informe-interconsulta',
}
