import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Heart, Stethoscope, Clock, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { dashboardApi } from '@/core/api/dashboard.api'
import type { KpiData, MapMarker, MedRequest } from '@/core/api/types'
import { MapPlaceholder } from '@/components/ui/MapPlaceholder'
import { StateBadge } from '@/components/ui/StateBadge'
import { PriorityPill } from '@/components/ui/PriorityPill'
import { Card } from '@/core/components/Card'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  delta: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

function KpiCard({ label, value, sub, delta, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  const positive = delta >= 0
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <div className={['flex h-8 w-8 items-center justify-center rounded-lg', iconBg].join(' ')}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
      <div className={['mt-2 inline-flex items-center gap-1 text-xs font-medium', positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'].join(' ')}>
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {positive ? '+' : ''}{delta}% vs ayer
      </div>
    </Card>
  )
}

function timeAgo(min: number) {
  if (min < 60) return `hace ${min}m`
  return `hace ${Math.floor(min / 60)}h ${min % 60}m`
}

export function OverviewView() {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [recent, setRecent] = useState<MedRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      dashboardApi.getKpis(),
      dashboardApi.getMapMarkers(),
      dashboardApi.getRecentHighPriority(),
    ])
      .then(([k, m, r]) => { setKpis(k); setMarkers(m); setRecent(r) })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
      </div>
    )
  }
  if (error) return <div className="text-sm text-red-500 p-4">Error: {error}</div>
  if (!kpis) return null

  const zoneCounts: Record<string, number> = {}
  recent.forEach(r => { zoneCounts[r.zone.name] = (zoneCounts[r.zone.name] ?? 0) + 1 })
  const topZones = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Resumen</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Operaciones en tiempo real</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Solicitudes hoy"
          value={kpis.todayRequests}
          delta={kpis.todayDelta}
          icon={List}
          iconBg="bg-sky-50 dark:bg-sky-950"
          iconColor="text-sky-600 dark:text-sky-400"
        />
        <KpiCard
          label="Pacientes atendidos"
          value={kpis.patientsAttended}
          delta={kpis.patientsDelta}
          icon={Heart}
          iconBg="bg-emerald-50 dark:bg-emerald-950"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          label="Médicos en ruta"
          value={kpis.doctorsRoute}
          sub={`${kpis.doctorsAvail} disponibles`}
          delta={0}
          icon={Stethoscope}
          iconBg="bg-violet-50 dark:bg-violet-950"
          iconColor="text-violet-600 dark:text-violet-400"
        />
        <KpiCard
          label="Tiempo prom. respuesta"
          value={`${kpis.avgResponse}m`}
          delta={kpis.avgResponseDelta}
          icon={Clock}
          iconBg="bg-amber-50 dark:bg-amber-950"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Map + Priority list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <Card padding="none" className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Mapa de operaciones</p>
            <div className="flex items-center gap-3">
              {[
                { color: 'bg-amber-400', label: 'Pendiente' },
                { color: 'bg-sky-400',   label: 'En camino' },
                { color: 'bg-violet-400',label: 'Atendiendo' },
                { color: 'bg-emerald-400',label: 'Completada' },
              ].map(l => (
                <span key={l.label} className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-500">
                  <span className={['h-2 w-2 rounded-full', l.color].join(' ')} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4 h-80">
            <MapPlaceholder markers={markers} />
          </div>
          <div className="px-5 py-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-4">
            {topZones.map(([zone, count]) => (
              <span key={zone} className="text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{zone}</span> ({count})
              </span>
            ))}
          </div>
        </Card>

        {/* High priority list */}
        <Card padding="none" className="lg:col-span-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Alta prioridad</p>
            <button
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
              onClick={() => navigate('/requests')}
            >
              Ver todas
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {recent.map(r => (
              <li
                key={r.id}
                className="px-4 py-3 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/requests/${r.id}`)}
              >
                <div className="mt-0.5 shrink-0">
                  <AlertTriangle size={14} className={r.priority === 'emergency' ? 'text-red-500' : 'text-amber-500'} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{r.patient.name}</p>
                    <PriorityPill priority={r.priority} withIcon={false} />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{r.symptoms}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-zinc-400">{r.id}</span>
                    <span className="text-[10px] text-zinc-400">·</span>
                    <span className="text-[10px] text-zinc-400">{r.zone.name}</span>
                    <span className="text-[10px] text-zinc-400">·</span>
                    <span className="text-[10px] text-zinc-400">{timeAgo(r.minutesAgo)}</span>
                  </div>
                </div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-zinc-400">Sin solicitudes de alta prioridad</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}
