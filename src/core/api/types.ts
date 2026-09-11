export interface Doctor {
  id: string
  name: string
  specialty: string
  status: 'available' | 'busy' | 'offshift'
  shift: string
  casesToday: number
  rating: number
}

export interface PatientInfo {
  id: string
  name: string
  age: number
  phone: string
  bloodType?: string
  historyShort?: string
}

export interface Patient {
  id: string
  name: string
  age: number
  phone: string
  bloodType?: string
  historyShort?: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  text: string
  authorName: string
  createdAt: string
}

export interface MedRequest {
  id: string
  state: 'pending' | 'enroute' | 'attending' | 'done' | 'cancelled'
  priority: 'low' | 'mid' | 'emergency'
  patient: PatientInfo
  address: string
  referencesText?: string
  symptoms: string
  additionalNotes?: string
  callTime: string
  minutesAgo: number
  zone: { id: string; name: string }
  doctor?: Doctor
  vitals?: { bp: string; hr: number; temp: string; spo2: number }
  notes: Note[]
}

export interface KpiData {
  todayRequests: number
  todayDelta: number
  patientsAttended: number
  patientsDelta: number
  doctorsRoute: number
  doctorsAvail: number
  avgResponse: number
  avgResponseDelta: number
}

export interface MapMarker {
  id: string
  lat: number
  lng: number
  priority: string
  state: string
  zone: string
}

export interface Zone {
  id: string
  name: string
  lat: number
  lng: number
  radiusKm: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface UserAccount {
  id: string
  name: string
  email: string
  role: 'admin' | 'operativo' | 'doctor'
  doctorId?: string
  hasCompletedTour: boolean
}

export interface WhatsAppLink {
  phone: string
  message: string
  url: string
}

export interface Visit {
  id: string
  patientId: string
  patientName: string
  zoneId: string
  zoneName: string
  doctorId?: string
  doctorName?: string
  scheduledAt: string
  durationMinutes: number
  status: 'scheduled' | 'confirmed' | 'done' | 'missed' | 'cancelled'
  notes?: string
  seriesId?: string
  recurrenceFrequency?: 'weekly' | 'biweekly' | 'monthly'
  recurrenceUntil?: string
  createdAt: string
  updatedAt: string
}

export interface CreateVisitResult {
  visits: Visit[]
  warnings: string[]
}

export interface BillingCharge {
  id: string
  requestId: string
  amountBs: number
  amountUsd: number
  exchangeRate: number
  method: 'pago_movil' | 'zelle' | 'efectivo_usd' | 'transferencia' | 'otro'
  reference: string
  status: 'pending' | 'paid' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export type StatsPeriod = 'day' | 'week' | 'month' | 'year'

export interface SeriesPoint {
  label: string
  value: number
}

export interface CountByKey {
  key: string
  count: number
}

export interface RequestsStats {
  totalRequests: number
  deltaPct: number
  byState: CountByKey[]
  byPriority: CountByKey[]
  byZone: CountByKey[]
  series: SeriesPoint[]
}

export interface DoctorPerformance {
  doctorId: string
  doctorName: string
  completedRequests: number
  avgResponseMinutes: number
}

export interface PerformanceStats {
  avgResponseMinutes: number
  avgResponseDeltaPct: number
  completionRate: number
  completionRateDeltaPct: number
  cancelledRate: number
  byDoctor: DoctorPerformance[]
  series: SeriesPoint[]
}

export interface IncomeByMethod {
  method: string
  totalUsd: number
  count: number
}

export interface IncomeByStatus {
  status: string
  totalUsd: number
  count: number
}

export interface IncomeStats {
  totalUsd: number
  totalBs: number
  deltaPct: number
  pendingUsd: number
  byMethod: IncomeByMethod[]
  byStatus: IncomeByStatus[]
  series: SeriesPoint[]
}

export interface AuditLog {
  id: string
  actorId?: string
  actorEmail?: string
  actorRole?: string
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// ── Historia médica ─────────────────────────────────────────────────────────
export type HabitStatus = 'nunca' | 'actual' | 'anterior'

export interface HabitDetail {
  status: HabitStatus
  detail?: string
}

export interface Habits {
  smoking?: HabitDetail
  alcohol?: HabitDetail
  drugs?: HabitDetail
  physicalActivity?: string
  diet?: string
  sleepHours?: number
}

export interface BaselineVitals {
  bp?: string
  hr?: number
  rr?: number
  temp?: string
  spo2?: number
  weightKg?: number
  heightCm?: number
}

export interface SurgeryEntry { description: string; occurredAt?: string }
export interface AllergyEntry { substance: string; reaction?: string; severity?: 'leve' | 'moderada' | 'severa' }
export interface MedicationEntry { name: string; dose?: string; frequency?: string }
export interface FamilyHistoryEntry { relative: string; condition: string }
export interface DiagnosisEntry { description: string; diagnosedAt?: string }

export const REVIEW_OF_SYSTEMS_KEYS = [
  'cardiovascular', 'respiratorio', 'digestivo', 'genitourinario',
  'neurologico', 'musculoesqueletico', 'piel_faneras', 'endocrino',
] as const
export type ReviewOfSystemsKey = typeof REVIEW_OF_SYSTEMS_KEYS[number]

export interface MedicalHistoryFormData {
  status: 'draft' | 'completed'
  chronicConditions: string[]
  surgeries: SurgeryEntry[]
  allergies: AllergyEntry[]
  currentMedications: MedicationEntry[]
  familyHistory: FamilyHistoryEntry[]
  habits: Habits
  baselineVitals: BaselineVitals
  physicalExamNotes: string
  reviewOfSystems: Record<string, string>
  activeDiagnoses: DiagnosisEntry[]
  generalNotes: string
}

export interface MedicalHistory extends MedicalHistoryFormData {
  id: string
  patientId: string
  patientName: string
  lastEditedByName: string | null
  createdAt: string
  updatedAt: string
}

export interface MedicalHistoryPatientInfo {
  id: string
  name: string
  age: number
  phone: string
}

export interface MedicalHistoryDetail {
  patient: MedicalHistoryPatientInfo
  history: MedicalHistory | null
}

export interface MedicalHistoryPatientSummary {
  patientId: string
  patientName: string
  patientAge: number
  patientPhone: string
  status: 'none' | 'draft' | 'completed'
  updatedAt: string | null
  allergyCount: number
}

// ── Configuración del sistema (panel admin) ─────────────────────────────────
export interface SystemSettings {
  clinicName: string
  logoUrl: string | null
  accent: string
  accentSoft: string
  accentStrong: string
  defaultExchangeRate: number | null
  targetResponseMinutes: number | null
  businessHoursStart: string | null
  businessHoursEnd: string | null
  notifyNewRequest: boolean
  notifyOverdueRequest: boolean
  updatedByName: string | null
  updatedAt: string
}

export type UpdateSystemSettingsBody = Partial<Omit<SystemSettings, 'updatedByName' | 'updatedAt'>>
