import { useEffect, useState, useCallback } from 'react'
import { MapPin } from 'lucide-react'
import { dashboardApi } from '@/core/api/dashboard.api'
import { zonesApi } from '@/core/api/zones.api'
import type { MapMarker, Zone } from '@/core/api/types'
import { LeafletMap } from './components/LeafletMap'
import { ZoneModal } from './components/ZoneModal'
import { useAuth } from '@/features/auth/hooks/useAuth'

const CARACAS_CENTER: [number, number] = [10.4806, -66.9036]

export function MapView() {
  const { user } = useAuth()
  const canManage = user?.role === 'admin' || user?.role === 'operativo'

  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([dashboardApi.getMapMarkers(), zonesApi.getAll()])
      .then(([m, z]) => { setMarkers(m); setZones(z) })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleNewZone = () => {
    setEditingZone(null)
    setModalOpen(true)
  }

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone)
    setModalOpen(true)
  }

  const handleZoneSaved = (zone: Zone) => {
    setZones(prev => {
      const exists = prev.some(z => z.id === zone.id)
      return exists ? prev.map(z => (z.id === zone.id ? zone : z)) : [...prev, zone]
    })
  }

  const handleZoneDeleted = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id))
  }

  const defaultCenter: [number, number] = zones.length > 0
    ? [zones.reduce((s, z) => s + z.lat, 0) / zones.length, zones.reduce((s, z) => s + z.lng, 0) / zones.length]
    : CARACAS_CENTER

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Mapa de Zonas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Vista geográfica de las operaciones activas</p>
        </div>
        {canManage && (
          <button
            onClick={handleNewZone}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-strong)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            <MapPin size={13} /> Nueva zona
          </button>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-card overflow-hidden" style={{ height: 560 }}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-red-500">
            Error al cargar el mapa: {error}
          </div>
        ) : (
          <LeafletMap zones={zones} markers={markers} canManage={canManage} onEditZone={handleEditZone} />
        )}
      </div>

      <ZoneModal
        open={modalOpen}
        zone={editingZone}
        defaultCenter={defaultCenter}
        onClose={() => setModalOpen(false)}
        onSaved={handleZoneSaved}
        onDeleted={handleZoneDeleted}
      />
    </div>
  )
}
