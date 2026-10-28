import type { ServiceRecord, SwabTest } from '@/core/api/types'
import { SectionCard } from './SectionCard'

interface SwabTestCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function SwabTestCard({ data, update }: SwabTestCardProps) {
  const set = (key: keyof SwabTest, value: string) =>
    update(prev => ({ ...prev, swabTest: { ...prev.swabTest, [key]: value } }))

  const s = data.swabTest

  return (
    <SectionCard title="Hisopado">
      <div className="space-y-3">
        <div className="flex gap-4">
          {([['particular', 'Particular'], ['venemergencia', 'Por Venemergencia']] as const).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="radio" name="swab-type" checked={s.type === value} onChange={() => set('type', value)} className="h-4 w-4" />
              {label}
            </label>
          ))}
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1.5">¿Resultado?</p>
          <div className="flex gap-4">
            {([['positive', 'Positivo'], ['negative', 'Negativo']] as const).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="radio" name="swab-result" checked={s.result === value} onChange={() => set('result', value)} className="h-4 w-4" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
