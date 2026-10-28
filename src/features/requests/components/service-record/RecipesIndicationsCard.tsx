import type { ServiceRecord } from '@/core/api/types'
import { inputCls, labelCls } from '../../formStyles'
import { SectionCard } from './SectionCard'

interface RecipesIndicationsCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function RecipesIndicationsCard({ data, update }: RecipesIndicationsCardProps) {
  const set = (key: 'recipeText' | 'indicationsText', value: string) =>
    update(prev => ({ ...prev, [key]: value }))

  return (
    <SectionCard title="Récipes e indicaciones">
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Récipes</label>
          <textarea
            value={data.recipeText}
            onChange={e => set('recipeText', e.target.value)}
            rows={3}
            placeholder="No se han asignado récipes"
            className={inputCls()}
          />
        </div>
        <div>
          <label className={labelCls}>Indicaciones</label>
          <textarea
            value={data.indicationsText}
            onChange={e => set('indicationsText', e.target.value)}
            rows={2}
            placeholder="No se han asignado indicaciones"
            className={inputCls()}
          />
        </div>
      </div>
    </SectionCard>
  )
}
