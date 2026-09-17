import { HabitField } from '../components/HabitField'
import { inputCls, labelCls } from '../formStyles'
import type { StepProps } from './types'

export function HabitsStep({ data, onChange }: StepProps) {
  const { habits } = data

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Hábitos tóxicos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <HabitField
            label="Tabaco"
            value={habits.smoking}
            onChange={v => onChange(prev => ({ ...prev, habits: { ...prev.habits, smoking: v } }))}
            detailPlaceholder="Ej. 1 cajetilla/semana"
          />
          <HabitField
            label="Alcohol"
            value={habits.alcohol}
            onChange={v => onChange(prev => ({ ...prev, habits: { ...prev.habits, alcohol: v } }))}
            detailPlaceholder="Ej. Socialmente, fines de semana"
          />
          <HabitField
            label="Otras sustancias"
            value={habits.drugs}
            onChange={v => onChange(prev => ({ ...prev, habits: { ...prev.habits, drugs: v } }))}
            detailPlaceholder="Detalles"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Estilo de vida</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={labelCls}>Actividad física</label>
            <input
              value={habits.physicalActivity ?? ''}
              onChange={e => onChange(prev => ({ ...prev, habits: { ...prev.habits, physicalActivity: e.target.value } }))}
              placeholder="Ej. Camina 30min, 3 veces/semana"
              className={inputCls()}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Dieta</label>
            <input
              value={habits.diet ?? ''}
              onChange={e => onChange(prev => ({ ...prev, habits: { ...prev.habits, diet: e.target.value } }))}
              placeholder="Ej. Baja en sodio"
              className={inputCls()}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Horas de sueño</label>
            <input
              type="number" min={0} max={24}
              value={habits.sleepHours ?? ''}
              onChange={e => onChange(prev => ({
                ...prev,
                habits: { ...prev.habits, sleepHours: e.target.value ? Number(e.target.value) : undefined },
              }))}
              placeholder="Ej. 7"
              className={inputCls()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
