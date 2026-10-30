import { documentTemplatesApi } from '@/core/api/document-templates.api'
import { filesApi } from '@/core/api/files.api'
import { requestsApi } from '@/core/api/requests.api'
import type { SystemSettings } from '@/core/api/types'
import { OfflineQueuedError } from '@/core/utils/apiClient'

export type AttachRecipeResult = 'attached' | 'queued' | 'no-recipe'

/**
 * Builds the récipe PDF of a request (with the template of its requesting
 * entity) and attaches it to that request, replacing the one generated before.
 */
export async function attachRecipeToRequest(requestId: string, settings: SystemSettings | null): Promise<AttachRecipeResult> {
  const request = await requestsApi.getById(requestId)
  const record = request.serviceRecord
  if (!record?.recipeText?.trim()) return 'no-recipe'

  // Without connection or before templates exist, the built-in layout is used.
  const templates = await documentTemplatesApi.resolve(request.requestingEntity?.id).catch(() => null)
  const { buildDocument } = await import('@/features/requests/pdf/template/render')
  const doc = await buildDocument(templates?.recipe ?? (await import('@/features/requests/pdf/template/defaults')).DEFAULT_TEMPLATES.recipe, request, record, settings)

  const file = new File([doc.output('blob')], `recipe-${request.id}.pdf`, { type: 'application/pdf' })
  try {
    await filesApi.uploadForRequest(request.id, file, { replace: true })
    return 'attached'
  } catch (err) {
    if (err instanceof OfflineQueuedError) return 'queued'
    throw err
  }
}
