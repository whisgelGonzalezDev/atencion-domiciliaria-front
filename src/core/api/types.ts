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
