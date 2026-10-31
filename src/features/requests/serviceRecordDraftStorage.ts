import type { ServiceRecord } from '@/core/api/types'

export interface Draft {
  data: ServiceRecord
  savedAt: number
  /** Server revision this draft was edited from; sent back so concurrent edits are detected. */
  baseRevision: number
}

export const SERVICE_RECORD_KEY_PREFIX = 'service-record:'

const draftKey = (requestId: string) => `sr-draft:${requestId}`

export function readDraft(requestId: string): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(requestId))
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

export function writeDraft(requestId: string, data: ServiceRecord, baseRevision: number) {
  try {
    localStorage.setItem(draftKey(requestId), JSON.stringify({ data, savedAt: Date.now(), baseRevision } satisfies Draft))
  } catch {
    // Storage full or unavailable: the offline queue still holds the last save.
  }
}

export function clearDraft(requestId: string) {
  try {
    localStorage.removeItem(draftKey(requestId))
  } catch {
    // ignore
  }
}
