import { useEffect, useState } from 'react'
import { dashboardApi } from '@/core/api/dashboard.api'
import type { MapMarker } from '@/core/api/types'
import { MapPlaceholder } from '@/components/ui/MapPlaceholder'

export function MapView() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi
      .getMapMarkers()
      .then(setMarkers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Mapa de Zonas</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Vista geográfica de las operaciones activas</p>
      </div>
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-card overflow-hidden" style={{ height: 520 }}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-red-500">
            Error al cargar el mapa: {error}
          </div>
        ) : (
          <MapPlaceholder markers={markers} />
        )}
      </div>
      <div className="flex items-center justify-center h-16 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Integración con mapa interactivo (Leaflet/OSM) — Próximamente</p>
      </div>
    </div>
  )
}
