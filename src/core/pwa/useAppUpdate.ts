import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000 // 1h — looks for a new deploy
const WAITING_POLL_INTERVAL_MS = 30 * 1000 // 30s — notices an install that already finished

/**
 * `registerType: 'autoUpdate'` (vite.config.ts) only makes the service
 * worker itself auto-activate in the background — nothing tells an
 * already-open tab that a new version installed, so it keeps running the
 * old bundle (sometimes referencing code that no longer exists) until
 * someone clears the cache by hand. This hook polls for updates and offers
 * a reload as soon as one is found, instead of waiting for the browser's
 * own next-navigation check.
 */
export function useAppUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      // Belt-and-suspenders: workbox-window's own "waiting" event is
      // supposed to fire the moment a new worker finishes installing, but
      // it can race with the browser's async update check and never fire
      // (observed directly: registration.waiting was true, needRefresh
      // stayed false). Poll the registration itself instead of trusting
      // the event alone — cheap, and guaranteed to eventually notice.
      const checkForWaitingWorker = () => {
        if (registration.waiting) setNeedRefresh(true)
      }
      checkForWaitingWorker()
      setInterval(checkForWaitingWorker, WAITING_POLL_INTERVAL_MS)

      setInterval(() => {
        registration.update().catch(() => {})
      }, UPDATE_CHECK_INTERVAL_MS)
    },
    onRegisterError(error) {
      console.error('No se pudo registrar el service worker', error)
    },
  })

  useEffect(() => {
    if (!needRefresh) return
    toast('Hay una versión nueva disponible', {
      description: 'Actualiza para ver los últimos cambios.',
      duration: Infinity,
      action: {
        label: 'Actualizar',
        onClick: () => updateServiceWorker(true),
      },
    })
  }, [needRefresh, updateServiceWorker])
}
