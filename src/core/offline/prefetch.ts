import { filesApi } from '@/core/api/files.api'
import { medicalHistoryApi } from '@/core/api/medical-history.api'
import { requestsApi } from '@/core/api/requests.api'
import type { MedRequest } from '@/core/api/types'

const MIN_INTERVAL_MS = 10 * 60 * 1000
const CONCURRENCY = 3
const CLOSED_STATES = new Set(['done', 'cancelled'])

export interface PrefetchApi {
  listAssigned: () => Promise<MedRequest[]>
  warm: (request: MedRequest) => Promise<unknown>[]
}

/**
 * The exact calls the list and detail screens make: the service worker caches
 * GET responses by URL, so a request that was never visited online has nothing
 * to show once the connection is gone.
 */
export const defaultPrefetchApi: PrefetchApi = {
  listAssigned: async () => (await requestsApi.getAll({ limit: 10, page: 1 })).data,
  warm: (r) => [
    requestsApi.getById(r.id),
    requestsApi.getAll({ patientId: r.patient.id, limit: 10 }),
    filesApi.listForRequest(r.id),
    medicalHistoryApi.getByPatient(r.patient.id),
  ],
}

const stampKey = (userId: string) => `prefetch-at:${userId}`

function lastRun(userId: string): number {
  try {
    return Number(localStorage.getItem(stampKey(userId))) || 0
  } catch {
    return 0
  }
}

function markRun(userId: string, at: number) {
  try {
    localStorage.setItem(stampKey(userId), String(at))
  } catch {
    // Without the stamp it simply runs again next time.
  }
}

/**
 * Downloads the open requests visible to this user (for a doctor, the ones
 * assigned to them) plus what their detail screen reads, so a visit to a
 * house with no signal still has the data. Best effort: any failure is
 * ignored and the next run retries. Returns how many requests were warmed.
 */
export async function prefetchForOffline(
  userId: string,
  api: PrefetchApi = defaultPrefetchApi,
  now: () => number = Date.now,
): Promise<number> {
  if (now() - lastRun(userId) < MIN_INTERVAL_MS) return 0
  let open: MedRequest[]
  try {
    open = (await api.listAssigned()).filter((r) => !CLOSED_STATES.has(r.state))
  } catch {
    return 0
  }
  markRun(userId, now())

  let warmed = 0
  const queue = [...open]
  const worker = async () => {
    for (let r = queue.shift(); r; r = queue.shift()) {
      await Promise.allSettled(api.warm(r))
      warmed++
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker))
  return warmed
}
