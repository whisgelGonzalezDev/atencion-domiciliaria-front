import type { MedicalHistoryFormData } from '@/core/api/types'

function clean<T extends object>(row: T): T {
  const entries = Object.entries(row).filter(([, v]) => v !== '' && v !== undefined)
  return Object.fromEntries(entries) as T
}

/**
 * The wizard's local state keeps every in-progress row (including ones the
 * user hasn't finished filling in) so nothing is lost on reload. Before
 * sending to the backend, drop rows missing their required field and strip
 * blank optional fields — an in-progress "Agregar alergia" row with no
 * substance yet shouldn't fail validation or get persisted as a blank entry.
 */
export function sanitizeForServer(data: MedicalHistoryFormData): MedicalHistoryFormData {
  return {
    ...data,
    surgeries: data.surgeries.filter(s => s.description?.trim()).map(clean),
    allergies: data.allergies.filter(a => a.substance?.trim()).map(clean),
    currentMedications: data.currentMedications.filter(m => m.name?.trim()).map(clean),
    familyHistory: data.familyHistory.filter(f => f.relative?.trim() && f.condition?.trim()).map(clean),
    activeDiagnoses: data.activeDiagnoses.filter(d => d.description?.trim()).map(clean),
  }
}
