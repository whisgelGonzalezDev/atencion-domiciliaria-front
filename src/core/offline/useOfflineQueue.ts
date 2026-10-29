import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { subscribeQueue, getQueueSnapshot, type QueueState } from './queue'
import { syncOfflineQueue } from './sync'

let syncing = false

export async function triggerSync() {
  if (syncing) return
  syncing = true
  try {
    const result = await syncOfflineQueue()
    if (result.synced > 0) {
      toast.success(`${result.synced} acción${result.synced === 1 ? '' : 'es'} sincronizada${result.synced === 1 ? '' : 's'}`)
    }
    if (result.failed > 0) {
      toast.error(`${result.failed} acción${result.failed === 1 ? '' : 'es'} rechazada${result.failed === 1 ? '' : 's'} por el servidor: ${result.failedDescriptions.join(', ')}`)
    }
  } finally {
    syncing = false
  }
}

const RETRY_INTERVAL_MS = 20_000

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [state, setState] = useState<QueueState>(getQueueSnapshot())

  useEffect(() => {
    const unsubscribe = subscribeQueue(setState)

    const handleOnline = () => {
      setIsOnline(true)
      void triggerSync()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (navigator.onLine) void triggerSync()

    // Belt-and-suspenders: retries even if the browser never fires an
    // 'offline'/'online' transition (e.g. the API is unreachable while the
    // network interface itself stays up, or Render is still waking up).
    const interval = window.setInterval(() => {
      const hasPending = getQueueSnapshot().actions.some((a) => a.status !== 'failed')
      if (navigator.onLine && hasPending) void triggerSync()
    }, RETRY_INTERVAL_MS)

    return () => {
      unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.clearInterval(interval)
    }
  }, [])

  const pendingCount = state.actions.filter((a) => a.status !== 'failed').length
  const failedCount = state.actions.length - pendingCount

  return { isOnline, pendingCount, failedCount, actions: state.actions, authExpired: state.authExpired }
}
