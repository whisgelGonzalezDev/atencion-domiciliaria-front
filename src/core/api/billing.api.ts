import { apiClient } from '@/core/utils/apiClient'
import type { BillingCharge, PaginatedResult } from './types'

export interface BillingFilter {
  requestId?: string
  status?: string
  page?: number
  limit?: number
}

export interface CreateBillingBody {
  requestId: string
  amountUsd: number
  exchangeRate: number
  method: string
  reference: string
  notes?: string
}

export const BILLING_METHODS: { id: string; label: string }[] = [
  { id: 'pago_movil',    label: 'Pago Móvil' },
  { id: 'zelle',         label: 'Zelle' },
  { id: 'efectivo_usd',  label: 'Efectivo USD' },
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'otro',          label: 'Otro' },
]

export const billingApi = {
  getAll: (filter: BillingFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.requestId) params.set('requestId', filter.requestId)
    if (filter.status)    params.set('status',    filter.status)
    if (filter.page)      params.set('page',      String(filter.page))
    if (filter.limit)     params.set('limit',     String(filter.limit))
    const qs = params.toString()
    return apiClient<PaginatedResult<BillingCharge>>(`/billing${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) => apiClient<BillingCharge>(`/billing/${id}`),

  create: (body: CreateBillingBody) =>
    apiClient<BillingCharge>('/billing', { method: 'POST', body: JSON.stringify(body) }),

  markPaid: (id: string) => apiClient<BillingCharge>(`/billing/${id}/mark-paid`, { method: 'PATCH' }),

  cancel: (id: string) => apiClient<BillingCharge>(`/billing/${id}/cancel`, { method: 'PATCH' }),
}
