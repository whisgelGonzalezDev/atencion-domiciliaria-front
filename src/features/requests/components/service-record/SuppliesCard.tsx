import type { ServiceRecord, SupplyItem } from '@/core/api/types'
import { SectionCard } from './SectionCard'
import { EditableRowsTable } from './EditableRowsTable'

interface SuppliesCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function SuppliesCard({ data, update }: SuppliesCardProps) {
  const setRows = (rows: Record<string, string>[]) =>
    update(prev => ({ ...prev, supplies: rows as unknown as SupplyItem[] }))

  return (
    <SectionCard title="Insumos médicos">
      <EditableRowsTable
        columns={[
          { key: 'name', label: 'Insumo' },
          { key: 'quantity', label: 'Cantidad' },
        ]}
        rows={data.supplies as unknown as Record<string, string>[]}
        onChange={setRows}
        addLabel="Agregar un insumo"
        emptyHint="No se han asignado insumos"
      />
    </SectionCard>
  )
}
