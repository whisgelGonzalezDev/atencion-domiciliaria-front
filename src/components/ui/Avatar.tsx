type Status = 'available' | 'busy' | 'offshift'

interface AvatarProps {
  name: string
  size?: number
  status?: Status
}

const COLORS = [
  'bg-sky-100    text-sky-700    dark:bg-sky-900    dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  'bg-amber-100  text-amber-700  dark:bg-amber-900  dark:text-amber-300',
  'bg-rose-100   text-rose-700   dark:bg-rose-900   dark:text-rose-300',
]

const STATUS_DOT: Record<Status, string> = {
  available: 'bg-emerald-500',
  busy:      'bg-sky-500',
  offshift:  'bg-zinc-300 dark:bg-zinc-600',
}

function getInitials(name: string): string {
  const cleaned = name.replace(/^(Dr\.|Dra\.)\s*/i, '')
  const parts = cleaned.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : cleaned.slice(0, 2).toUpperCase()
}

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % COLORS.length
  return h
}

export function Avatar({ name, size = 32, status }: AvatarProps) {
  const initials = getInitials(name)
  const color = COLORS[hashName(name)]
  const fontSize = Math.round(size * 0.36)

  return (
    <div className="relative shrink-0 inline-flex" style={{ width: size, height: size }}>
      <div
        className={['flex items-center justify-center rounded-full font-semibold select-none', color].join(' ')}
        style={{ width: size, height: size, fontSize }}
      >
        {initials}
      </div>
      {status && (
        <span
          className={['absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-zinc-900', STATUS_DOT[status]].join(' ')}
          style={{ width: Math.max(8, size * 0.25), height: Math.max(8, size * 0.25) }}
        />
      )}
    </div>
  )
}
