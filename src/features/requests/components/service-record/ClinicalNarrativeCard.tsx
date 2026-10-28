import type { ServiceRecord } from '@/core/api/types'
import { inputCls, labelCls } from '../../formStyles'
import { SectionCard } from './SectionCard'

interface ClinicalNarrativeCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function ClinicalNarrativeCard({ data, update }: ClinicalNarrativeCardProps) {
  const set = (key: 'currentIllness' | 'medicalBackground' | 'functionalExam', value: string) =>
    update(prev => ({ ...prev, [key]: value }))

  return (
    <SectionCard title="Antecedentes y enfermedad actual">
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Enfermedad actual</label>
          <textarea value={data.currentIllness} onChange={e => set('currentIllness', e.target.value)} rows={3} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls}>Antecedentes</label>
          <textarea value={data.medicalBackground} onChange={e => set('medicalBackground', e.target.value)} rows={3} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls}>Examen funcional</label>
          <textarea value={data.functionalExam} onChange={e => set('functionalExam', e.target.value)} rows={2} className={inputCls()} />
        </div>
      </div>
    </SectionCard>
  )
}
