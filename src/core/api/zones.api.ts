import { apiClient } from '@/core/utils/apiClient'
import type { Zone } from './types'

export interface CreateZoneBody {
  name: string
  lat: number
  lng: number
  radiusKm: number
}

export const zonesApi = {
  getAll: () => apiClient<Zone[]>('/zones'),

  create: (body: CreateZoneBody) =>
    apiClient<Zone>('/zones', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<CreateZoneBody>) =>
    apiClient<Zone>(`/zones/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (id: string) =>
    apiClient<{ id: string }>(`/zones/${id}`, { method: 'DELETE' }),
}
