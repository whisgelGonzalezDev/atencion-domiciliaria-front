import { apiClient } from '@/core/utils/apiClient'

export interface RequestingEntity {
  id: string
  name: string
  rif: string | null
  active: boolean
}

export const requestingEntitiesApi = {
  getAll: () => apiClient<RequestingEntity[]>('/requesting-entities'),

  create: (body: { name: string; rif?: string | null }) =>
    apiClient<RequestingEntity>('/requesting-entities', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<{ name: string; rif: string | null; active: boolean }>) =>
    apiClient<RequestingEntity>(`/requesting-entities/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
}
