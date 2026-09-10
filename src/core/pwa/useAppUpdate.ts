import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000 // 1h

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
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
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
