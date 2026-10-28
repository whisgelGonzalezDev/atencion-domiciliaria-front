import type { OtherMedicationItem, ServiceRecord } from '@/core/api/types'
import { SectionCard } from './SectionCard'
import { EditableRowsTable } from './EditableRowsTable'

interface OtherMedicationsCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function OtherMedicationsCard({ data, update }: OtherMedicationsCardProps) {
  const setRows = (rows: Record<string, string>[]) =>
    update(prev => ({ ...prev, otherMedications: rows as unknown as OtherMedicationItem[] }))

  return (
    <SectionCard title="Otros medicamentos">
      <EditableRowsTable
        columns={[
          { key: 'name', label: 'Medicamento' },
          { key: 'indications', label: 'Indicaciones' },
        ]}
        rows={data.otherMedications as unknown as Record<string, string>[]}
        onChange={setRows}
        addLabel="Agregar"
        emptyHint="No se han agregado otros medicamentos"
      />
    </SectionCard>
  )
}
