import { useEffect, useState, useCallback } from 'react'
import { CalendarPlus, MapPin, Repeat } from 'lucide-react'
import { visitsApi, type VisitsFilter } from '@/core/api/visits.api'
import { zonesApi } from '@/core/api/zones.api'
import { doctorsApi } from '@/core/api/doctors.api'
import type { Visit, Zone, Doctor } from '@/core/api/types'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { NewVisitModal } from './components/NewVisitModal'
import { VisitActionsModal } from './components/VisitActionsModal'

type StatusFilter = 'all' | 'scheduled' | 'confirmed' | 'done' | 'missed' | 'cancelled'

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all',       label: 'Todas' },
  { id: 'scheduled', label: 'Programadas' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'done',       label: 'Completadas' },
  { id: 'missed',    label: 'No asistió' },
  { id: 'cancelled', label: 'Canceladas' },
]

const STATUS_COLOR: Record<string, string> = {
  scheduled: 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-900',
  confirmed: 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900',
  done:      'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
  missed:    'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900',
  cancelled: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900',
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Programada', confirmed: 'Confirmada', done: 'Completada', missed: 'No asistió', cancelled: 'Cancelada',
}

function startOfWeekIso(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function VisitsView() {
  const { user } = useAuth()
  const canManage = user?.role === 'admin' || user?.role === 'operativo'
  const [visits, setVisits] = useState<Visit[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [from, setFrom] = useState(startOfWeekIso(-7))
  const [to, setTo] = useState(startOfWeekIso(30))
  const [zoneId, setZoneId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [newOpen, setNewOpen] = useState(false)
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null)

  useEffect(() => {
    zonesApi.getAll().then(setZones).catch(() => {})
    doctorsApi.getAll().then(setDoctors).catch(() => {})
  }, [])

  const load = useCallback(() => {
    const filter: VisitsFilter = {
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      zoneId: zoneId || undefined,
      doctorId: doctorId || undefined,
      status: status === 'all' ? undefined : status,
    }
    setLoading(true)
    visitsApi.getAgenda(filter)
      .then(data => setVisits([...data].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))))
      .finally(() => setLoading(false))
  }, [from, to, zoneId, doctorId, status])

  useEffect(() => { load() }, [load])

  const handleUpdated = (updated: Visit) => {
    setVisits(prev => prev.map(v => v.id === updated.id ? updated : v))
    setActiveVisit(updated)
  }

  const handleCancelledSeries = (seriesId: string) => {
    load()
    setActiveVisit(null)
    void seriesId
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Agenda de visitas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{visits.length} visitas en el rango seleccionado</p>
        </div>
        {canManage && (
          <button
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-strong)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            <CalendarPlus size={13} /> Programar visita
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatus(tab.id)}
            className={[
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              status === tab.id
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={filterInputCls()} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className={filterInputCls()} />
        <select value={zoneId} onChange={e => setZoneId(e.target.value)} className={filterInputCls()}>
          <option value="">Toda zona</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <select value={doctorId} onChange={e => setDoctorId(e.target.value)} className={filterInputCls()}>
          <option value="">Todo médico</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                {['Fecha / Hora', 'Paciente', 'Zona', 'Médico', 'Duración', 'Estado'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
                  </td>
                </tr>
              ) : visits.map(v => (
                <tr
                  key={v.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  onClick={() => setActiveVisit(v)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-medium text-zinc-900 dark:text-white">
                      {new Date(v.scheduledAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                      {new Date(v.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      {v.seriesId && <Repeat size={9} />}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar name={v.patientName} size={26} />
                      <p className="text-xs font-medium text-zinc-900 dark:text-white">{v.patientName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <MapPin size={10} /> {v.zoneName}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-400">
                    {v.doctorName ?? <span className="italic text-zinc-400">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-400">{v.durationMinutes}m</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', STATUS_COLOR[v.status]].join(' ')}>
                      {STATUS_LABEL[v.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && visits.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-400">Sin visitas en este rango</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewVisitModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={load} />
      <VisitActionsModal
        open={!!activeVisit}
        visit={activeVisit}
        onClose={() => setActiveVisit(null)}
        onUpdated={handleUpdated}
        onCancelledSeries={handleCancelledSeries}
      />
    </div>
  )
}

function filterInputCls() {
  return 'h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 px-2 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900'
}
