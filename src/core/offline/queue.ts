import { offlineDb } from './db'

export interface QueuedAction {
  id: string
  method: 'POST' | 'PATCH' | 'DELETE'
  endpoint: string
  body?: string
  description: string
  createdAt: number
}

export interface FlushResult {
  synced: number
  failed: number
  failedDescriptions: string[]
}

type Listener = (queue: QueuedAction[]) => void

const listeners = new Set<Listener>()
let cache: QueuedAction[] = []
let flushing = false

async function refreshCache(): Promise<QueuedAction[]> {
  cache = (await offlineDb.getAll<QueuedAction>()).sort((a, b) => a.createdAt - b.createdAt)
  listeners.forEach((l) => l(cache))
  return cache
}

export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener)
  listener(cache)
  refreshCache()
  return () => listeners.delete(listener)
}

export function getQueueSnapshot(): QueuedAction[] {
  return cache
}

export async function enqueueAction(input: Omit<QueuedAction, 'id' | 'createdAt'>): Promise<void> {
  const action: QueuedAction = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  await offlineDb.put(action)
  await refreshCache()
}

/**
 * Replays queued actions in order against the given fetcher. Stops on the
 * first network-level failure (still offline) so remaining actions keep
 * their order; a rejected-by-server action (e.g. a stale state transition)
 * is dropped instead of retried forever.
 */
export async function flushQueue(
  replay: (action: QueuedAction) => Promise<'ok' | 'rejected' | 'offline'>,
): Promise<FlushResult> {
  if (flushing) return { synced: 0, failed: 0, failedDescriptions: [] }
  flushing = true
  const result: FlushResult = { synced: 0, failed: 0, failedDescriptions: [] }
  try {
    const queue = await refreshCache()
    for (const action of queue) {
      const outcome = await replay(action)
      if (outcome === 'offline') break
      await offlineDb.delete(action.id)
      if (outcome === 'ok') result.synced++
      else {
        result.failed++
        result.failedDescriptions.push(action.description)
      }
    }
    await refreshCache()
  } finally {
    flushing = false
  }
  return result
}
