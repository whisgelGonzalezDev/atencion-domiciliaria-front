import type { MedRequest } from '@/core/api/types'
import { useServiceRecordDraft } from '../../useServiceRecordDraft'
import { SaveStatusIndicator } from './SaveStatusIndicator'
import { ServiceTypeTabs } from './ServiceTypeTabs'
import { AffiliateInfoCard } from './AffiliateInfoCard'
import { ServiceLogisticsCard } from './ServiceLogisticsCard'
import { AttentionHistoryTable } from './AttentionHistoryTable'
import { ClinicalNarrativeCard } from './ClinicalNarrativeCard'
import { SwabTestCard } from './SwabTestCard'
import { FullVitalsCard } from './FullVitalsCard'
import { PhysicalExamCard } from './PhysicalExamCard'
import { MedicationsCard } from './MedicationsCard'
import { OtherMedicationsCard } from './OtherMedicationsCard'
import { RecipesIndicationsCard } from './RecipesIndicationsCard'
import { SuppliesCard } from './SuppliesCard'
import { ClinicalExtrasCard } from './ClinicalExtrasCard'
import { SuccessiveServiceCard } from './SuccessiveServiceCard'
import { SignaturesCard } from './SignaturesCard'
import { DocumentsCard } from './DocumentsCard'

interface ServiceRecordSectionProps {
  request: MedRequest
  history: MedRequest[]
  onNavigateHistory: (id: string) => void
}

export function ServiceRecordSection({ request, history, onNavigateHistory }: ServiceRecordSectionProps) {
  const { data, update, saveStatus, keepMine, acceptTheirs } = useServiceRecordDraft(request.id, request.serviceRecord)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <ServiceTypeTabs data={data} update={update} />
        <SaveStatusIndicator status={saveStatus} onKeepMine={() => void keepMine()} onAcceptTheirs={() => void acceptTheirs()} />
      </div>

      <ServiceLogisticsCard data={data} update={update} address={request.address} />
      <AffiliateInfoCard data={data} update={update} />
      <AttentionHistoryTable history={history} onNavigate={onNavigateHistory} />
      <ClinicalNarrativeCard data={data} update={update} />
      <SwabTestCard data={data} update={update} />
      <FullVitalsCard data={data} update={update} />
      <PhysicalExamCard data={data} update={update} />
      <MedicationsCard data={data} update={update} />
      <OtherMedicationsCard data={data} update={update} />
      <RecipesIndicationsCard data={data} update={update} />
      <SuppliesCard data={data} update={update} />
      <ClinicalExtrasCard data={data} update={update} />
      <SuccessiveServiceCard data={data} update={update} />
      <SignaturesCard data={data} update={update} />
      <DocumentsCard request={request} data={data} />
    </div>
  )
}
