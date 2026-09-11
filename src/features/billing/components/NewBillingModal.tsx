import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X, Search } from 'lucide-react'
import { billingApi, BILLING_METHODS } from '@/core/api/billing.api'
import { requestsApi } from '@/core/api/requests.api'
import type { MedRequest, BillingCharge } from '@/core/api/types'
import { useSystemSettings } from '@/core/providers/SystemSettingsProvider'
import { toast } from 'sonner'

interface NewBillingModalProps {
  open: boolean
  onClose: () => void
  onCreated: (charge: BillingCharge) => void
}

interface FormErrors {
  request?: string
  amountUsd?: string
  exchangeRate?: string
  method?: string
  reference?: string
}

export function NewBillingModal({ open, onClose, onCreated }: NewBillingModalProps) {
  const { settings } = useSystemSettings()
  const [reqSearch, setReqSearch] = useState('')
  const [reqResults, setReqResults] = useState<MedRequest[]>([])
  const [request, setRequest] = useState<MedRequest | null>(null)

  const [amountUsd, setAmountUsd] = useState('')
  const [exchangeRate, setExchangeRate] = useState('')
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !reqSearch.trim()) { setReqResults([]); return }
    const t = setTimeout(() => {
      requestsApi.getAll({ search: reqSearch, limit: 5 }).then(res => setReqResults(res.data)).catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [open, reqSearch])

  // Prellena la tasa de cambio con el valor por defecto configurado en el
  // panel admin, sin pisar lo que la operadora ya haya escrito.
  useEffect(() => {
    if (open && !exchangeRate && settings?.defaultExchangeRate) {
      setExchangeRate(String(settings.defaultExchangeRate))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, settings?.defaultExchangeRate])

  const amountBsPreview = (() => {
    const usd = Number(amountUsd), rate = Number(exchangeRate)
    if (!usd || !rate) return null
    return (usd * rate).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  })()

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!request) e.request = 'Selecciona una solicitud'
    if (!amountUsd.trim() || isNaN(Number(amountUsd)) || Number(amountUsd) <= 0) e.amountUsd = 'Monto inválido'
    if (!exchangeRate.trim() || isNaN(Number(exchangeRate)) || Number(exchangeRate) <= 0) e.exchangeRate = 'Tasa inválida'
    if (!method) e.method = 'Selecciona un método'
    if (!reference.trim()) e.reference = 'La referencia es requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate() || !request) return
    setLoading(true)
    try {
      const charge = await billingApi.create({
        requestId: request.id,
        amountUsd: Number(amountUsd),
        exchangeRate: Number(exchangeRate),
        method,
        reference: reference.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
      toast.success('Cobro registrado')
      onCreated(charge)
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el cobro'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReqSearch(''); setReqResults([]); setRequest(null)
    setAmountUsd(''); setExchangeRate(''); setMethod(''); setReference(''); setNotes('')
    setErrors({}); setLoading(false)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Nuevo cobro</h2>
          <button onClick={handleClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Solicitud *</label>
            {request ? (
              <div className="flex items-center justify-between rounded border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-white truncate">{request.patient.name}</p>
                  <p className="text-[10px] font-mono text-zinc-400">{request.id}</p>
                </div>
                <button type="button" onClick={() => { setRequest(null); setReqSearch('') }} className="text-xs text-zinc-400 hover:text-zinc-600 shrink-0">Cambiar</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={reqSearch}
                    onChange={e => setReqSearch(e.target.value)}
                    placeholder="Buscar por ID, paciente, dirección..."
                    className={[inputCls(!!errors.request), 'pl-8'].join(' ')}
                  />
                </div>
                {reqResults.length > 0 && (
                  <div className="mt-1 rounded border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                    {reqResults.map(r => (
                      <button
                        type="button" key={r.id}
                        onClick={() => { setRequest(r); setReqResults([]) }}
                        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-zinc-900 dark:text-white truncate">{r.patient.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-2">{r.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {errors.request && <p className="text-[10px] text-red-500">{errors.request}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Monto (USD) *</label>
              <input value={amountUsd} onChange={e => setAmountUsd(e.target.value)} type="number" step="0.01" min="0" placeholder="0.00" className={inputCls(!!errors.amountUsd)} />
              {errors.amountUsd && <p className="text-[10px] text-red-500">{errors.amountUsd}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Tasa (Bs/USD) *</label>
              <input value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} type="number" step="0.01" min="0" placeholder="0.00" className={inputCls(!!errors.exchangeRate)} />
              {errors.exchangeRate && <p className="text-[10px] text-red-500">{errors.exchangeRate}</p>}
            </div>
          </div>

          {amountBsPreview && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Equivale a <span className="font-semibold text-zinc-700 dark:text-zinc-300">Bs {amountBsPreview}</span></p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Método de pago *</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className={inputCls(!!errors.method)}>
                <option value="">Seleccionar...</option>
                {BILLING_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              {errors.method && <p className="text-[10px] text-red-500">{errors.method}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Referencia *</label>
              <input value={reference} onChange={e => setReference(e.target.value)} placeholder="N° de confirmación" className={inputCls(!!errors.reference)} />
              {errors.reference && <p className="text-[10px] text-red-500">{errors.reference}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={[inputCls(false), 'resize-none'].join(' ')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleClose} className="h-9 px-4 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="h-9 px-5 rounded text-xs font-medium text-white flex items-center gap-2 disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? 'Registrando...' : 'Registrar cobro'}
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
