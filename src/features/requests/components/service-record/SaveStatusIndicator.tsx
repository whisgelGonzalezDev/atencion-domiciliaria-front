import { Check, Loader2, TriangleAlert, WifiOff } from 'lucide-react'
import type { SaveStatus } from '../../useServiceRecordDraft'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  /** Shown only on conflict: keep my version / load the other person's. */
  onKeepMine?: () => void
  onAcceptTheirs?: () => void
}

export function SaveStatusIndicator({ status, onKeepMine, onAcceptTheirs }: SaveStatusIndicatorProps) {
  if (status === 'idle') return null

  if (status === 'conflict') {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-red-600 dark:text-red-400">
        <span className="inline-flex items-center gap-1.5">
          <TriangleAlert size={12} />
          Otra persona modificó esta ficha
        </span>
        {onKeepMine && (
          <button type="button" onClick={onKeepMine} className="underline underline-offset-2 hover:no-underline">
            Usar mis cambios
          </button>
        )}
        {onAcceptTheirs && (
          <button type="button" onClick={onAcceptTheirs} className="underline underline-offset-2 hover:no-underline">
            Cargar la versión del servidor
          </button>
        )}
      </span>
    )
  }

  const config: Record<Exclude<SaveStatus, 'idle' | 'conflict'>, { icon: React.ElementType; label: string; className: string }> = {
    saving: { icon: Loader2, label: 'Guardando...', className: 'text-zinc-400 dark:text-zinc-500' },
    saved: { icon: Check, label: 'Guardado', className: 'text-emerald-600 dark:text-emerald-400' },
    offline: { icon: WifiOff, label: 'Guardado sin conexión: se enviará solo', className: 'text-amber-600 dark:text-amber-400' },
    error: { icon: TriangleAlert, label: 'No se pudo guardar', className: 'text-red-500' },
  }
  const { icon: Icon, label, className } = config[status]

  return (
    <span className={['inline-flex items-center gap-1.5 text-xs font-medium', className].join(' ')}>
      <Icon size={12} className={status === 'saving' ? 'animate-spin' : ''} />
      {label}
    </span>
  )
}
