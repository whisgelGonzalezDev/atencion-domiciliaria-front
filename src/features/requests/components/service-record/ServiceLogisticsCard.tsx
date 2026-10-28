import { MapPin } from 'lucide-react'
import type { ExternalProviderAssignment, RoomDetails, ServiceRecord, ServiceTiming } from '@/core/api/types'
import { inputCls, labelCls } from '../../formStyles'
import { SectionCard } from './SectionCard'

interface ServiceLogisticsCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
  address: string
}

const ROOM_OPTIONS: { key: keyof RoomDetails; label: string }[] = [
  { key: 'hasElectricity', label: 'Servicio eléctrico' },
  { key: 'hasUnitGuard', label: 'Resguardo de unidad' },
  { key: 'hasPrecipitation', label: 'Precipitaciones' },
  { key: 'hasElevator', label: 'Ascensor' },
]

export function ServiceLogisticsCard({ data, update, address }: ServiceLogisticsCardProps) {
  const setRoom = (key: keyof RoomDetails, value: boolean) =>
    update(prev => ({ ...prev, roomDetails: { ...prev.roomDetails, [key]: value } }))

  const setProvider = (key: keyof ExternalProviderAssignment, value: string | boolean) =>
    update(prev => ({ ...prev, externalProvider: { ...prev.externalProvider, [key]: value } }))

  const setTiming = (key: keyof ServiceTiming, value: string) =>
    update(prev => ({ ...prev, timing: { ...prev.timing, [key]: value } }))

  const p = data.externalProvider
  const t = data.timing
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <SectionCard title="Logística del servicio">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 flex h-9 items-center justify-center gap-2 rounded text-xs font-medium text-white"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        <MapPin size={13} />
        Abrir en Google Maps
      </a>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Detalles de habitación</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {ROOM_OPTIONS.map(opt => (
          <label key={opt.key} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={data.roomDetails[opt.key]}
              onChange={e => setRoom(opt.key, e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
        <input
          type="checkbox"
          checked={p.enabled}
          onChange={e => setProvider('enabled', e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
        />
        Asignar proveedor externo
      </label>
      {p.enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls}>Sede</label>
            <input value={p.headquarters} onChange={e => setProvider('headquarters', e.target.value)} className={inputCls()} />
          </div>
          <div>
            <label className={labelCls}>Proveedor</label>
            <input value={p.providerName} onChange={e => setProvider('providerName', e.target.value)} className={inputCls()} />
          </div>
          <div>
            <label className={labelCls}>Creado por</label>
            <input value={p.createdBy} onChange={e => setProvider('createdBy', e.target.value)} className={inputCls()} />
          </div>
          <div>
            <label className={labelCls}>Atendido por</label>
            <input value={p.attendedBy} onChange={e => setProvider('attendedBy', e.target.value)} className={inputCls()} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Comienzo del servicio</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={t.startDate} onChange={e => setTiming('startDate', e.target.value)} className={inputCls()} />
            <input type="time" value={t.startTime} onChange={e => setTiming('startTime', e.target.value)} className={inputCls()} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Finalización del servicio</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={t.endDate} onChange={e => setTiming('endDate', e.target.value)} className={inputCls()} />
            <input type="time" value={t.endTime} onChange={e => setTiming('endTime', e.target.value)} className={inputCls()} />
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
