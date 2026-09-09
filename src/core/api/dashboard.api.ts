import { apiClient } from '@/core/utils/apiClient'
import type { KpiData, MapMarker, MedRequest, PaginatedResult } from './types'

export const dashboardApi = {
  getKpis: () => apiClient<KpiData>('/dashboard/kpis'),
  getMapMarkers: () => apiClient<MapMarker[]>('/dashboard/map-markers'),
  getRecentHighPriority: () =>
    apiClient<PaginatedResult<MedRequest>>('/requests?priority=emergency&limit=6')
      .then(r => r.data),
}
