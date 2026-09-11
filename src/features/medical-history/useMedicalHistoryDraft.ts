import { useCallback, useEffect, useRef, useState } from 'react'
import { medicalHistoryApi } from '@/core/api/medical-history.api'
import { OfflineQueuedError } from '@/core/utils/apiClient'
import type { MedicalHistoryFormData, MedicalHistoryPatientInfo } from '@/core/api/types'
import { emptyMedicalHistoryForm } from './emptyForm'
import { sanitizeForServer } from './sanitize'

const draftKey = (patientId: string) => `mh-draft:${patientId}`
const stepKey = (patientId: string) => `mh-step:${patientId}`

interface Draft {
  step: number
  data: MedicalHistoryFormData
  savedAt: number
}

// The current step is remembered independently of the data draft below: it
// should survive a reload even once every field is safely synced to the
// server (so "unsynced changes" and "which step you were on" don't get
// conflated — losing one shouldn't lose the other).
function readStep(patientId: string): number | null {
  try {
    const raw = localStorage.getItem(stepKey(patientId))
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function writeStep(patientId: string, step: number) {
  try {
    localStorage.setItem(stepKey(patientId), String(step))
  } catch {
    // ignore
  }
}

function readDraft(patientId: string): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(patientId))
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

function writeDraft(patientId: string, draft: Draft) {
  try {
    localStorage.setItem(draftKey(patientId), JSON.stringify(draft))
  } catch {
    // Storage full or unavailable (private mode): the wizard still works,
    // it just loses the reload-safety net for this session.
  }
}

function clearDraftStorage(patientId: string) {
  try {
    localStorage.removeItem(draftKey(patientId))
  } catch {
    // ignore
  }
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error'
export type SyncOutcome = 'ok' | 'offline' | 'error'

/**
 * Backs one patient's "Historia Médica" wizard with a localStorage draft
 * that survives a reload or a dropped connection, plus a debounced/best-effort
 * sync to the backend (which itself falls back to the app's offline action
 * queue via apiClient when the PATCH can't reach the server).
 */
export function useMedicalHistoryDraft(patientId: string) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [patient, setPatient] = useState<MedicalHistoryPatientInfo | null>(null)
  const [data, setDataState] = useState<MedicalHistoryFormData>(emptyMedicalHistoryForm())
  const [step, setStepState] = useState(0)
  const [draftRestored, setDraftRestored] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const latestRef = useRef({ data, step })
  latestRef.current = { data, step }
  const baselineRef = useRef<MedicalHistoryFormData>(emptyMedicalHistoryForm())
  const syncTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)

    medicalHistoryApi.getByPatient(patientId)
      .then(detail => {
        if (cancelled) return
        setPatient(detail.patient)
        const baseline: MedicalHistoryFormData = detail.history
          ? {
              status: detail.history.status,
              chronicConditions: detail.history.chronicConditions,
              surgeries: detail.history.surgeries,
              allergies: detail.history.allergies,
              currentMedications: detail.history.currentMedications,
              familyHistory: detail.history.familyHistory,
              habits: detail.history.habits,
              baselineVitals: detail.history.baselineVitals,
              physicalExamNotes: detail.history.physicalExamNotes ?? '',
              reviewOfSystems: detail.history.reviewOfSystems,
              activeDiagnoses: detail.history.activeDiagnoses,
              generalNotes: detail.history.generalNotes ?? '',
            }
          : emptyMedicalHistoryForm()
        baselineRef.current = baseline

        const draft = readDraft(patientId)
        if (draft) {
          setDataState(draft.data)
          setDraftRestored(true)
          setDraftSavedAt(draft.savedAt)
        } else {
          setDataState(baseline)
        }
        setStepState(readStep(patientId) ?? 0)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // Offline on first load: a local draft (if any) is still usable.
        const draft = readDraft(patientId)
        if (draft) {
          setDataState(draft.data)
          setDraftRestored(true)
          setDraftSavedAt(draft.savedAt)
          setStepState(readStep(patientId) ?? 0)
        } else {
          setLoadError(err instanceof Error ? err.message : 'No se pudo cargar la historia médica')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [patientId])

  const persistLocal = useCallback((nextData: MedicalHistoryFormData, nextStep: number) => {
    const savedAt = Date.now()
    writeDraft(patientId, { data: nextData, step: nextStep, savedAt })
    writeStep(patientId, nextStep)
    setDraftSavedAt(savedAt)
    setDraftRestored(true)
  }, [patientId])

  const syncNow = useCallback(async (statusOverride?: 'draft' | 'completed'): Promise<SyncOutcome> => {
    const current = latestRef.current.data
    const payload = sanitizeForServer(statusOverride ? { ...current, status: statusOverride } : current)
    setSaveStatus('saving')
    try {
      await medicalHistoryApi.save(patientId, payload, `Historia médica${patient ? ` de ${patient.name}` : ''}`)
      setSaveStatus('saved')
      clearDraftStorage(patientId)
      setDraftRestored(false)
      return 'ok'
    } catch (err) {
      if (err instanceof OfflineQueuedError) {
        setSaveStatus('offline')
        return 'offline'
      }
      setSaveStatus('error')
      return 'error'
    }
  }, [patientId, patient])

  const scheduleSync = useCallback(() => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(() => { void syncNow() }, 2000)
  }, [syncNow])

  const updateData = useCallback((updater: (prev: MedicalHistoryFormData) => MedicalHistoryFormData) => {
    setDataState(prev => {
      const next = updater(prev)
      persistLocal(next, latestRef.current.step)
      return next
    })
    scheduleSync()
  }, [persistLocal, scheduleSync])

  const goToStep = useCallback((next: number) => {
    setStepState(next)
    persistLocal(latestRef.current.data, next)
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    void syncNow()
  }, [persistLocal, syncNow])

  const discardDraft = useCallback(() => {
    clearDraftStorage(patientId)
    writeStep(patientId, 0)
    setDraftRestored(false)
    setDraftSavedAt(null)
    setDataState(baselineRef.current)
    setStepState(0)
  }, [patientId])

  const finalize = useCallback(async (): Promise<SyncOutcome> => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    const outcome = await syncNow('completed')
    if (outcome === 'ok') setDataState(prev => ({ ...prev, status: 'completed' }))
    return outcome
  }, [syncNow])

  useEffect(() => () => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
  }, [])

  return {
    loading,
    loadError,
    patient,
    data,
    step,
    draftRestored,
    draftSavedAt,
    saveStatus,
    updateData,
    goToStep,
    discardDraft,
    finalize,
    syncNow,
  }
}
