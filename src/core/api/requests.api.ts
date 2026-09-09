import { apiClient } from '@/core/utils/apiClient'
import type { MedRequest, PaginatedResult, WhatsAppLink } from './types'

export interface RequestsFilter {
  page?: number
  limit?: number
  state?: string
  priority?: string
  zone?: string
  search?: string
  patientId?: string
}

export const requestsApi = {
  getAll: (filter: RequestsFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.page)      params.set('page',      String(filter.page))
    if (filter.limit)     params.set('limit',     String(filter.limit))
    if (filter.state)     params.set('state',     filter.state)
    if (filter.priority)  params.set('priority',  filter.priority)
    if (filter.zone)      params.set('zone',      filter.zone)
    if (filter.search)    params.set('search',    filter.search)
    if (filter.patientId) params.set('patientId', filter.patientId)
    const qs = params.toString()
    return apiClient<PaginatedResult<MedRequest>>(`/requests${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) => apiClient<MedRequest>(`/requests/${id}`),

  create: (body: {
    priority: string
    patientId?: string
    patientName: string
    patientAge: number
    patientPhone: string
    bloodType?: string
    address: string
    referencesText?: string
    symptoms: string
    additionalNotes?: string
    zoneId: string
  }) => apiClient<MedRequest>('/requests', { method: 'POST', body: JSON.stringify(body) }),

  advanceState: (id: string) =>
    apiClient<MedRequest>(`/requests/${id}/advance`, { method: 'PATCH' }),

  assignDoctor: (id: string, doctorId: string) =>
    apiClient<MedRequest>(`/requests/${id}/assign-doctor`, {
      method: 'PATCH',
      body: JSON.stringify({ doctorId }),
    }),

  addNote: (id: string, text: string, authorName: string) =>
    apiClient<MedRequest>(`/requests/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text, authorName }),
    }),

  cancel: (id: string) =>
    apiClient<MedRequest>(`/requests/${id}/cancel`, { method: 'PATCH' }),

  update: (id: string, body: Partial<{
    address: string
    referencesText: string
    symptoms: string
    additionalNotes: string
    priority: string
  }>) =>
    apiClient<MedRequest>(`/requests/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  getWhatsAppLink: (id: string) =>
    apiClient<WhatsAppLink>(`/requests/${id}/whatsapp-link`),
}
