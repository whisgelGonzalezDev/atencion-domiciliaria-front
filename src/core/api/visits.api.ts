import { apiClient } from '@/core/utils/apiClient'
import type { Visit, CreateVisitResult } from './types'

export interface VisitsFilter {
  from?: string
  to?: string
  doctorId?: string
  zoneId?: string
  patientId?: string
  status?: string
}

export interface RecurrenceInput {
  frequency: 'weekly' | 'biweekly' | 'monthly'
  until: string
}

export interface CreateVisitBody {
  patientId: string
  zoneId: string
  doctorId?: string
  scheduledAt: string
  durationMinutes?: number
  notes?: string
  recurrence?: RecurrenceInput
}

export const visitsApi = {
  getAgenda: (filter: VisitsFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.from)      params.set('from',      filter.from)
    if (filter.to)        params.set('to',        filter.to)
    if (filter.doctorId)  params.set('doctorId',  filter.doctorId)
    if (filter.zoneId)    params.set('zoneId',    filter.zoneId)
    if (filter.patientId) params.set('patientId', filter.patientId)
    if (filter.status)    params.set('status',    filter.status)
    const qs = params.toString()
    return apiClient<Visit[]>(`/visits${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) => apiClient<Visit>(`/visits/${id}`),

  create: (body: CreateVisitBody) =>
    apiClient<CreateVisitResult>('/visits', { method: 'POST', body: JSON.stringify(body) }),

  reschedule: (id: string, body: { scheduledAt: string; durationMinutes?: number }) =>
    apiClient<Visit>(`/visits/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  assignDoctor: (id: string, doctorId?: string) =>
    apiClient<Visit>(`/visits/${id}/assign-doctor`, {
      method: 'PATCH',
      body: JSON.stringify({ doctorId }),
    }),

  updateStatus: (id: string, status: 'confirmed' | 'done' | 'missed' | 'cancelled') =>
    apiClient<Visit>(`/visits/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  cancel: (id: string) => apiClient<Visit>(`/visits/${id}/cancel`, { method: 'PATCH' }),

  cancelSeries: (seriesId: string) =>
    apiClient<Visit[]>(`/visits/series/${seriesId}/cancel`, { method: 'PATCH' }),
}
