import type { FullVitals, ServiceRecord } from '@/core/api/types'
import { SectionCard } from './SectionCard'

interface FullVitalsCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

const FIELDS: { key: keyof FullVitals; label: string; unit: string; placeholder: string }[] = [
  { key: 'hr', label: 'Frecuencia cardíaca', unit: 'lpm', placeholder: '80' },
  { key: 'rr', label: 'Frecuencia respiratoria', unit: 'rpm', placeholder: '18' },
  { key: 'spo2', label: 'Saturación de oxígeno', unit: '%', placeholder: '98' },
  { key: 'bp', label: 'Tensión arterial', unit: 'mmHg', placeholder: '120/80' },
  { key: 'temp', label: 'Temperatura', unit: '°C', placeholder: '36.5' },
  { key: 'glucose', label: 'Glicemia', unit: 'mg/dL', placeholder: '90' },
]

export function FullVitalsCard({ data, update }: FullVitalsCardProps) {
  const set = (key: keyof FullVitals, value: string) =>
    update(prev => ({ ...prev, fullVitals: { ...prev.fullVitals, [key]: value } }))

  return (
    <SectionCard title="Signos vitales">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FIELDS.map(f => (
          <div key={f.key} className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-2.5">
            <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{f.label}</label>
            <div className="flex items-baseline gap-1 mt-0.5">
              <input
                value={data.fullVitals[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-transparent text-sm font-bold text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
              />
              <span className="text-[10px] text-zinc-400 shrink-0">{f.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
