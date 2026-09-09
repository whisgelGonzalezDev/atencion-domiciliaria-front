import { apiClient } from '@/core/utils/apiClient'
import type { Patient, PaginatedResult } from './types'

export interface PatientsFilter {
  search?: string
  page?: number
  limit?: number
}

export interface CreatePatientBody {
  name: string
  age: number
  phone: string
  bloodType?: string
  historyShort?: string
}

export const patientsApi = {
  getAll: (filter: PatientsFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.search) params.set('search', filter.search)
    if (filter.page)   params.set('page',   String(filter.page))
    if (filter.limit)  params.set('limit',  String(filter.limit))
    const qs = params.toString()
    return apiClient<PaginatedResult<Patient>>(`/patients${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) => apiClient<Patient>(`/patients/${id}`),

  create: (body: CreatePatientBody) =>
    apiClient<Patient>('/patients', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<CreatePatientBody>) =>
    apiClient<Patient>(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
}
