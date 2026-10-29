import { requestsApi } from '@/core/api/requests.api'
import { rewriteAndRetry, type QueuedAction } from './queue'
import { triggerSync } from './useOfflineQueue'

const SERVICE_RECORD_PREFIX = 'service-record:'

/** The ficha's request id for a queued ficha action, or null if the action is something else. */
export function serviceRecordIdOf(action: QueuedAction): string | null {
  return action.key?.startsWith(SERVICE_RECORD_PREFIX) ? action.key.slice(SERVICE_RECORD_PREFIX.length) : null
}

/**
 * Resubmits a conflicting ficha edit on top of whatever the server has now,
 * i.e. "my version wins". Returns false if the server cannot be reached.
 */
export async function overwriteConflict(action: QueuedAction): Promise<boolean> {
  const requestId = serviceRecordIdOf(action)
  if (!requestId) return false
  try {
    const current = await requestsApi.getById(requestId)
    const baseRevision = current.serviceRecord?.revision ?? 0
    await rewriteAndRetry(action.id, (body) => JSON.stringify({ ...JSON.parse(body ?? '{}'), baseRevision }))
    void triggerSync()
    return true
  } catch {
    return false
  }
}
