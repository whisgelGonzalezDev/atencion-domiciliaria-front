import type { MedRequest, ServiceRecord, SystemSettings } from '@/core/api/types'
import { renderWithDefault } from './template/render'
import type { DocumentDefinition } from './template/types'

export const generateMedicalReportPdf = (request: MedRequest, record: ServiceRecord, settings: SystemSettings | null, template?: DocumentDefinition | null) =>
  renderWithDefault('report', request, record, settings, template)
