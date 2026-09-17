import type { MedicalHistoryFormData } from '@/core/api/types'

export function emptyMedicalHistoryForm(): MedicalHistoryFormData {
  return {
    status: 'draft',
    chronicConditions: [],
    surgeries: [],
    allergies: [],
    currentMedications: [],
    familyHistory: [],
    habits: {},
    baselineVitals: {},
    physicalExamNotes: '',
    reviewOfSystems: {},
    activeDiagnoses: [],
    generalNotes: '',
  }
}
