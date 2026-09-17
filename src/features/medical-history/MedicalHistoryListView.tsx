import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ClipboardList, Search } from 'lucide-react'
import { medicalHistoryApi } from '@/core/api/medical-history.api'
import type { MedicalHistoryPatientSummary } from '@/core/api/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Card } from '@/core/components/Card'
import { Badge } from '@/core/components/Badge'

const STATUS_CONFIG: Record<MedicalHistoryPatientSummary['status'], { label: string; variant: 'default' | 'warning' | 'success' }> = {
  none: { label: 'Sin iniciar', variant: 'default' },
  draft: { label: 'Borrador', variant: 'warning' },
  completed: { label: 'Completa', variant: 'success' },
}

function timeAgo(iso: string): string {
  const diffMin = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (diffMin < 1) return 'hace un momento'
  if (diffMin < 60) return `hace ${diffMin}m`
  if (diffMin < 1440) return `hace ${Math.floor(diffMin / 60)}h`
  return `hace ${Math.floor(diffMin / 1440)}d`
}

export function MedicalHistoryListView() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isDoctor = user?.role === 'doctor'
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<MedicalHistoryPatientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true)
      setError(null)
      medicalHistoryApi.listPatients(search || undefined)
        .then(setPatients)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(handle)
  }, [search])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Historia médica</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {isDoctor ? 'Antecedentes clínicos de tus pacientes' : 'Antecedentes clínicos de los pacientes'}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar paciente por nombre o teléfono..."
          className="w-full h-9 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-9 pr-3 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900"
        />
      </div>

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
        </div>
      )}

      {!loading && error && <div className="text-sm text-red-500 p-4">Error: {error}</div>}

      {!loading && !error && (
        <Card padding="none" className="overflow-hidden">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {patients.map(p => {
              const status = STATUS_CONFIG[p.status]
              return (
                <li
                  key={p.patientId}
                  onClick={() => navigate(`/medical-history/${p.patientId}`)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950">
                    <ClipboardList size={15} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{p.patientName}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {p.allergyCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-500">
                          <AlertTriangle size={10} />
                          {p.allergyCount} alergia{p.allergyCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {p.patientAge} años · {p.patientPhone}
                      {p.updatedAt && <> · actualizado {timeAgo(p.updatedAt)}</>}
                    </p>
                  </div>
                </li>
              )
            })}
            {patients.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-zinc-400">
                {isDoctor
                  ? 'Aún no tienes pacientes asignados.'
                  : search ? 'Sin resultados para tu búsqueda.' : 'No hay pacientes registrados.'}
              </li>
            )}
          </ul>
        </Card>
      )}
    </div>
  )
}
