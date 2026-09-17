import type { SeriesPoint } from '@/core/api/types'

interface BarTrendProps {
  data: SeriesPoint[]
  colorClass: string
  formatValue?: (v: number) => string
}

export function BarTrend({ data, colorClass, formatValue = String }: BarTrendProps) {
  const max = Math.max(1, ...data.map(d => d.value))
  const labelEvery = Math.max(1, Math.ceil(data.length / 8))

  if (data.every(d => d.value === 0)) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-zinc-400 dark:text-zinc-500">
        Sin datos en este período
      </div>
    )
  }

  return (
    <div className="flex h-40 items-end gap-[3px]">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} className="group relative flex flex-1 flex-col items-center justify-end h-full">
          <div
            title={`${d.label}: ${formatValue(d.value)}`}
            className={['w-full min-h-[2px] rounded-t transition-opacity group-hover:opacity-80', colorClass].join(' ')}
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          {i % labelEvery === 0 && (
            <span className="mt-1 text-[9px] text-zinc-400 dark:text-zinc-500 truncate w-full text-center">
              {d.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
