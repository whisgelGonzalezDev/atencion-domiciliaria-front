import { apiClient } from '@/core/utils/apiClient'
import type { RequestsStats, PerformanceStats, IncomeStats, StatsPeriod } from './types'

export const statisticsApi = {
  getRequestsStats: (period: StatsPeriod) =>
    apiClient<RequestsStats>('/statistics/requests', { params: { period } }),

  getPerformanceStats: (period: StatsPeriod) =>
    apiClient<PerformanceStats>('/statistics/performance', { params: { period } }),

  getIncomeStats: (period: StatsPeriod) =>
    apiClient<IncomeStats>('/statistics/income', { params: { period } }),
}
