import { apiClient } from '@/core/utils/apiClient'
import type { Doctor } from './types'

export interface CreateDoctorBody {
  name: string
  specialty: string
  shift: string
  status: 'available' | 'busy' | 'offshift'
}

export const doctorsApi = {
  getAll: (status?: string) =>
    apiClient<Doctor[]>(`/doctors${status ? `?status=${status}` : ''}`),

  getById: (id: string) => apiClient<Doctor>(`/doctors/${id}`),

  create: (body: CreateDoctorBody) =>
    apiClient<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(body) }),
}
