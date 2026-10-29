import { useCallback, useEffect, useRef, useState } from 'react'
import { requestsApi } from '@/core/api/requests.api'
import type { ServiceRecord } from '@/core/api/types'
import { subscribeSynced } from '@/core/offline/queue'
import { OfflineQueuedError } from '@/core/utils/apiClient'
import { emptyServiceRecord } from './emptyServiceRecord'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error'

const draftKey = (requestId: string) => `sr-draft:${requestId}`

interface Draft {
  data: ServiceRecord
  savedAt: number
}

function readDraft(requestId: string): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(requestId))
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

function writeDraft(requestId: string, data: ServiceRecord) {
  try {
    localStorage.setItem(draftKey(requestId), JSON.stringify({ data, savedAt: Date.now() } satisfies Draft))
  } catch {
    // Storage full or unavailable: the offline queue still holds the last save.
  }
}

function clearDraft(requestId: string) {
  try {
    localStorage.removeItem(draftKey(requestId))
  } catch {
    // ignore
  }
}

/**
 * Local edit state for the "ficha de servicio" with a debounced autosave.
 *
 * Every edit is also written to a localStorage draft that stays until the
 * server has confirmed it. The draft wins over the (possibly stale, cached)
 * server copy on load; without it, reloading offline would show the old data
 * and the next edit would overwrite the unsynced one, since the PATCH replaces
 * the whole record.
 */
export function useServiceRecordDraft(requestId: string, initial: ServiceRecord | undefined) {
  const [data, setData] = useState<ServiceRecord>(() => readDraft(requestId)?.data ?? initial ?? emptyServiceRecord())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const latestRef = useRef(data)
  latestRef.current = data
  const timerRef = useRef<number | null>(null)

  const syncNow = useCallback(async () => {
    setSaveStatus('saving')
    try {
      await requestsApi.updateServiceRecord(requestId, latestRef.current)
      setSaveStatus('saved')
      clearDraft(requestId)
    } catch (err) {
      setSaveStatus(err instanceof OfflineQueuedError ? 'offline' : 'error')
    }
  }, [requestId])

  useEffect(() => {
    const draft = readDraft(requestId)
    setData(draft?.data ?? initial ?? emptyServiceRecord())
    // A draft that never reached the server (tab closed inside the debounce
    // window, or an earlier error) is pushed now instead of waiting for the
    // next edit. `initial` is only a baseline and must not clobber local edits.
    if (draft) void syncNow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  useEffect(() => {
    return subscribeSynced((action) => {
      if (action.key !== `service-record:${requestId}`) return
      // Keep the draft if the user typed more after this action was queued.
      const draft = readDraft(requestId)
      if (draft && draft.savedAt <= action.createdAt) clearDraft(requestId)
      setSaveStatus((s) => (s === 'offline' ? 'saved' : s))
    })
  }, [requestId])

  const update = useCallback((updater: (prev: ServiceRecord) => ServiceRecord) => {
    setData(prev => {
      const next = updater(prev)
      latestRef.current = next
      writeDraft(requestId, next)
      return next
    })
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => { timerRef.current = null; void syncNow() }, 1500)
  }, [requestId, syncNow])

  useEffect(() => () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      void syncNow()
    }
  }, [syncNow])

  return { data, update, saveStatus, syncNow }
}
