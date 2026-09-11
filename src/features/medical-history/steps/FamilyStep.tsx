import type { FamilyHistoryEntry } from '@/core/api/types'
import { DynamicRowsField } from '../components/DynamicRowsField'
import type { StepProps } from './types'

const RELATIVE_OPTIONS = [
  { value: 'madre', label: 'Madre' },
  { value: 'padre', label: 'Padre' },
  { value: 'hermano_a', label: 'Hermano/a' },
  { value: 'abuelo_paterno', label: 'Abuelo paterno' },
  { value: 'abuela_paterna', label: 'Abuela paterna' },
  { value: 'abuelo_materno', label: 'Abuelo materno' },
  { value: 'abuela_materna', label: 'Abuela materna' },
  { value: 'otro', label: 'Otro' },
]

export function FamilyStep({ data, onChange }: StepProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Antecedentes familiares</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Enfermedades relevantes en familiares directos (diabetes, hipertensión, cardiopatías, cáncer, enfermedades mentales, etc.)
        </p>
      </div>
      <DynamicRowsField
        rows={data.familyHistory as unknown as Record<string, string>[]}
        onChange={rows => onChange(prev => ({ ...prev, familyHistory: rows as unknown as FamilyHistoryEntry[] }))}
        addLabel="Agregar antecedente familiar"
        emptyHint="Sin antecedentes familiares registrados."
        columns={[
          { key: 'relative', label: 'Familiar', type: 'select', options: RELATIVE_OPTIONS },
          { key: 'condition', label: 'Condición', placeholder: 'Ej. Diabetes tipo II' },
        ]}
      />
    </div>
  )
}
