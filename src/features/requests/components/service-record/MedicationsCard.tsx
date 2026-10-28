import { useState } from 'react'
import { Calculator, Eye } from 'lucide-react'
import { Modal } from '@/core/components/Modal'
import type { MedicationItem, ServiceRecord } from '@/core/api/types'
import { inputCls, labelCls } from '../../formStyles'
import { SectionCard } from './SectionCard'
import { EditableRowsTable } from './EditableRowsTable'

interface MedicationsCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function MedicationsCard({ data, update }: MedicationsCardProps) {
  const [doseOpen, setDoseOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [weightKg, setWeightKg] = useState('')
  const [dosePerKg, setDosePerKg] = useState('')

  const setMedications = (rows: Record<string, string>[]) =>
    update(prev => ({ ...prev, medications: rows as unknown as MedicationItem[] }))

  const totalDose = weightKg && dosePerKg ? (parseFloat(weightKg) * parseFloat(dosePerKg)) : null

  return (
    <SectionCard
      title="Medicamentos"
      action={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDoseOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <Calculator size={12} /> Calcular dosis
          </button>
          <button
            type="button"
            onClick={() => setSummaryOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <Eye size={12} /> Ver resumen
          </button>
        </div>
      }
    >
      <EditableRowsTable
        columns={[
          { key: 'activeIngredient', label: 'Principio activo' },
          { key: 'presentation', label: 'Presentación' },
          { key: 'quantity', label: 'Cantidad' },
        ]}
        rows={data.medications as unknown as Record<string, string>[]}
        onChange={setMedications}
        addLabel="Agregar un medicamento"
        emptyHint="No se han asignado medicamentos"
      />

      <Modal open={doseOpen} onClose={() => setDoseOpen(false)} size="sm">
        <Modal.Header onClose={() => setDoseOpen(false)}>Calcular dosis</Modal.Header>
        <Modal.Body>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Peso del paciente (kg)</label>
              <input value={weightKg} onChange={e => setWeightKg(e.target.value)} className={inputCls()} placeholder="20" inputMode="decimal" />
            </div>
            <div>
              <label className={labelCls}>Dosis indicada (mg/kg)</label>
              <input value={dosePerKg} onChange={e => setDosePerKg(e.target.value)} className={inputCls()} placeholder="10" inputMode="decimal" />
            </div>
            {totalDose !== null && !Number.isNaN(totalDose) && (
              <div className="rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                Dosis total: <strong>{totalDose.toFixed(1)} mg</strong>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} size="md">
        <Modal.Header onClose={() => setSummaryOpen(false)}>Resumen de medicamentos</Modal.Header>
        <Modal.Body>
          {data.medications.length === 0 ? (
            <p className="text-sm text-zinc-400 italic">No se han asignado medicamentos.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.medications.map((m, i) => (
                <li key={i} className="rounded border border-zinc-100 dark:border-zinc-800 px-3 py-2">
                  <p className="font-medium text-zinc-900 dark:text-white">{m.activeIngredient || 'Sin nombre'}</p>
                  <p className="text-xs text-zinc-500">{[m.presentation, m.quantity].filter(Boolean).join(' · ')}</p>
                </li>
              ))}
            </ul>
          )}
          {data.medicalExclusions && (
            <div className="mt-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-3 text-xs text-amber-700 dark:text-amber-400">
              <strong>Exclusiones médicas:</strong> {data.medicalExclusions}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </SectionCard>
  )
}
