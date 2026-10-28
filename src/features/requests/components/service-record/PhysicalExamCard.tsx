import type { ServiceRecord } from '@/core/api/types'
import { ChipListInput } from '@/core/components'
import { inputCls, labelCls } from '../../formStyles'
import { SectionCard } from './SectionCard'

interface PhysicalExamCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function PhysicalExamCard({ data, update }: PhysicalExamCardProps) {
  const setText = (key: 'physicalExam' | 'diagnosis' | 'diagnosisNotes' | 'medicalExclusions', value: string) =>
    update(prev => ({ ...prev, [key]: value }))

  const setSymptoms = (symptomsList: string[]) => update(prev => ({ ...prev, symptomsList }))

  return (
    <SectionCard title="Examen físico y diagnóstico">
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Síntomas</label>
          <ChipListInput value={data.symptomsList} onChange={setSymptoms} placeholder="Escribe un síntoma y presiona Enter" />
        </div>
        <div>
          <label className={labelCls}>Examen físico</label>
          <textarea value={data.physicalExam} onChange={e => setText('physicalExam', e.target.value)} rows={3} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls}>Diagnóstico</label>
          <input value={data.diagnosis} onChange={e => setText('diagnosis', e.target.value)} className={inputCls()} placeholder="Ej. Síndrome febril de etiología a precisar" />
        </div>
        <div>
          <label className={labelCls}>Observaciones sobre diagnóstico</label>
          <textarea value={data.diagnosisNotes} onChange={e => setText('diagnosisNotes', e.target.value)} rows={2} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls}>Exclusiones médicas</label>
          <textarea value={data.medicalExclusions} onChange={e => setText('medicalExclusions', e.target.value)} rows={2} className={inputCls()} />
        </div>
      </div>
    </SectionCard>
  )
}
