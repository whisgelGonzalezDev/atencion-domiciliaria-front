import { AlertTriangle } from 'lucide-react'
import type { DiagnosisEntry } from '@/core/api/types'
import { DynamicRowsField } from '../components/DynamicRowsField'
import { inputCls, labelCls } from '../formStyles'
import type { StepProps } from './types'

export function SummaryStep({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Diagnósticos activos</h3>
        <DynamicRowsField
          rows={data.activeDiagnoses as unknown as Record<string, string>[]}
          onChange={rows => onChange(prev => ({ ...prev, activeDiagnoses: rows as unknown as DiagnosisEntry[] }))}
          addLabel="Agregar diagnóstico"
          emptyHint="Sin diagnósticos activos registrados."
          columns={[
            { key: 'description', label: 'Diagnóstico', placeholder: 'Ej. Diabetes mellitus tipo II' },
            { key: 'diagnosedAt', label: 'Fecha', type: 'date' },
          ]}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Notas generales / plan</label>
        <textarea
          value={data.generalNotes}
          onChange={e => onChange(prev => ({ ...prev, generalNotes: e.target.value }))}
          placeholder="Recomendaciones, seguimiento, observaciones adicionales..."
          rows={4}
          className={[inputCls(), 'resize-none'].join(' ')}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Resumen antes de finalizar</p>

        {data.allergies.length > 0 && (
          <div className="flex items-start gap-2 rounded-md bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 px-3 py-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <p className="text-xs">
              <span className="font-semibold">Alergias: </span>
              {data.allergies.map(a => a.substance).filter(Boolean).join(', ') || 'registradas sin detalle'}
            </p>
          </div>
        )}

        <SummaryRow label="Condiciones crónicas" value={data.chronicConditions.join(', ')} />
        <SummaryRow label="Medicación actual" value={data.currentMedications.map(m => m.name).filter(Boolean).join(', ')} />
        <SummaryRow label="Diagnósticos activos" value={data.activeDiagnoses.map(d => d.description).filter(Boolean).join(', ')} />
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 text-xs">
      <span className="font-medium text-zinc-500 dark:text-zinc-400 shrink-0">{label}:</span>
      <span className="text-zinc-700 dark:text-zinc-300">{value || '—'}</span>
    </div>
  )
}
