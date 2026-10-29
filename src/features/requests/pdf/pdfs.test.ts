import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { MedRequest, ServiceRecord, SystemSettings } from '@/core/api/types'

/**
 * Records every drawing call jsPDF would receive. The three documents must
 * keep producing exactly this sequence (snapshot), whatever generates them.
 */
const calls: unknown[][] = []

vi.mock('jspdf', () => ({
  jsPDF: class {
    constructor() {
      return new Proxy({}, {
        get: (_t, name: string) => {
          if (name === 'splitTextToSize') {
            // Deterministic stand-in for jsPDF's width-based wrapping.
            return (text: string) => text.split('\n').flatMap((l) => l.match(/.{1,90}(\s|$)|\S+/g)?.map((s) => s.trim()) ?? [''])
          }
          return (...args: unknown[]) => { calls.push([name, ...args]) }
        },
      })
    }
  },
}))

import { emptyServiceRecord } from '../emptyServiceRecord'
import { generateRecipePdf } from './recipePdf'
import { generateMedicalReportPdf } from './medicalReportPdf'
import { generateInterconsultaPdf } from './interconsultaPdf'

const request = {
  id: 'req-1',
  patient: { name: 'María Pérez', age: 54, phone: '+58 414 1234567' },
  address: 'Av. Principal, Edif. Sol, Apto 3B',
  symptoms: 'Fiebre alta y dolor de cabeza desde hace dos días',
  doctor: { name: 'Dra. Camila Torres' },
} as unknown as MedRequest

const record: ServiceRecord = {
  ...emptyServiceRecord(),
  serviceType: 'AMD',
  affiliate: {
    ...emptyServiceRecord().affiliate,
    idNumber: 'V-12345678', insurancePlan: 'Plan Plus', insuranceBranch: 'Salud', policyHolder: 'Empresa XYZ', sex: 'F',
  },
  currentIllness: 'Cuadro febril de 48 horas.\nSin disnea.',
  medicalBackground: 'Hipertensión controlada.',
  physicalExam: 'Faringe congestiva.',
  functionalExam: 'Sin alteraciones.',
  diagnosis: 'Faringitis aguda',
  diagnosisNotes: 'Control en 72 horas.',
  symptomsList: ['Fiebre', 'Cefalea'],
  fullVitals: { ...emptyServiceRecord().fullVitals, bp: '120/80', hr: '78', temp: '38.2', spo2: '97' },
  medications: [{ activeIngredient: 'Paracetamol', presentation: '500 mg', quantity: '12' }],
  supplies: [{ name: 'Gasas', quantity: '4' }],
  recipeText: 'Paracetamol 500 mg cada 8 horas por 3 días.',
  indicationsText: 'Reposo e hidratación.',
  interconsultaText: 'Se solicita valoración por otorrinolaringología.',
  paraclinicalExams: 'Hematología completa',
  doctorSignedAt: '2026-10-29T14:30:00.000Z',
}

const settings = { clinicName: 'Clínica Demo', accent: '#0369a1', logoUrl: null } as unknown as SystemSettings

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-29T15:00:00.000Z'))
})
afterAll(() => vi.useRealTimers())

async function drawn(run: () => Promise<void>) {
  calls.length = 0
  await run()
  return calls.map((c) => c.map((a) => (typeof a === 'string' && a.length > 80 ? a.slice(0, 80) + '…' : a)))
}

describe('default PDF documents (visual regression)', () => {
  it('récipe', async () => {
    expect(await drawn(() => generateRecipePdf(request, record, settings))).toMatchSnapshot()
  })
  it('informe de atención médica', async () => {
    expect(await drawn(() => generateMedicalReportPdf(request, record, settings))).toMatchSnapshot()
  })
  it('informe de interconsulta', async () => {
    expect(await drawn(() => generateInterconsultaPdf(request, record, settings))).toMatchSnapshot()
  })
  it('falls back to placeholders when the record is empty', async () => {
    const empty = emptyServiceRecord()
    expect(await drawn(() => generateRecipePdf(request, empty, null))).toMatchSnapshot()
    expect(await drawn(() => generateMedicalReportPdf(request, empty, null))).toMatchSnapshot()
  })
})
