import { AlertTriangle } from 'lucide-react'
import { PRIORITY, type PriorityId } from '@/data/medData'

interface PriorityPillProps {
  priority: PriorityId
  withIcon?: boolean
}

const COLOR_MAP: Record<PriorityId, string> = {
  low:       'bg-zinc-100  dark:bg-zinc-800  text-zinc-600  dark:text-zinc-400',
  mid:       'bg-amber-50  dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  emergency: 'bg-red-50    dark:bg-red-950   text-red-700   dark:text-red-400   border border-red-200 dark:border-red-900',
}

export function PriorityPill({ priority, withIcon = false }: PriorityPillProps) {
  const label = PRIORITY.find(p => p.id === priority)?.label ?? priority
  return (
    <span className={['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', COLOR_MAP[priority]].join(' ')}>
      {withIcon && priority === 'emergency' && <AlertTriangle size={10} className="shrink-0" />}
      {label}
    </span>
  )
}
