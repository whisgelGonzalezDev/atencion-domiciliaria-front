import { REVIEW_OF_SYSTEMS_KEYS } from '@/core/api/types'
import { inputCls, labelCls } from '../formStyles'
import type { StepProps } from './types'

const SYSTEM_LABELS: Record<string, string> = {
  cardiovascular: 'Cardiovascular',
  respiratorio: 'Respiratorio',
  digestivo: 'Digestivo',
  genitourinario: 'Genitourinario',
  neurologico: 'Neurológico',
  musculoesqueletico: 'Musculoesquelético',
  piel_faneras: 'Piel y faneras',
  endocrino: 'Endocrino',
}

export function ReviewOfSystemsStep({ data, onChange }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Revisión por sistemas</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Deja en blanco los sistemas sin hallazgos relevantes.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REVIEW_OF_SYSTEMS_KEYS.map(key => (
          <div key={key} className="space-y-1">
            <label className={labelCls}>{SYSTEM_LABELS[key]}</label>
            <textarea
              value={data.reviewOfSystems[key] ?? ''}
              onChange={e => onChange(prev => ({
                ...prev,
                reviewOfSystems: { ...prev.reviewOfSystems, [key]: e.target.value },
              }))}
              placeholder="Sin hallazgos"
              rows={2}
              className={[inputCls(), 'resize-none'].join(' ')}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
