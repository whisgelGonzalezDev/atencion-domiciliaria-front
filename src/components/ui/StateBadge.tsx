import { STATES, type StateId } from '@/data/medData'

interface StateBadgeProps {
  state: StateId
  size?: 'sm' | 'md'
}

const COLOR_MAP: Record<StateId, string> = {
  pending:   'bg-amber-50  dark:bg-amber-950  text-amber-700  dark:text-amber-400  border-amber-100  dark:border-amber-900',
  enroute:   'bg-sky-50    dark:bg-sky-950    text-sky-700    dark:text-sky-400    border-sky-100    dark:border-sky-900',
  attending: 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900',
  done:      'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
  cancelled: 'bg-rose-50   dark:bg-rose-950   text-rose-700   dark:text-rose-400   border-rose-100   dark:border-rose-900',
}

const DOT_MAP: Record<StateId, string> = {
  pending:   'bg-amber-500',
  enroute:   'bg-sky-500',
  attending: 'bg-violet-500',
  done:      'bg-emerald-500',
  cancelled: 'bg-rose-500',
}

export function StateBadge({ state, size = 'md' }: StateBadgeProps) {
  const label = STATES.find(s => s.id === state)?.label ?? state
  return (
    <span className={[
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
      COLOR_MAP[state],
    ].join(' ')}>
      <span className={['h-1.5 w-1.5 rounded-full shrink-0', DOT_MAP[state]].join(' ')} />
      {label}
    </span>
  )
}
