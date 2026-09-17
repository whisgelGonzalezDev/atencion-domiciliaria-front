import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { settingsApi } from '@/core/api/settings.api'
import type { SystemSettings } from '@/core/api/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TWEAKS_KEY } from '@/hooks/useTweaks'

interface SystemSettingsCtx {
  settings: SystemSettings | null
  loading: boolean
  refresh: () => Promise<void>
}

const SystemSettingsContext = createContext<SystemSettingsCtx>({
  settings: null,
  loading: true,
  refresh: async () => {},
})

export function useSystemSettings() {
  return useContext(SystemSettingsContext)
}

// Un usuario que ya personalizó su acento en /settings conserva su elección;
// solo se aplica el color de marca como valor por defecto para quien nunca
// lo ha tocado (mismo criterio que usa useTweaks para decidir si hay
// preferencia guardada).
function applyBrandDefaultAccent(settings: SystemSettings) {
  try {
    if (localStorage.getItem(TWEAKS_KEY)) return
  } catch {
    return
  }
  const root = document.documentElement
  root.style.setProperty('--accent', settings.accent)
  root.style.setProperty('--accent-soft', settings.accentSoft)
  root.style.setProperty('--accent-strong', settings.accentStrong)
}

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await settingsApi.get()
      setSettings(data)
      applyBrandDefaultAccent(data)
      if (data.clinicName) document.title = data.clinicName
    } catch {
      // Best-effort: la app sigue funcionando con los valores locales/por defecto.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      void refresh()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, refresh])

  return (
    <SystemSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SystemSettingsContext.Provider>
  )
}
