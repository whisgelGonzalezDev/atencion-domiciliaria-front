import type { ServiceRecord } from '@/core/api/types'
import { inputCls, labelCls } from '../../formStyles'
import { CollapsibleSectionCard } from './SectionCard'

interface ClinicalExtrasCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

const FIELDS: { key: 'paraclinicalExams' | 'medicalRecommendations' | 'specialistReferences'; label: string }[] = [
  { key: 'paraclinicalExams', label: 'Exámenes paraclínicos' },
  { key: 'medicalRecommendations', label: 'Recomendaciones médicas' },
  { key: 'specialistReferences', label: 'Referencias a especialistas' },
]

export function ClinicalExtrasCard({ data, update }: ClinicalExtrasCardProps) {
  const set = (key: typeof FIELDS[number]['key'], value: string) =>
    update(prev => ({ ...prev, [key]: value }))

  return (
    <CollapsibleSectionCard title="Exámenes, recomendaciones y referencias">
      <div className="space-y-3">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className={labelCls}>{f.label}</label>
            <textarea value={data[f.key]} onChange={e => set(f.key, e.target.value)} rows={2} className={inputCls()} />
          </div>
        ))}
      </div>
    </CollapsibleSectionCard>
  )
}
