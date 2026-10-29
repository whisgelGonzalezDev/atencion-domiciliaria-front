import { useEffect } from 'react'
import { prefetchForOffline } from './prefetch'

/** Warms the offline cache for field doctors: on login, and whenever the connection comes back. */
export function usePrefetchForOffline(user: { id: string; role: string } | null) {
  useEffect(() => {
    if (!user || user.role !== 'doctor') return
    const run = () => { if (navigator.onLine) void prefetchForOffline(user.id) }
    // Let the screen the doctor opened load first.
    const timer = window.setTimeout(run, 3000)
    window.addEventListener('online', run)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('online', run)
    }
  }, [user?.id, user?.role]) // eslint-disable-line react-hooks/exhaustive-deps
}
