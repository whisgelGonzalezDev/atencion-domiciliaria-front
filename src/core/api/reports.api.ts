import { downloadFile } from '@/core/utils/downloadFile'

function qs(params: object): string {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params as Record<string, string | undefined>)) {
    if (v) usp.set(k, v)
  }
  const s = usp.toString()
  return s ? `?${s}` : ''
}

export interface RequestsReportFilter {
  state?: string
  priority?: string
  zone?: string
  search?: string
}

export interface BillingReportFilter {
  status?: string
}

export interface VisitsReportFilter {
  from?: string
  to?: string
  doctorId?: string
  zoneId?: string
  status?: string
}

export interface AuditLogsReportFilter {
  entityType?: string
}

export const reportsApi = {
  downloadRequests: (filter: RequestsReportFilter) =>
    downloadFile(`/requests/export.csv${qs(filter)}`, 'solicitudes.csv'),

  downloadBilling: (filter: BillingReportFilter) =>
    downloadFile(`/billing/export.csv${qs(filter)}`, 'facturacion.csv'),

  downloadVisits: (filter: VisitsReportFilter) =>
    downloadFile(`/visits/export.csv${qs(filter)}`, 'visitas.csv'),

  downloadAuditLogs: (filter: AuditLogsReportFilter) =>
    downloadFile(`/audit-logs/export.csv${qs(filter)}`, 'auditoria.csv'),
}
