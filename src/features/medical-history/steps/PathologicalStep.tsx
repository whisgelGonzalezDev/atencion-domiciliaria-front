import type { AllergyEntry, MedicationEntry, SurgeryEntry } from '@/core/api/types'
import { ChipListInput } from '../components/ChipListInput'
import { DynamicRowsField } from '../components/DynamicRowsField'
import type { StepProps } from './types'

const CHRONIC_SUGGESTIONS = [
  'Hipertensión arterial', 'Diabetes tipo II', 'Asma', 'Hipotiroidismo',
  'Cardiopatía', 'EPOC', 'Insuficiencia renal', 'Dislipidemia',
]

const SEVERITY_OPTIONS = [
  { value: 'leve', label: 'Leve' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'severa', label: 'Severa' },
]

export function PathologicalStep({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Enfermedades crónicas</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 mb-3">Selecciona las que apliquen o agrega otras.</p>
        <ChipListInput
          value={data.chronicConditions}
          suggestions={CHRONIC_SUGGESTIONS}
          onChange={v => onChange(prev => ({ ...prev, chronicConditions: v }))}
          placeholder="Ej. Hipertensión arterial"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Alergias</h3>
        <DynamicRowsField
          rows={data.allergies as unknown as Record<string, string>[]}
          onChange={rows => onChange(prev => ({ ...prev, allergies: rows as unknown as AllergyEntry[] }))}
          addLabel="Agregar alergia"
          emptyHint="Sin alergias conocidas registradas."
          columns={[
            { key: 'substance', label: 'Sustancia o medicamento', placeholder: 'Ej. Penicilina' },
            { key: 'reaction', label: 'Reacción', placeholder: 'Ej. Urticaria' },
            { key: 'severity', label: 'Severidad', type: 'select', options: SEVERITY_OPTIONS },
          ]}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Cirugías y hospitalizaciones previas</h3>
        <DynamicRowsField
          rows={data.surgeries as unknown as Record<string, string>[]}
          onChange={rows => onChange(prev => ({ ...prev, surgeries: rows as unknown as SurgeryEntry[] }))}
          addLabel="Agregar cirugía u hospitalización"
          emptyHint="Sin antecedentes quirúrgicos registrados."
          columns={[
            { key: 'description', label: 'Procedimiento o motivo', placeholder: 'Ej. Apendicectomía' },
            { key: 'occurredAt', label: 'Fecha aproximada', type: 'date' },
          ]}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Medicación actual</h3>
        <DynamicRowsField
          rows={data.currentMedications as unknown as Record<string, string>[]}
          onChange={rows => onChange(prev => ({ ...prev, currentMedications: rows as unknown as MedicationEntry[] }))}
          addLabel="Agregar medicamento"
          emptyHint="Sin medicación registrada."
          columns={[
            { key: 'name', label: 'Medicamento', placeholder: 'Ej. Losartán' },
            { key: 'dose', label: 'Dosis', placeholder: 'Ej. 50mg' },
            { key: 'frequency', label: 'Frecuencia', placeholder: 'Ej. Cada 12h' },
          ]}
        />
      </div>
    </div>
  )
}
