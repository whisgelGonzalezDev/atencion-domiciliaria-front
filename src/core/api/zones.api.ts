import { apiClient } from '@/core/utils/apiClient'
import type { Zone } from './types'

export const zonesApi = {
  getAll: () => apiClient<Zone[]>('/zones'),
}
