import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { requestsApi, type RequestsFilter } from '@/core/api/requests.api'
import type { MedRequest } from '@/core/api/types'
import { STATES, PRIORITY, type StateId, type PriorityId } from '@/data/medData'
import { StateBadge } from '@/components/ui/StateBadge'
import { PriorityPill } from '@/components/ui/PriorityPill'
import { Avatar } from '@/components/ui/Avatar'

export function RequestsView() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<MedRequest[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<RequestsFilter>({ limit: 10 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    requestsApi.getAll({ ...filter, page })
      .then(res => { setRequests(res.data); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [filter, page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(total / (filter.limit ?? 10)))

  const handleStateFilter = (s: StateId | 'all') => {
    setFilter(f => ({ ...f, state: s === 'all' ? undefined : s }))
    setPage(1)
  }
  const handlePriFilter = (p: PriorityId | 'all') => {
    setFilter(f => ({ ...f, priority: p === 'all' ? undefined : p }))
    setPage(1)
  }
  const handleSearch = (q: string) => {
    setFilter(f => ({ ...f, search: q || undefined }))
    setPage(1)
  }

  const activeState = (filter.state ?? 'all') as StateId | 'all'
  const activePriority = (filter.priority ?? 'all') as PriorityId | 'all'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Solicitudes</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} solicitudes totales</p>
      </div>

      {/* State tabs */}
      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        {([
          { id: 'all' as const, label: 'Todas' },
          ...STATES.map(s => ({ id: s.id as StateId, label: s.label })),
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => handleStateFilter(tab.id)}
            className={[
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              activeState === tab.id
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
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={filter.search ?? ''}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar ID, paciente, dirección, síntomas..."
            className="pl-8 pr-3 h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900 w-72"
          />
        </div>
        <select
          value={activePriority}
          onChange={e => handlePriFilter(e.target.value as PriorityId | 'all')}
          className="h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 px-2 focus:outline-none"
        >
          <option value="all">Toda prioridad</option>
          {PRIORITY.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                {['ID', 'Paciente', 'Dirección / Zona', 'Síntomas', 'Médico', 'Estado', 'Prioridad'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
                  </td>
                </tr>
              ) : requests.map(r => (
                <tr
                  key={r.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/requests/${r.id}`)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{r.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.patient.name} size={28} />
                      <div>
                        <p className="text-xs font-medium text-zinc-900 dark:text-white">{r.patient.name}</p>
                        <p className="text-[10px] text-zinc-400">{r.patient.age} años</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-[180px] truncate">{r.address}</p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400 mt-0.5">
                      <MapPin size={9} /> {r.zone.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{r.symptoms}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.doctor ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={r.doctor.name} size={24} status={r.doctor.status} />
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">{r.doctor.name.replace(/^(Dr\.|Dra\.)\s*/, '')}</p>
                      </div>
                    ) : (
                      <span className="text-xs italic text-zinc-400">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"><StateBadge state={r.state} size="sm" /></td>
                  <td className="px-4 py-3 whitespace-nowrap"><PriorityPill priority={r.priority} withIcon /></td>
                </tr>
              ))}
              {!loading && requests.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Mostrando {requests.length} de {total} resultado{total !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={['flex h-7 w-7 items-center justify-center rounded border text-xs font-medium transition-colors', p === page ? 'text-white border-transparent' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'].join(' ')}
                style={p === page ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
