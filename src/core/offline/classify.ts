import type { ReplayOutcome } from './queue'

/**
 * Anything that may succeed later (server waking up, overloaded, rate limited)
 * counts as "still offline" so the action stays queued instead of being lost.
 */
export function classifyStatus(status: number, message: string): ReplayOutcome {
  if (status >= 200 && status < 300) return { kind: 'ok' }
  if (status === 401) return { kind: 'auth' }
  if (status === 408 || status === 425 || status === 429 || status >= 500) return { kind: 'offline' }
  return status === 409 ? { kind: 'rejected', message, conflict: true } : { kind: 'rejected', message }
}
