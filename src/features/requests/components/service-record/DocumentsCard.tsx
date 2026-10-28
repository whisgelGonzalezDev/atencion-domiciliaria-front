import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'
import type { MedRequest, ServiceRecord } from '@/core/api/types'
import { useSystemSettings } from '@/core/providers/SystemSettingsProvider'
import { SectionCard } from './SectionCard'

interface DocumentsCardProps {
  request: MedRequest
  data: ServiceRecord
}

type DocId = 'recipe' | 'report' | 'interconsulta'
type Settings = ReturnType<typeof useSystemSettings>['settings']

// Dynamically imported: jsPDF (+ its html2canvas/dompurify transitive deps)
// is only needed once someone actually downloads a document, not on every
// page load of the request detail view.
const DOCS: { id: DocId; label: string; load: () => Promise<(request: MedRequest, data: ServiceRecord, settings: Settings) => Promise<void>> }[] = [
  { id: 'recipe', label: 'Récipe', load: () => import('../../pdf/recipePdf').then(m => m.generateRecipePdf) },
  { id: 'report', label: 'Informe de atención médica', load: () => import('../../pdf/medicalReportPdf').then(m => m.generateMedicalReportPdf) },
  { id: 'interconsulta', label: 'Informe de interconsulta', load: () => import('../../pdf/interconsultaPdf').then(m => m.generateInterconsultaPdf) },
]

export function DocumentsCard({ request, data }: DocumentsCardProps) {
  const { settings } = useSystemSettings()
  const [generating, setGenerating] = useState<DocId | null>(null)

  const handleGenerate = async (doc: typeof DOCS[number]) => {
    setGenerating(doc.id)
    try {
      const generate = await doc.load()
      await generate(request, data, settings)
    } catch {
      toast.error(`No se pudo generar el documento: ${doc.label}`)
    } finally {
      setGenerating(null)
    }
  }

  return (
    <SectionCard title="Documentos">
      <div className="flex flex-wrap gap-2">
        {DOCS.map(doc => (
          <button
            key={doc.id}
            type="button"
            onClick={() => handleGenerate(doc)}
            disabled={generating !== null}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            {generating === doc.id
              ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
              : <FileDown size={12} />}
            {doc.label}
          </button>
        ))}
      </div>
    </SectionCard>
  )
}
