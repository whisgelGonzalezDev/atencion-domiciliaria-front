import { useCallback, useEffect, useRef, useState } from 'react'
import { requestsApi } from '@/core/api/requests.api'
import type { ServiceRecord } from '@/core/api/types'
import { emptyServiceRecord } from './emptyServiceRecord'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Local edit state for the "ficha de servicio" with a debounced autosave
 * against requestsApi.updateServiceRecord. apiClient already queues the PATCH
 * offline on network failure, so this hook only owns debouncing + status.
 */
export function useServiceRecordDraft(requestId: string, initial: ServiceRecord | undefined) {
  const [data, setData] = useState<ServiceRecord>(initial ?? emptyServiceRecord())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const latestRef = useRef(data)
  latestRef.current = data
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setData(initial ?? emptyServiceRecord())
    // Only reset when switching to a different request; `initial` itself is
    // a one-time baseline and must not clobber in-progress local edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  const syncNow = useCallback(async () => {
    setSaveStatus('saving')
    try {
      await requestsApi.updateServiceRecord(requestId, latestRef.current)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [requestId])

  const update = useCallback((updater: (prev: ServiceRecord) => ServiceRecord) => {
    setData(prev => {
      const next = updater(prev)
      latestRef.current = next
      return next
    })
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => { void syncNow() }, 1500)
  }, [syncNow])

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [])

  return { data, update, saveStatus, syncNow }
}
