import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/core/components/Card'
import { useMedicalHistoryDraft } from './useMedicalHistoryDraft'
import { StepProgress } from './components/StepProgress'
import { DraftBanner } from './components/DraftBanner'
import { SaveStatusIndicator } from './components/SaveStatusIndicator'
import { PathologicalStep } from './steps/PathologicalStep'
import { FamilyStep } from './steps/FamilyStep'
import { HabitsStep } from './steps/HabitsStep'
import { VitalsStep } from './steps/VitalsStep'
import { ReviewOfSystemsStep } from './steps/ReviewOfSystemsStep'
import { SummaryStep } from './steps/SummaryStep'
import type { StepProps } from './steps/types'

const STEPS: { label: string; Component: (props: StepProps) => React.ReactElement }[] = [
  { label: 'Antecedentes patológicos', Component: PathologicalStep },
  { label: 'Antecedentes familiares', Component: FamilyStep },
  { label: 'Hábitos', Component: HabitsStep },
  { label: 'Signos vitales', Component: VitalsStep },
  { label: 'Revisión por sistemas', Component: ReviewOfSystemsStep },
  { label: 'Diagnósticos y plan', Component: SummaryStep },
]

export function MedicalHistoryWizard() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const {
    loading, loadError, patient, data, step, draftRestored, draftSavedAt,
    saveStatus, updateData, goToStep, discardDraft, finalize, syncNow,
  } = useMedicalHistoryDraft(patientId ?? '')

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300" />
      </div>
    )
  }

  if (loadError) {
    return <div className="text-sm text-red-500 p-4">Error: {loadError}</div>
  }

  const isLastStep = step === STEPS.length - 1
  const { Component } = STEPS[step]

  const handleSaveAndExit = async () => {
    const outcome = await syncNow()
    if (outcome === 'error') {
      toast.error('No se pudo guardar. Verifica los datos e intenta de nuevo.')
      return
    }
    if (outcome === 'offline') {
      toast.message('Sin conexión: se guardará automáticamente cuando vuelva la conexión.')
    } else {
      toast.success('Progreso guardado')
    }
    navigate('/medical-history')
  }

  const handleFinish = async () => {
    const outcome = await finalize()
    if (outcome === 'error') {
      toast.error('No se pudo finalizar la historia médica. Intenta de nuevo.')
      return
    }
    if (outcome === 'offline') {
      toast.message('Sin conexión: la historia se finalizará automáticamente cuando vuelva la conexión.')
    } else {
      toast.success('Historia médica guardada')
    }
    navigate('/medical-history')
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/medical-history')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mt-0.5"
            aria-label="Volver"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Historia médica{patient ? ` · ${patient.name}` : ''}</h1>
            {patient && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{patient.age} años · {patient.phone}</p>
            )}
          </div>
        </div>
        <SaveStatusIndicator status={saveStatus} />
      </div>

      {draftRestored && <DraftBanner savedAt={draftSavedAt} onDiscard={discardDraft} />}

      <Card padding="md">
        <StepProgress steps={STEPS.map(s => s.label)} currentStep={step} onStepClick={goToStep} />
      </Card>

      <Card padding="lg">
        <Component data={data} onChange={updateData} />
      </Card>

      <div className="flex items-center justify-between gap-3 pb-2">
        <button
          onClick={() => goToStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft size={13} />
          Atrás
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleSaveAndExit()}
            className="h-9 px-4 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Guardar y salir
          </button>
          {isLastStep ? (
            <button
              onClick={() => void handleFinish()}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Check size={13} />
              Finalizar historia médica
            </button>
          ) : (
            <button
              onClick={() => goToStep(Math.min(STEPS.length - 1, step + 1))}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Siguiente
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
