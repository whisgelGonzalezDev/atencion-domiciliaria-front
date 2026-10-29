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
  uploadForRequest: (requestId: string, file: File) => {
    const body = new FormData()
    body.append('file', file)
    return apiClient<Attachment>(`/requests/${requestId}/attachments`, {
      method: 'POST',
      body,
      offlineFile: file,
      offlineDescription: `Adjunto "${file.name}"`,
    })
  },

  listForRequest: (requestId: string) =>
    apiClient<Attachment[]>(`/requests/${requestId}/attachments`),
}
