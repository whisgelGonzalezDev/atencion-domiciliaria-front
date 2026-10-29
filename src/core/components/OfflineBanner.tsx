import { useState } from 'react'
import { WifiOff, RefreshCw, TriangleAlert } from 'lucide-react'
import { useOfflineQueue } from '@/core/offline/useOfflineQueue'
import { PendingActionsModal } from './PendingActionsModal'

export function OfflineBanner() {
  const { isOnline, pendingCount, failedCount, authExpired } = useOfflineQueue()
  const [open, setOpen] = useState(false)

  const needsAttention = authExpired || failedCount > 0
  if (isOnline && pendingCount === 0 && !needsAttention) return null

  const plural = pendingCount === 1 ? '' : 'es'
  const hasQueue = pendingCount > 0 || failedCount > 0

  let label: string
  if (authExpired) label = `Tu sesión venció — ${pendingCount} acción${plural} esperando para sincronizar`
  else if (failedCount > 0) label = `${failedCount} acción${failedCount === 1 ? '' : 'es'} rechazada${failedCount === 1 ? '' : 's'} por el servidor${pendingCount > 0 ? ` · ${pendingCount} pendiente${plural}` : ''}`
  else if (isOnline) label = `${pendingCount} acción${plural} pendiente${plural} de sincronizar`
  else if (pendingCount > 0) label = `Sin conexión — ${pendingCount} acción${plural} pendiente${plural} de sincronizar`
  else label = 'Sin conexión — mostrando datos guardados'

  const Icon = needsAttention ? TriangleAlert : isOnline ? RefreshCw : WifiOff
  const tone = needsAttention
    ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400'
    : isOnline
      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
      : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400'

  return (
    <>
      <div className={['flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium', tone].join(' ')}>
        <Icon size={12} />
        {label}
        {hasQueue && (
          <button onClick={() => setOpen(true)} className="underline underline-offset-2 hover:no-underline">
            Ver detalle
          </button>
        )}
      </div>
      <PendingActionsModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
