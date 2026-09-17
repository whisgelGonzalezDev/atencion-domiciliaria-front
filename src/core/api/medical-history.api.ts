import { apiClient } from '@/core/utils/apiClient'
import type { MedicalHistory, MedicalHistoryDetail, MedicalHistoryFormData, MedicalHistoryPatientSummary } from './types'

export const medicalHistoryApi = {
  listPatients: (search?: string) =>
    apiClient<MedicalHistoryPatientSummary[]>('/medical-history/patients', {
      params: search ? { search } : undefined,
    }),

  getByPatient: (patientId: string) =>
    apiClient<MedicalHistoryDetail>(`/medical-history/patient/${patientId}`),

  save: (patientId: string, data: MedicalHistoryFormData, description: string) =>
    apiClient<MedicalHistory>(`/medical-history/patient/${patientId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      offlineDescription: description,
    }),
}
