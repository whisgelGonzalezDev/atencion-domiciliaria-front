import { useCallback, useEffect, useRef, useState } from 'react'
import { requestsApi } from '@/core/api/requests.api'
import type { ServiceRecord } from '@/core/api/types'
import { overwriteConflict } from '@/core/offline/conflicts'
import { discardAction, getQueueSnapshot, subscribeDiscarded, subscribeQueue, subscribeSynced } from '@/core/offline/queue'
import { ApiError, OfflineQueuedError } from '@/core/utils/apiClient'
import { emptyServiceRecord } from './emptyServiceRecord'
import { clearDraft, readDraft, SERVICE_RECORD_KEY_PREFIX, writeDraft } from './serviceRecordDraftStorage'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'conflict' | 'error'

/**
 * Local edit state for the "ficha de servicio" with a debounced autosave.
 *
 * Every edit is also written to a localStorage draft that stays until the
 * server has confirmed it. The draft wins over the (possibly stale, cached)
 * server copy on load; without it, reloading offline would show the old data
 * and the next edit would overwrite the unsynced one, since the PATCH replaces
 * the whole record.
 *
 * Each save carries the server revision it was edited from. If someone else
 * saved in between, the server answers 409 and the user chooses between their
 * version and the server's instead of silently overwriting it.
 */
export function useServiceRecordDraft(requestId: string, initial: ServiceRecord | undefined) {
  const queueKey = `${SERVICE_RECORD_KEY_PREFIX}${requestId}`
  const [data, setData] = useState<ServiceRecord>(() => readDraft(requestId)?.data ?? initial ?? emptyServiceRecord())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const latestRef = useRef(data)
  latestRef.current = data
  const revisionRef = useRef(readDraft(requestId)?.baseRevision ?? initial?.revision ?? 0)
  const timerRef = useRef<number | null>(null)

  const syncNow = useCallback(async () => {
    setSaveStatus('saving')
    try {
      const saved = await requestsApi.updateServiceRecord(requestId, latestRef.current, revisionRef.current)
      revisionRef.current = saved.serviceRecord?.revision ?? revisionRef.current
      setSaveStatus('saved')
      clearDraft(requestId)
    } catch (err) {
      if (err instanceof OfflineQueuedError) setSaveStatus('offline')
      else if (err instanceof ApiError && err.status === 409) setSaveStatus('conflict')
      else setSaveStatus('error')
    }
  }, [requestId])

  useEffect(() => {
    const draft = readDraft(requestId)
    setData(draft?.data ?? initial ?? emptyServiceRecord())
    revisionRef.current = draft?.baseRevision ?? initial?.revision ?? 0
    // A draft that never reached the server (tab closed inside the debounce
    // window, or an earlier error) is pushed now instead of waiting for the
    // next edit. `initial` is only a baseline and must not clobber local edits.
    if (draft) void syncNow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  useEffect(() => {
    return subscribeSynced((action) => {
      if (action.key !== queueKey) return
      // Keep the draft if the user typed more after this action was queued.
      const draft = readDraft(requestId)
      if (draft && draft.savedAt <= action.createdAt) clearDraft(requestId)
      setSaveStatus((s) => (s === 'offline' || s === 'conflict' ? 'saved' : s))
      // The replayed save bumped the server revision; later edits build on it.
      requestsApi.getById(requestId)
        .then((r) => { revisionRef.current = r.serviceRecord?.revision ?? revisionRef.current })
        .catch(() => undefined)
    })
  }, [requestId, queueKey])

  // A conflict found while replaying a queued save (the user was offline).
  useEffect(() => subscribeQueue(({ actions }) => {
    if (actions.some((a) => a.key === queueKey && a.conflict)) setSaveStatus('conflict')
  }), [queueKey])

  const adoptServerVersion = useCallback(async () => {
    const current = await requestsApi.getById(requestId)
    const record = current.serviceRecord ?? emptyServiceRecord()
    revisionRef.current = current.serviceRecord?.revision ?? 0
    latestRef.current = record
    setData(record)
    clearDraft(requestId)
    setSaveStatus('idle')
  }, [requestId])

  // The user threw their queued edit away from the pending-changes panel.
  useEffect(() => subscribeDiscarded((action) => {
    if (action.key === queueKey) void adoptServerVersion().catch(() => undefined)
  }), [queueKey, adoptServerVersion])

  const update = useCallback((updater: (prev: ServiceRecord) => ServiceRecord) => {
    setData(prev => {
      const next = updater(prev)
      latestRef.current = next
      writeDraft(requestId, next, revisionRef.current)
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

  const queuedConflict = () => getQueueSnapshot().actions.find((a) => a.key === queueKey && a.conflict)

  /** Conflict: keep what I typed and overwrite the other person's version. */
  const keepMine = useCallback(async () => {
    const queued = queuedConflict()
    if (queued) {
      if (await overwriteConflict(queued)) setSaveStatus('saving')
      return
    }
    try {
      const current = await requestsApi.getById(requestId)
      revisionRef.current = current.serviceRecord?.revision ?? 0
      writeDraft(requestId, latestRef.current, revisionRef.current)
      await syncNow()
    } catch {
      setSaveStatus('error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, queueKey, syncNow])

  /** Conflict: drop what I typed and load the other person's version. */
  const acceptTheirs = useCallback(async () => {
    const queued = queuedConflict()
    try {
      if (queued) await discardAction(queued.id) // its listener loads the server version
      else await adoptServerVersion()
    } catch {
      setSaveStatus('error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueKey, adoptServerVersion])

  return { data, update, saveStatus, syncNow, keepMine, acceptTheirs }
}
