import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, ChevronLeft, ChevronRight, Droplet } from 'lucide-react'
import { patientsApi, type PatientsFilter } from '@/core/api/patients.api'
import type { Patient } from '@/core/api/types'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { NewPatientModal } from './components/NewPatientModal'

export function PatientsView() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [patients, setPatients] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<PatientsFilter>({ limit: 10 })
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    patientsApi.getAll({ ...filter, page })
      .then(res => { setPatients(res.data); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [filter, page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(total / (filter.limit ?? 10)))

  const handleSearch = (q: string) => {
    setFilter(f => ({ ...f, search: q || undefined }))
    setPage(1)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Pacientes</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} pacientes registrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-strong)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            <UserPlus size={13} /> Nuevo paciente
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={filter.search ?? ''}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="pl-8 pr-3 h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900 w-72"
        />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                {['Paciente', 'Edad', 'Teléfono', 'Tipo sanguíneo', 'Historial'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
                  </td>
                </tr>
              ) : patients.map(p => (
                <tr
                  key={p.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/patients/${p.id}`)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size={28} />
                      <p className="text-xs font-medium text-zinc-900 dark:text-white">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{p.age} años</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{p.phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.bloodType ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-2 py-0.5 text-[10px] font-medium">
                        <Droplet size={9} /> {p.bloodType}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{p.historyShort || '—'}</p>
                  </td>
                </tr>
              ))}
              {!loading && patients.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Mostrando {patients.length} de {total} resultado{total !== 1 ? 's' : ''}</p>
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

      <NewPatientModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={load}
      />
    </div>
  )
}
