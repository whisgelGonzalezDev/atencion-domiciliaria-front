interface BreakdownItem {
  key: string
  label: string
  value: number
  colorClass: string
}

interface BreakdownBarsProps {
  items: BreakdownItem[]
  formatValue?: (v: number) => string
}

export function BreakdownBars({ items, formatValue = String }: BreakdownBarsProps) {
  const max = Math.max(1, ...items.map(i => i.value))

  if (items.length === 0) {
    return <p className="text-xs text-zinc-400 dark:text-zinc-500 py-4 text-center">Sin datos en este período</p>
  }

  return (
    <div className="space-y-2.5">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-zinc-600 dark:text-zinc-400">{item.label}</span>
          <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={['h-full rounded-full', item.colorClass].join(' ')}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {formatValue(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}
