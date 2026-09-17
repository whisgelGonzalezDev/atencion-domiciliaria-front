import { Check } from 'lucide-react'

interface StepProgressProps {
  steps: string[]
  currentStep: number
  onStepClick: (index: number) => void
}

export function StepProgress({ steps, currentStep, onStepClick }: StepProgressProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Paso {currentStep + 1} de {steps.length} ·{' '}
        <span className="text-zinc-900 dark:text-white">{steps[currentStep]}</span>
      </p>

      {/* Compact numbered circles + connectors — never overflows, since it
          carries no inline labels (unlike a full labeled stepper, six long
          Spanish step names never fit one row at any reasonable width). */}
      <ol className="flex items-center">
        {steps.map((label, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => onStepClick(i)}
                title={label}
                aria-label={label}
                aria-current={active ? 'step' : undefined}
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border transition-colors',
                  done ? 'text-white border-transparent' : active
                    ? 'border-2 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-600',
                ].join(' ')}
                style={
                  done ? { backgroundColor: 'var(--accent)' }
                  : active ? { borderColor: 'var(--accent)' }
                  : undefined
                }
              >
                {done ? <Check size={13} /> : i + 1}
              </button>
              {i < steps.length - 1 && (
                <span
                  className={['mx-1.5 sm:mx-2 h-px flex-1', done ? '' : 'bg-zinc-200 dark:bg-zinc-700'].join(' ')}
                  style={done ? { backgroundColor: 'var(--accent)' } : undefined}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
