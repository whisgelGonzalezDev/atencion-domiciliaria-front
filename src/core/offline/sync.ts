import { BASE_URL } from '@/core/utils/apiClient'
import { classifyStatus } from './classify'
import { currentUserId } from './currentUser'
import { flushQueue, type QueuedAction, type FlushResult, type ReplayOutcome } from './queue'

async function errorMessage(response: Response): Promise<string> {
  try {
    const json = await response.json()
    const raw = json?.error?.message ?? json?.message ?? response.statusText
    return typeof raw === 'string' ? raw : JSON.stringify(raw)
  } catch {
    return response.statusText || `Error ${response.status}`
  }
}

async function replayAction(action: QueuedAction): Promise<ReplayOutcome> {
  const token = localStorage.getItem('auth_token')
  const url = new URL(`${BASE_URL}${action.endpoint}`, window.location.origin)
  try {
    let body: string | FormData | undefined = action.body
    if (action.file) {
      body = new FormData()
      body.append(action.file.field, action.file.blob, action.file.name)
    }
    const response = await fetch(url.toString(), {
      method: action.method,
      headers: {
        // With FormData the browser must set Content-Type itself (boundary).
        ...(action.file ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    })
    return response.ok ? { kind: 'ok' } : classifyStatus(response.status, await errorMessage(response))
  } catch {
    return { kind: 'offline' }
  }
}

export async function syncOfflineQueue(): Promise<FlushResult> {
  return flushQueue(replayAction, currentUserId())
}
