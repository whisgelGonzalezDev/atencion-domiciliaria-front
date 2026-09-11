import type { HabitDetail, HabitStatus } from '@/core/api/types'
import { inputCls, labelCls } from '../formStyles'

const STATUS_OPTIONS: { id: HabitStatus; label: string }[] = [
  { id: 'nunca', label: 'Nunca' },
  { id: 'actual', label: 'Actualmente' },
  { id: 'anterior', label: 'En el pasado' },
]

interface HabitFieldProps {
  label: string
  value?: HabitDetail
  onChange: (value: HabitDetail | undefined) => void
  detailPlaceholder?: string
}

export function HabitField({ label, value, onChange, detailPlaceholder }: HabitFieldProps) {
  const status = value?.status

  return (
    <div className="space-y-2">
      <label className={labelCls}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(status === opt.id ? undefined : { status: opt.id, detail: value?.detail })}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
              status === opt.id
                ? 'text-white border-transparent'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800',
            ].join(' ')}
            style={status === opt.id ? { backgroundColor: 'var(--accent)' } : undefined}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {status && status !== 'nunca' && (
        <input
          value={value?.detail ?? ''}
          onChange={e => onChange({ status, detail: e.target.value })}
          placeholder={detailPlaceholder ?? 'Detalles (frecuencia, cantidad...)'}
          className={inputCls()}
        />
      )}
    </div>
  )
}
