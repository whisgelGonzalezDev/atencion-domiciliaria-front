type Status = 'available' | 'busy' | 'offshift'

const DOT: Record<Status, string> = {
  available: 'bg-emerald-500',
  busy:      'bg-sky-500',
  offshift:  'bg-zinc-300 dark:bg-zinc-600',
}

const LABEL: Record<Status, string> = {
  available: 'Disponible',
  busy:      'En ruta',
  offshift:  'Fuera de turno',
}

const TEXT: Record<Status, string> = {
  available: 'text-emerald-600 dark:text-emerald-400',
  busy:      'text-sky-600 dark:text-sky-400',
  offshift:  'text-zinc-400 dark:text-zinc-500',
}

export function DoctorStatusDot({ status }: { status: Status }) {
  return (
    <span className={['inline-flex items-center gap-1.5 text-xs font-medium', TEXT[status]].join(' ')}>
      <span className={['h-1.5 w-1.5 rounded-full shrink-0', DOT[status]].join(' ')} />
      {LABEL[status]}
    </span>
  )
}
