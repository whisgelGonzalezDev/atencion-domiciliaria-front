import type { MedicalHistoryFormData } from '@/core/api/types'

export interface StepProps {
  data: MedicalHistoryFormData
  onChange: (updater: (prev: MedicalHistoryFormData) => MedicalHistoryFormData) => void
}
