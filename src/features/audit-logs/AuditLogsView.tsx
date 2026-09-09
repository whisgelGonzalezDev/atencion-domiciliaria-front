import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react'
import { auditLogsApi, type AuditLogsFilter } from '@/core/api/auditLogs.api'
import type { AuditLog } from '@/core/api/types'
import { useAuth } from '@/features/auth/hooks/useAuth'

const ACTION_COLOR: Record<string, string> = {
  create: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
  update: 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400',
  cancel: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400',
  delete: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400',
}

function actionColor(action: string): string {
  const key = Object.keys(ACTION_COLOR).find(k => action.toLowerCase().includes(k))
  return key ? ACTION_COLOR[key] : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
}

export function AuditLogsView() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 20

  const load = useCallback(() => {
    if (!isAdmin) return
    const filter: AuditLogsFilter = { page, limit, entityType: entityType || undefined }
    setLoading(true)
    auditLogsApi.getAll(filter)
      .then(res => { setLogs(res.data); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [page, entityType, isAdmin])

  useEffect(() => { load() }, [load])

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <ShieldAlert size={28} className="text-zinc-300 dark:text-zinc-700" />
        <p className="text-zinc-500 dark:text-zinc-400">Esta sección está restringida a administradores</p>
        <button onClick={() => navigate('/overview')} className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
          Volver al resumen
        </button>
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Auditoría</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} eventos registrados</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={entityType}
          onChange={e => { setEntityType(e.target.value); setPage(1) }}
          className="h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 px-2 focus:outline-none"
        >
          <option value="">Toda entidad</option>
          <option value="request">Solicitudes</option>
          <option value="patient">Pacientes</option>
          <option value="visit">Visitas</option>
          <option value="billing">Facturación</option>
          <option value="zone">Zonas</option>
        </select>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                {['Fecha', 'Actor', 'Acción', 'Entidad', 'Detalle'].map(h => (
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
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-medium text-zinc-900 dark:text-white">{log.actorEmail ?? 'Sistema'}</p>
                    {log.actorRole && <p className="text-[10px] text-zinc-400 capitalize">{log.actorRole}</p>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', actionColor(log.action)].join(' ')}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 capitalize">{log.entityType}</p>
                    {log.entityId && <p className="text-[10px] font-mono text-zinc-400">{log.entityId}</p>}
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    {log.metadata ? (
                      <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate" title={JSON.stringify(log.metadata)}>
                        {JSON.stringify(log.metadata)}
                      </p>
                    ) : (
                      <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">Sin eventos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Mostrando {logs.length} de {total} resultado{total !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="px-2 text-xs text-zinc-500">{page} / {totalPages}</span>
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
