import { apiClient } from '@/core/utils/apiClient'
import type { UserAccount } from './types'

export interface CreateUserBody {
  name: string
  email: string
  password: string
  role: 'admin' | 'operativo' | 'doctor'
  doctorId?: string
}

export interface UpdateUserBody {
  name?: string
  email?: string
  password?: string
  role?: 'admin' | 'operativo' | 'doctor'
  doctorId?: string
}

export const usersApi = {
  getAll: () => apiClient<UserAccount[]>('/users'),

  create: (body: CreateUserBody) =>
    apiClient<UserAccount>('/users', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: UpdateUserBody) =>
    apiClient<UserAccount>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (id: string) =>
    apiClient<{ id: string }>(`/users/${id}`, { method: 'DELETE' }),
}
