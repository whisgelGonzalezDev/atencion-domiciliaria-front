import type { MedRequest, ServiceRecord, SystemSettings } from '@/core/api/types'
import { renderWithDefault } from './template/render'
import type { DocumentDefinition } from './template/types'

export const generateRecipePdf = (request: MedRequest, record: ServiceRecord, settings: SystemSettings | null, template?: DocumentDefinition | null) =>
  renderWithDefault('recipe', request, record, settings, template)
