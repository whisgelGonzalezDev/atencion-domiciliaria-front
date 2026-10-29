import { apiClient } from '@/core/utils/apiClient'
import type { DocType, DocumentDefinition } from '@/features/requests/pdf/template/types'

/** Per document type: the custom definition to use, or null for the built-in layout. */
export type ResolvedTemplates = Record<DocType, DocumentDefinition | null>

export interface StoredTemplate {
  id: string
  requestingEntityId: string | null
  docType: DocType
  definition: DocumentDefinition
  updatedAt: string
}

export const documentTemplatesApi = {
  resolve: (requestingEntityId?: string | null) =>
    apiClient<ResolvedTemplates>('/document-templates/resolve', {
      params: requestingEntityId ? { requestingEntityId } : undefined,
    }),

  getAll: () => apiClient<StoredTemplate[]>('/document-templates'),

  save: (body: { requestingEntityId: string | null; docType: DocType; definition: DocumentDefinition }) =>
    apiClient<StoredTemplate>('/document-templates', { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) => apiClient<{ id: string }>(`/document-templates/${id}`, { method: 'DELETE' }),
}
