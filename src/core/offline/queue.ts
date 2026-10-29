import { offlineDb } from './db'

export interface QueuedAction {
  id: string
  method: 'POST' | 'PATCH' | 'DELETE'
  endpoint: string
  body?: string
  /** Multipart upload: the Blob lives in IndexedDB until the server accepts it. */
  file?: { blob: Blob; name: string; field: string }
  description: string
  createdAt: number
  /** A newer action with the same key replaces any still-pending older one (whole-resource PATCHes). */
  key?: string
  /** Only replayed while this user is logged in, so an action is never attributed to someone else. */
  userId?: string
  /** Absent means pending. Failed actions are kept so the user can retry or discard them. */
  status?: 'failed'
  lastError?: string
}

export type ReplayOutcome =
  | { kind: 'ok' }
  | { kind: 'offline' }
  | { kind: 'auth' }
  | { kind: 'rejected'; message: string }

export interface FlushResult {
  synced: number
  failed: number
  failedDescriptions: string[]
  authExpired: boolean
}

export interface QueueState {
  actions: QueuedAction[]
  authExpired: boolean
}

type StateListener = (state: QueueState) => void
type SyncedListener = (action: QueuedAction) => void

const stateListeners = new Set<StateListener>()
const syncedListeners = new Set<SyncedListener>()
let actions: QueuedAction[] = []
let authExpired = false
let flushing = false

function snapshot(): QueueState {
  return { actions, authExpired }
}

function notify() {
  const state = snapshot()
  stateListeners.forEach((l) => l(state))
}

async function refreshCache(): Promise<QueuedAction[]> {
  actions = (await offlineDb.getAll<QueuedAction>()).sort((a, b) => a.createdAt - b.createdAt)
  notify()
  return actions
}

export function subscribeQueue(listener: StateListener): () => void {
  stateListeners.add(listener)
  listener(snapshot())
  void refreshCache()
  return () => stateListeners.delete(listener)
}

export function getQueueSnapshot(): QueueState {
  return snapshot()
}

/** Fires after the server accepted a replayed action, so screens can drop their local draft. */
export function subscribeSynced(listener: SyncedListener): () => void {
  syncedListeners.add(listener)
  return () => syncedListeners.delete(listener)
}

export async function enqueueAction(input: Omit<QueuedAction, 'id' | 'createdAt' | 'status' | 'lastError'>): Promise<void> {
  if (input.key) {
    const stale = (await offlineDb.getAll<QueuedAction>()).filter((a) => a.key === input.key && a.status !== 'failed')
    await Promise.all(stale.map((a) => offlineDb.delete(a.id)))
  }
  const action: QueuedAction = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  await offlineDb.put(action)
  await refreshCache()
}

export async function discardAction(id: string): Promise<void> {
  await offlineDb.delete(id)
  await refreshCache()
}

export async function retryAction(id: string): Promise<void> {
  const action = (await offlineDb.getAll<QueuedAction>()).find((a) => a.id === id)
  if (!action) return
  const { status: _status, lastError: _lastError, ...rest } = action
  await offlineDb.put(rest)
  await refreshCache()
}

/**
 * Replays pending actions in order. Stops at the first network/server-side
 * hiccup (still offline, 5xx, rate limit) or expired session so remaining
 * actions keep their order and nothing is lost; only an action the server
 * definitively refuses (validation, not found, conflict) is parked as failed
 * for the user to retry or discard.
 */
export async function flushQueue(
  replay: (action: QueuedAction) => Promise<ReplayOutcome>,
  currentUserId?: string,
): Promise<FlushResult> {
  const result: FlushResult = { synced: 0, failed: 0, failedDescriptions: [], authExpired: false }
  if (flushing) return result
  flushing = true
  try {
    const queue = await refreshCache()
    for (const action of queue) {
      if (action.status === 'failed') continue
      if (action.userId && currentUserId && action.userId !== currentUserId) continue

      const outcome = await replay(action)
      if (outcome.kind === 'offline') break
      if (outcome.kind === 'auth') {
        result.authExpired = true
        break
      }
      if (outcome.kind === 'ok') {
        await offlineDb.delete(action.id)
        result.synced++
        syncedListeners.forEach((l) => l(action))
      } else {
        await offlineDb.put({ ...action, status: 'failed', lastError: outcome.message } satisfies QueuedAction)
        result.failed++
        result.failedDescriptions.push(action.description)
      }
    }
    authExpired = result.authExpired
    await refreshCache()
  } finally {
    flushing = false
  }
  return result
}
