import type { ServiceRecord, ServiceType } from '@/core/api/types'

export function emptyServiceRecord(serviceType: ServiceType = 'AMD'): ServiceRecord {
  return {
    serviceType,
    affiliate: {
      idNumber: '', sex: '', birthDate: '', insurancePlan: '', insuranceBranch: '', policyHolder: '', email: '',
    },
    roomDetails: {
      hasElectricity: false, hasUnitGuard: false, hasPrecipitation: false, hasElevator: false,
    },
    externalProvider: {
      enabled: false, headquarters: '', providerName: '', createdBy: '', attendedBy: '',
    },
    timing: { startDate: '', startTime: '', endDate: '', endTime: '' },
    currentIllness: '',
    medicalBackground: '',
    functionalExam: '',
    swabTest: { type: '', result: '' },
    fullVitals: { hr: '', rr: '', spo2: '', bp: '', temp: '', glucose: '' },
    physicalExam: '',
    symptomsList: [],
    diagnosis: '',
    diagnosisNotes: '',
    medicalExclusions: '',
    medications: [],
    otherMedications: [],
    recipeText: '',
    indicationsText: '',
    supplies: [],
    paraclinicalExams: '',
    medicalRecommendations: '',
    specialistReferences: '',
    successiveServiceRequested: false,
    successiveServiceNotes: '',
    affiliateSignedAt: null,
    doctorSignedAt: null,
    affiliateSignatureDataUrl: null,
    doctorSignatureDataUrl: null,
  }
}
