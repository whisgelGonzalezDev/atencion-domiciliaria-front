import { Check } from 'lucide-react'

interface StepProgressProps {
  steps: string[]
  currentStep: number
  onStepClick: (index: number) => void
}

export function StepProgress({ steps, currentStep, onStepClick }: StepProgressProps) {
  return (
    <div>
      {/* Desktop: labeled steps */}
      <ol className="hidden sm:flex items-center">
        {steps.map((label, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => onStepClick(i)}
                className="flex items-center gap-2 group"
              >
                <span
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold border transition-colors',
                    done ? 'text-white border-transparent' : active
                      ? 'border-2 text-zinc-900 dark:text-white'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600',
                  ].join(' ')}
                  style={
                    done ? { backgroundColor: 'var(--accent)' }
                    : active ? { borderColor: 'var(--accent)' }
                    : undefined
                  }
                >
                  {done ? <Check size={13} /> : i + 1}
                </span>
                <span className={[
                  'text-xs font-medium whitespace-nowrap',
                  active ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400',
                ].join(' ')}>
                  {label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span className={['mx-3 h-px flex-1', done ? '' : 'bg-zinc-200 dark:bg-zinc-700'].join(' ')} style={done ? { backgroundColor: 'var(--accent)' } : undefined} />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile: compact "step X of N" + progress bar */}
      <div className="sm:hidden space-y-1.5">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Paso {currentStep + 1} de {steps.length} · <span className="text-zinc-900 dark:text-white">{steps[currentStep]}</span>
        </p>
        <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
      </div>
    </div>
  )
}
