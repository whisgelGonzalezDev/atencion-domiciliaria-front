import type { MedRequest, ServiceRecord } from '@/core/api/types'
import { emptyServiceRecord } from '../requests/emptyServiceRecord'

/** Made-up data so the editor's preview shows every kind of field filled in. Never a real patient. */
export const SAMPLE_REQUEST = {
  id: 'MUESTRA-0001',
  patient: { name: 'María Pérez (ejemplo)', age: 54, phone: '+58 414 000 0000' },
  address: 'Av. Principal, Edif. Sol, Apto 3B',
  symptoms: 'Fiebre alta y dolor de cabeza desde hace dos días.',
  doctor: { name: 'Dra. Camila Torres' },
} as unknown as MedRequest

const empty = emptyServiceRecord()

export const SAMPLE_RECORD: ServiceRecord = {
  ...empty,
  serviceType: 'AMD',
  affiliate: { ...empty.affiliate, idNumber: 'V-12.345.678', sex: 'F', insurancePlan: 'Plan Plus', insuranceBranch: 'Salud', policyHolder: 'Empresa XYZ, C.A.' },
  currentIllness: 'Cuadro febril de 48 horas de evolución, sin disnea.',
  medicalBackground: 'Hipertensión arterial controlada.',
  physicalExam: 'Faringe congestiva, sin adenopatías.',
  functionalExam: 'Sin alteraciones.',
  diagnosis: 'Faringitis aguda',
  diagnosisNotes: 'Control en 72 horas.',
  symptomsList: ['Fiebre', 'Cefalea'],
  fullVitals: { bp: '120/80', hr: '78', rr: '16', temp: '38.2', spo2: '97', glucose: '95' },
  medications: [{ activeIngredient: 'Paracetamol', presentation: '500 mg', quantity: '12' }],
  supplies: [{ name: 'Gasas', quantity: '4' }],
  recipeText: 'Paracetamol 500 mg cada 8 horas por 3 días.',
  indicationsText: 'Reposo e hidratación abundante.',
  interconsultaText: 'Se solicita valoración por otorrinolaringología.',
  paraclinicalExams: 'Hematología completa',
  medicalRecommendations: 'Evitar cambios bruscos de temperatura.',
  doctorSignedAt: new Date().toISOString(),
}
