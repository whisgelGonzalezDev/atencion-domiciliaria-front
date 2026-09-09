import { apiClient } from '@/core/utils/apiClient'
import type { AuditLog, PaginatedResult } from './types'

export interface AuditLogsFilter {
  entityType?: string
  entityId?: string
  page?: number
  limit?: number
}

export const auditLogsApi = {
  getAll: (filter: AuditLogsFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.entityType) params.set('entityType', filter.entityType)
    if (filter.entityId)   params.set('entityId',   filter.entityId)
    if (filter.page)       params.set('page',       String(filter.page))
    if (filter.limit)      params.set('limit',      String(filter.limit))
    const qs = params.toString()
    return apiClient<PaginatedResult<AuditLog>>(`/audit-logs${qs ? `?${qs}` : ''}`)
  },
}
