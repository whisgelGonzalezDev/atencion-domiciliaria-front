import { FileClock, X } from 'lucide-react'

function timeAgo(ms: number): string {
  const diffMin = Math.max(0, Math.round((Date.now() - ms) / 60000))
  if (diffMin < 1) return 'hace un momento'
  if (diffMin < 60) return `hace ${diffMin}m`
  return `hace ${Math.floor(diffMin / 60)}h ${diffMin % 60}m`
}

interface DraftBannerProps {
  savedAt: number | null
  onDiscard: () => void
}

export function DraftBanner({ savedAt, onDiscard }: DraftBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
        <FileClock size={13} className="shrink-0" />
        <span>Continuando un borrador guardado {savedAt ? timeAgo(savedAt) : 'localmente'} en este dispositivo.</span>
      </div>
      <button
        type="button"
        onClick={onDiscard}
        className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline shrink-0"
      >
        <X size={12} />
        Descartar
      </button>
    </div>
  )
}
