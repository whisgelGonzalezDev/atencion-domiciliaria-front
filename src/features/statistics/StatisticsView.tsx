import { useEffect, useState } from 'react'
import { List, TrendingUp, DollarSign } from 'lucide-react'
import { statisticsApi } from '@/core/api/statistics.api'
import type { RequestsStats, PerformanceStats, IncomeStats, StatsPeriod } from '@/core/api/types'
import { Card } from '@/core/components/Card'
import { STATES, PRIORITY } from '@/data/medData'
import { BILLING_METHODS } from '@/core/api/billing.api'
import { BarTrend } from './components/BarTrend'
import { BreakdownBars } from './components/BreakdownBars'
import { StatTile } from './components/StatTile'

const PERIODS: { id: StatsPeriod; label: string }[] = [
  { id: 'day',   label: 'Día' },
  { id: 'week',  label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'year',  label: 'Año' },
]

const TABS = [
  { id: 'requests',    label: 'Solicitudes', icon: List },
  { id: 'performance', label: 'Rendimiento', icon: TrendingUp },
  { id: 'income',      label: 'Ingresos',    icon: DollarSign },
] as const

type TabId = typeof TABS[number]['id']

const STATE_LABEL = Object.fromEntries(STATES.map(s => [s.id, s.label]))
const STATE_COLOR: Record<string, string> = {
  pending: 'bg-amber-400', enroute: 'bg-sky-400', attending: 'bg-violet-400',
  done: 'bg-emerald-400', cancelled: 'bg-rose-400',
}
const PRIORITY_LABEL = Object.fromEntries(PRIORITY.map(p => [p.id, p.label]))
const PRIORITY_COLOR: Record<string, string> = { low: 'bg-zinc-400', mid: 'bg-amber-400', emergency: 'bg-red-500' }
const METHOD_LABEL = Object.fromEntries(BILLING_METHODS.map(m => [m.id, m.label]))
const BILLING_STATUS_LABEL: Record<string, string> = { pending: 'Pendiente', paid: 'Pagado', cancelled: 'Cancelado' }
const BILLING_STATUS_COLOR: Record<string, string> = { pending: 'bg-amber-400', paid: 'bg-emerald-400', cancelled: 'bg-rose-400' }

function usd(v: number) {
  return `$${v.toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function selectCls() {
  return 'h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 px-2 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900'
}

export function StatisticsView() {
  const [period, setPeriod] = useState<StatsPeriod>('week')
  const [tab, setTab] = useState<TabId>('requests')
  const [requestsStats, setRequestsStats] = useState<RequestsStats | null>(null)
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null)
  const [incomeStats, setIncomeStats] = useState<IncomeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      statisticsApi.getRequestsStats(period),
      statisticsApi.getPerformanceStats(period),
      statisticsApi.getIncomeStats(period),
    ])
      .then(([r, p, i]) => { setRequestsStats(r); setPerformanceStats(p); setIncomeStats(i) })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Estadísticas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Solicitudes, rendimiento e ingresos del sistema</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value as StatsPeriod)} className={selectCls()}>
          {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === id
                ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
            ].join(' ')}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
        </div>
      )}
      {!loading && error && <div className="text-sm text-red-500 p-4">Error: {error}</div>}

      {!loading && !error && tab === 'requests' && requestsStats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile label="Total de solicitudes" value={requestsStats.totalRequests} delta={requestsStats.deltaPct} />
            <StatTile
              label="Estado más frecuente"
              value={STATE_LABEL[requestsStats.byState.slice().sort((a, b) => b.count - a.count)[0]?.key] ?? '—'}
            />
            <StatTile
              label="Prioridad más frecuente"
              value={PRIORITY_LABEL[requestsStats.byPriority.slice().sort((a, b) => b.count - a.count)[0]?.key] ?? '—'}
            />
          </div>

          <Card padding="md">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Solicitudes por período</p>
            <BarTrend data={requestsStats.series} colorClass="bg-sky-400" />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card padding="md">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Por estado</p>
              <BreakdownBars items={requestsStats.byState.map(s => ({
                key: s.key, label: STATE_LABEL[s.key] ?? s.key, value: s.count, colorClass: STATE_COLOR[s.key] ?? 'bg-zinc-400',
              }))} />
            </Card>
            <Card padding="md">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Por prioridad</p>
              <BreakdownBars items={requestsStats.byPriority.map(p => ({
                key: p.key, label: PRIORITY_LABEL[p.key] ?? p.key, value: p.count, colorClass: PRIORITY_COLOR[p.key] ?? 'bg-zinc-400',
              }))} />
            </Card>
            <Card padding="md">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Por zona</p>
              <BreakdownBars items={requestsStats.byZone.map(z => ({
                key: z.key, label: z.key, value: z.count, colorClass: 'bg-sky-400',
              }))} />
            </Card>
          </div>
        </div>
      )}

      {!loading && !error && tab === 'performance' && performanceStats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile
              label="Tiempo prom. de atención"
              value={`${performanceStats.avgResponseMinutes}m`}
              delta={performanceStats.avgResponseDeltaPct}
              deltaGoodDirection="down"
            />
            <StatTile
              label="Tasa de completadas"
              value={`${performanceStats.completionRate}%`}
              delta={performanceStats.completionRateDeltaPct}
            />
            <StatTile label="Tasa de canceladas" value={`${performanceStats.cancelledRate}%`} />
          </div>

          <Card padding="md">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Solicitudes completadas por período</p>
            <BarTrend data={performanceStats.series} colorClass="bg-violet-400" />
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Rendimiento por médico</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-5 py-2 font-medium">Médico</th>
                  <th className="px-5 py-2 font-medium text-right">Solicitudes completadas</th>
                  <th className="px-5 py-2 font-medium text-right">Tiempo prom. (min)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {performanceStats.byDoctor.map(d => (
                  <tr key={d.doctorId}>
                    <td className="px-5 py-2.5 text-zinc-900 dark:text-white">{d.doctorName}</td>
                    <td className="px-5 py-2.5 text-right text-zinc-600 dark:text-zinc-300">{d.completedRequests}</td>
                    <td className="px-5 py-2.5 text-right text-zinc-600 dark:text-zinc-300">{d.avgResponseMinutes}</td>
                  </tr>
                ))}
                {performanceStats.byDoctor.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-zinc-400">Sin datos en este período</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {!loading && !error && tab === 'income' && incomeStats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile label="Ingresos (USD)" value={usd(incomeStats.totalUsd)} delta={incomeStats.deltaPct} />
            <StatTile label="Ingresos (Bs)" value={incomeStats.totalBs.toLocaleString('es')} />
            <StatTile label="Pendiente por cobrar" value={usd(incomeStats.pendingUsd)} />
          </div>

          <Card padding="md">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Ingresos por período (USD)</p>
            <BarTrend data={incomeStats.series} colorClass="bg-emerald-400" formatValue={usd} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card padding="md">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Por método de pago</p>
              <BreakdownBars items={incomeStats.byMethod.map(m => ({
                key: m.method, label: METHOD_LABEL[m.method] ?? m.method, value: m.totalUsd, colorClass: 'bg-emerald-400',
              }))} formatValue={usd} />
            </Card>
            <Card padding="md">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Por estado de cobro</p>
              <BreakdownBars items={incomeStats.byStatus.map(s => ({
                key: s.status, label: BILLING_STATUS_LABEL[s.status] ?? s.status, value: s.totalUsd,
                colorClass: BILLING_STATUS_COLOR[s.status] ?? 'bg-zinc-400',
              }))} formatValue={usd} />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
