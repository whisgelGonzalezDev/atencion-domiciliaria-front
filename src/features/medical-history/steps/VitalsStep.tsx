import { inputCls, labelCls } from '../formStyles'
import type { StepProps } from './types'

interface VitalField {
  key: 'bp' | 'temp'
  label: string
  placeholder: string
}
interface VitalNumberField {
  key: 'hr' | 'rr' | 'spo2' | 'weightKg' | 'heightCm'
  label: string
  placeholder: string
}

const TEXT_FIELDS: VitalField[] = [
  { key: 'bp', label: 'Presión arterial', placeholder: 'Ej. 120/80' },
  { key: 'temp', label: 'Temperatura (°C)', placeholder: 'Ej. 36.5' },
]

const NUMBER_FIELDS: VitalNumberField[] = [
  { key: 'hr', label: 'Frec. cardíaca (lpm)', placeholder: 'Ej. 72' },
  { key: 'rr', label: 'Frec. respiratoria (rpm)', placeholder: 'Ej. 16' },
  { key: 'spo2', label: 'SpO2 (%)', placeholder: 'Ej. 98' },
  { key: 'weightKg', label: 'Peso (kg)', placeholder: 'Ej. 70' },
  { key: 'heightCm', label: 'Talla (cm)', placeholder: 'Ej. 165' },
]

export function VitalsStep({ data, onChange }: StepProps) {
  const { baselineVitals } = data

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Signos vitales basales</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Valores de referencia del paciente en condiciones normales.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEXT_FIELDS.map(f => (
            <div key={f.key} className="space-y-1">
              <label className={labelCls}>{f.label}</label>
              <input
                value={baselineVitals[f.key] ?? ''}
                onChange={e => onChange(prev => ({ ...prev, baselineVitals: { ...prev.baselineVitals, [f.key]: e.target.value } }))}
                placeholder={f.placeholder}
                className={inputCls()}
              />
            </div>
          ))}
          {NUMBER_FIELDS.map(f => (
            <div key={f.key} className="space-y-1">
              <label className={labelCls}>{f.label}</label>
              <input
                type="number"
                value={baselineVitals[f.key] ?? ''}
                onChange={e => onChange(prev => ({
                  ...prev,
                  baselineVitals: { ...prev.baselineVitals, [f.key]: e.target.value ? Number(e.target.value) : undefined },
                }))}
                placeholder={f.placeholder}
                className={inputCls()}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Hallazgos del examen físico</label>
        <textarea
          value={data.physicalExamNotes}
          onChange={e => onChange(prev => ({ ...prev, physicalExamNotes: e.target.value }))}
          placeholder="Estado general, hallazgos relevantes a la inspección..."
          rows={4}
          className={[inputCls(), 'resize-none'].join(' ')}
        />
      </div>
    </div>
  )
}
