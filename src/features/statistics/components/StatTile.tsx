import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/core/components/Card'

interface StatTileProps {
  label: string
  value: string | number
  delta?: number
  deltaGoodDirection?: 'up' | 'down'
  sub?: string
}

export function StatTile({ label, value, delta, deltaGoodDirection = 'up', sub }: StatTileProps) {
  const hasDelta = delta !== undefined
  const isUp = (delta ?? 0) >= 0
  const isGood = hasDelta && (deltaGoodDirection === 'up' ? isUp : !isUp)

  return (
    <Card padding="md">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
      {hasDelta && (
        <div className={[
          'mt-2 inline-flex items-center gap-1 text-xs font-medium',
          isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
        ].join(' ')}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isUp ? '+' : ''}{delta}% vs período anterior
        </div>
      )}
    </Card>
  )
}
