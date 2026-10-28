import type { ServiceRecord } from '@/core/api/types'
import { SectionCard } from './SectionCard'
import { SignaturePad } from './SignaturePad'

interface SignaturesCardProps {
  data: ServiceRecord
  update: (updater: (prev: ServiceRecord) => ServiceRecord) => void
}

export function SignaturesCard({ data, update }: SignaturesCardProps) {
  return (
    <SectionCard title="Firmas">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SignaturePad
          label="Firma del afiliado"
          signedAt={data.affiliateSignedAt}
          dataUrl={data.affiliateSignatureDataUrl}
          onSign={(dataUrl, signedAt) => update(prev => ({ ...prev, affiliateSignatureDataUrl: dataUrl, affiliateSignedAt: signedAt }))}
          onClear={() => update(prev => ({ ...prev, affiliateSignatureDataUrl: null, affiliateSignedAt: null }))}
        />
        <SignaturePad
          label="Firma del médico"
          signedAt={data.doctorSignedAt}
          dataUrl={data.doctorSignatureDataUrl}
          onSign={(dataUrl, signedAt) => update(prev => ({ ...prev, doctorSignatureDataUrl: dataUrl, doctorSignedAt: signedAt }))}
          onClear={() => update(prev => ({ ...prev, doctorSignatureDataUrl: null, doctorSignedAt: null }))}
        />
      </div>
    </SectionCard>
  )
}
