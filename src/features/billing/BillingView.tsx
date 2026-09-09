import { useEffect, useState, useCallback } from 'react'
import { Receipt, ChevronLeft, ChevronRight, Check, Ban } from 'lucide-react'
import { billingApi, BILLING_METHODS, type BillingFilter } from '@/core/api/billing.api'
import type { BillingCharge } from '@/core/api/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { NewBillingModal } from './components/NewBillingModal'
import { toast } from 'sonner'

type StatusFilter = 'all' | 'pending' | 'paid' | 'cancelled'

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all',       label: 'Todos' },
  { id: 'pending',   label: 'Pendientes' },
  { id: 'paid',      label: 'Pagados' },
  { id: 'cancelled', label: 'Cancelados' },
]

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900',
  paid:      'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
  cancelled: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900',
}

const STATUS_LABEL: Record<string, string> = { pending: 'Pendiente', paid: 'Pagado', cancelled: 'Cancelado' }

function methodLabel(id: string): string {
  return BILLING_METHODS.find(m => m.id === id)?.label ?? id
}

export function BillingView() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [charges, setCharges] = useState<BillingCharge[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [newOpen, setNewOpen] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const limit = 10

  const load = useCallback(() => {
    const filter: BillingFilter = { page, limit, status: status === 'all' ? undefined : status }
    setLoading(true)
    billingApi.getAll(filter)
      .then(res => { setCharges(res.data); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [page, status])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const handleMarkPaid = async (id: string) => {
    if (actingId) return
    setActingId(id)
    try {
      const updated = await billingApi.markPaid(id)
      setCharges(prev => prev.map(c => c.id === id ? updated : c))
      toast.success('Cobro marcado como pagado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al marcar como pagado')
    } finally {
      setActingId(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (actingId || !window.confirm('¿Cancelar este cobro pendiente?')) return
    setActingId(id)
    try {
      const updated = await billingApi.cancel(id)
      setCharges(prev => prev.map(c => c.id === id ? updated : c))
      toast.success('Cobro cancelado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar el cobro')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Facturación</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} cobros registrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-strong)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            <Receipt size={13} /> Nuevo cobro
          </button>
        )}
      </div>

      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setStatus(tab.id); setPage(1) }}
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

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                {['Solicitud', 'Monto', 'Método', 'Referencia', 'Estado', 'Fecha', 'Acciones'].map(h => (
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
              ) : charges.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{c.requestId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">${c.amountUsd.toFixed(2)}</p>
                    <p className="text-[10px] text-zinc-400">Bs {c.amountBs.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{methodLabel(c.method)}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{c.reference}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', STATUS_COLOR[c.status]].join(' ')}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isAdmin && c.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button
                          disabled={actingId === c.id}
                          onClick={() => handleMarkPaid(c.id)}
                          className="inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 disabled:opacity-40 transition-opacity"
                        >
                          <Check size={11} /> Pagado
                        </button>
                        <button
                          disabled={actingId === c.id}
                          onClick={() => handleCancel(c.id)}
                          className="inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 disabled:opacity-40 transition-colors"
                        >
                          <Ban size={11} /> Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && charges.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Mostrando {charges.length} de {total} resultado{total !== 1 ? 's' : ''}</p>
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

      <NewBillingModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={load}
      />
    </div>
  )
}
