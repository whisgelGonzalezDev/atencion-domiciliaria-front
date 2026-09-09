import { WifiOff, RefreshCw } from 'lucide-react'
import { useOfflineQueue } from '@/core/offline/useOfflineQueue'

export function OfflineBanner() {
  const { isOnline, pendingCount } = useOfflineQueue()

  if (isOnline && pendingCount === 0) return null

  const plural = pendingCount === 1 ? '' : 'es'

  return (
    <div
      className={[
        'flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium',
        isOnline
          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
          : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400',
      ].join(' ')}
    >
      {isOnline ? <RefreshCw size={12} /> : <WifiOff size={12} />}
      {isOnline
        ? `${pendingCount} acción${plural} pendiente${plural} de sincronizar`
        : pendingCount > 0
          ? `Sin conexión — ${pendingCount} acción${plural} pendiente${plural} de sincronizar`
          : 'Sin conexión — mostrando datos guardados'}
    </div>
  )
}
