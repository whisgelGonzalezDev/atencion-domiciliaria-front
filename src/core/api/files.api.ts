import { apiClient } from '@/core/utils/apiClient'

export interface Attachment {
  id: string
  requestId: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadedByEmail: string
  uploadedByRole: string
  createdAt: string
  /** Ruta relativa de la API para descargar/previsualizar el archivo (requiere Authorization). */
  url: string
}

export const filesApi = {
  /** `replace` swaps any earlier attachment of the request that has the same file name (a regenerated PDF). */
  uploadForRequest: (requestId: string, file: File, options: { replace?: boolean } = {}) => {
    const body = new FormData()
    body.append('file', file)
    return apiClient<Attachment>(`/requests/${requestId}/attachments`, {
      method: 'POST',
      body,
      ...(options.replace ? { params: { replace: true } } : {}),
    })
  },

  listForRequest: (requestId: string) =>
    apiClient<Attachment[]>(`/requests/${requestId}/attachments`),
}
