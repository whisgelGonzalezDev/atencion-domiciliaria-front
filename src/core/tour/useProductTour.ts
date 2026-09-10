import { useCallback, useRef } from 'react'
import { driver, type Driver } from 'driver.js'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getTourSteps } from './tourSteps'

/**
 * Recorrido guiado reutilizable: lo dispara tanto el auto-arranque en
 * DashboardLayout (primera vez) como el botón "Ver tour de nuevo" en
 * Configuración (replay manual). Terminar el tour de cualquier forma
 * (Listo, X, Esc) marca hasCompletedTour — igual que "saltarlo" cuenta como
 * "ya lo vio".
 */
export function useProductTour() {
  const { user, markTourCompleted } = useAuth()
  const driverRef = useRef<Driver | null>(null)

  const startTour = useCallback(() => {
    const isAdmin = user?.role === 'admin'

    driverRef.current?.destroy()
    driverRef.current = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.6,
      popoverClass: 'atencion-tour-popover',
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Listo',
      steps: getTourSteps(isAdmin),
      onDestroyed: () => markTourCompleted(),
    })
    driverRef.current.drive()
  }, [user?.role, markTourCompleted])

  return { startTour }
}
