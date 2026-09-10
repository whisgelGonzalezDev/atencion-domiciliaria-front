import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Circle, CircleMarker, useMapEvents } from 'react-leaflet'
import { X } from 'lucide-react'
import { zonesApi } from '@/core/api/zones.api'
import type { Zone } from '@/core/api/types'
import { toast } from 'sonner'

interface ZoneModalProps {
  open: boolean
  zone: Zone | null
  defaultCenter: [number, number]
  onClose: () => void
  onSaved: (zone: Zone) => void
}

function ClickToPlace({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: e => onClick(e.latlng.lat, e.latlng.lng),
  })
  return null
}

interface FormErrors {
  name?: string
  position?: string
}

export function ZoneModal({ open, zone, defaultCenter, onClose, onSaved }: ZoneModalProps) {
  const isEdit = !!zone

  const [name, setName] = useState('')
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [radiusKm, setRadiusKm] = useState(2)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (zone) {
      setName(zone.name)
      setPosition([zone.lat, zone.lng])
      setRadiusKm(zone.radiusKm)
    } else {
      setName('')
      setPosition(null)
      setRadiusKm(2)
    }
    setErrors({})
  }, [open, zone])

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'El nombre es requerido'
    if (!position) e.position = 'Haz clic en el mapa para ubicar el centro de la zona'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate() || !position) return
    setLoading(true)
    try {
      const body = { name: name.trim(), lat: position[0], lng: position[1], radiusKm }
      const saved = isEdit ? await zonesApi.update(zone!.id, body) : await zonesApi.create(body)
      toast.success(isEdit ? 'Zona actualizada' : 'Zona creada')
      onSaved(saved)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la zona'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const mapCenter = position ?? defaultCenter

  return createPortal(
    // z-[1100]: Leaflet's own panes/controls go up to z-index 1000 (see
    // leaflet.css), and this modal sits on the same page as MapView's live
    // map, so the usual z-50 other modals use would render behind it.
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{isEdit ? 'Editar zona' : 'Nueva zona'}</h2>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Nombre *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. La Candelaria" className={inputCls(!!errors.name)} />
            {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Centro de la zona *</label>
              <span className="text-[10px] text-zinc-400">Haz clic en el mapa para ubicarla</span>
            </div>
            <div className={['h-56 rounded border overflow-hidden', errors.position ? 'border-red-300 dark:border-red-700' : 'border-zinc-200 dark:border-zinc-700'].join(' ')}>
              <MapContainer center={mapCenter} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickToPlace onClick={(lat, lng) => setPosition([lat, lng])} />
                {position && (
                  <>
                    <Circle center={position} radius={radiusKm * 1000} pathOptions={{ color: '#0369a1', fillColor: '#0369a1', fillOpacity: 0.12, weight: 1.5 }} />
                    <CircleMarker center={position} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#0369a1', fillOpacity: 1 }} />
                  </>
                )}
              </MapContainer>
            </div>
            {errors.position && <p className="text-[10px] text-red-500">{errors.position}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Radio</label>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{radiusKm.toFixed(1)} km</span>
            </div>
            <input
              type="range" min={0.5} max={10} step={0.1}
              value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="h-9 px-5 rounded text-xs font-medium text-white flex items-center gap-2 disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear zona'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded border px-3 py-2 text-sm',
    'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400',
    'focus:outline-none focus:ring-1 transition-shadow',
    hasError
      ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900'
      : 'border-zinc-200 dark:border-zinc-700 focus:ring-sky-200 dark:focus:ring-sky-900',
  ].join(' ')
}
