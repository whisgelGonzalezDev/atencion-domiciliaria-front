import type { ServiceRecord } from '@/core/api/types'
import { inputCls, labelCls } from '../../formStyles'
import { SectionCard } from './SectionCard'

interface SuccessiveServiceCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function SuccessiveServiceCard({ data, update }: SuccessiveServiceCardProps) {
  const setRequested = (successiveServiceRequested: boolean) =>
    update(prev => ({ ...prev, successiveServiceRequested }))
  const setNotes = (successiveServiceNotes: string) =>
    update(prev => ({ ...prev, successiveServiceNotes }))

  return (
    <SectionCard title="Servicio sucesivo">
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">¿Desea añadir un servicio sucesivo?</p>
      <div className="flex gap-4 mb-3">
        {([[true, 'Sí'], [false, 'No']] as const).map(([value, label]) => (
          <label key={label} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="successive-service"
              checked={data.successiveServiceRequested === value}
              onChange={() => setRequested(value)}
              className="h-4 w-4"
            />
            {label}
          </label>
        ))}
      </div>
      {data.successiveServiceRequested && (
        <div>
          <label className={labelCls}>Notas del servicio sucesivo</label>
          <textarea value={data.successiveServiceNotes} onChange={e => setNotes(e.target.value)} rows={2} className={inputCls()} />
        </div>
      )}
    </SectionCard>
  )
}
