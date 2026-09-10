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
 *
 * Polls `navigator.serviceWorker.getRegistration()` directly in its own
 * effect rather than relying solely on useRegisterSW's onRegisteredSW/
 * "waiting" event — verified live that a genuinely-waiting worker
 * (registration.waiting stably true, state "installed") did not
 * reliably flip needRefresh through the event-based path alone.
 */
export function useAppUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisterError(error) {
      console.error('No se pudo registrar el service worker', error)
    },
  })

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const checkForWaitingWorker = () => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) setNeedRefresh(true)
      }).catch(() => {})
    }

    checkForWaitingWorker()
    const pollId = setInterval(checkForWaitingWorker, WAITING_POLL_INTERVAL_MS)
    const updateId = setInterval(() => {
      navigator.serviceWorker.getRegistration()
        .then(registration => registration?.update())
        .catch(() => {})
    }, UPDATE_CHECK_INTERVAL_MS)

    return () => {
      clearInterval(pollId)
      clearInterval(updateId)
    }
  }, [setNeedRefresh])

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
