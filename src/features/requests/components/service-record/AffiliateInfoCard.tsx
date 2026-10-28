import type { AffiliateInfo, ServiceRecord } from '@/core/api/types'
import { inputCls, labelCls } from '../../formStyles'
import { SectionCard } from './SectionCard'

interface AffiliateInfoCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function AffiliateInfoCard({ data, update }: AffiliateInfoCardProps) {
  const set = (key: keyof AffiliateInfo, value: string) =>
    update(prev => ({ ...prev, affiliate: { ...prev.affiliate, [key]: value } }))

  const a = data.affiliate

  return (
    <SectionCard title="Información de afiliado">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Cédula de identidad</label>
          <input value={a.idNumber} onChange={e => set('idNumber', e.target.value)} className={inputCls()} placeholder="V-00000000" />
        </div>
        <div>
          <label className={labelCls}>Sexo</label>
          <select value={a.sex} onChange={e => set('sex', e.target.value)} className={inputCls()}>
            <option value="">Seleccionar...</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Fecha de nacimiento</label>
          <input type="date" value={a.birthDate} onChange={e => set('birthDate', e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls}>Correo electrónico</label>
          <input type="email" value={a.email} onChange={e => set('email', e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls}>Plan</label>
          <input value={a.insurancePlan} onChange={e => set('insurancePlan', e.target.value)} className={inputCls()} placeholder="Ej. Mercantil Seguros Medicaguda" />
        </div>
        <div>
          <label className={labelCls}>Ramo</label>
          <input value={a.insuranceBranch} onChange={e => set('insuranceBranch', e.target.value)} className={inputCls()} placeholder="Ej. Global Benefits Individual" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Contratante</label>
          <input value={a.policyHolder} onChange={e => set('policyHolder', e.target.value)} className={inputCls()} />
        </div>
      </div>
    </SectionCard>
  )
}
