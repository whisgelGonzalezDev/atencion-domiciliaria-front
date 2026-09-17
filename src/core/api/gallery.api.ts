import { apiClient } from '@/core/utils/apiClient'
import type { Attachment } from './files.api'

export interface GalleryFilter {
  mimeType?: string
  requestId?: string
  page?: number
  limit?: number
}

export interface PaginatedAttachments {
  data: Attachment[]
  total: number
  page: number
  limit: number
}

export const galleryApi = {
  getAll: (filter: GalleryFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.mimeType) params.set('mimeType', filter.mimeType)
    if (filter.requestId) params.set('requestId', filter.requestId)
    if (filter.page) params.set('page', String(filter.page))
    if (filter.limit) params.set('limit', String(filter.limit))
    const qs = params.toString()
    return apiClient<PaginatedAttachments>(`/gallery/attachments${qs ? `?${qs}` : ''}`)
  },

  remove: (id: string) =>
    apiClient<{ id: string }>(`/gallery/attachments/${id}`, { method: 'DELETE' }),
}
