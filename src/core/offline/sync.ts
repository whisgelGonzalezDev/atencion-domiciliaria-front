import { BASE_URL } from '@/core/utils/apiClient'
import { flushQueue, type QueuedAction, type FlushResult } from './queue'

async function replayAction(action: QueuedAction): Promise<'ok' | 'rejected' | 'offline'> {
  const token = localStorage.getItem('auth_token')
  const url = new URL(`${BASE_URL}${action.endpoint}`, window.location.origin)
  try {
    const response = await fetch(url.toString(), {
      method: action.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: action.body,
    })
    return response.ok ? 'ok' : 'rejected'
  } catch {
    return 'offline'
  }
}

export async function syncOfflineQueue(): Promise<FlushResult> {
  return flushQueue(replayAction)
}
