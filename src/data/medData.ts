// ── Zonas ──────────────────────────────────────────────────────────────────
export const ZONES = ['Centro','Norte','Sur','Este','Oeste','Las Lomas','San Miguel','El Parque']

// ── Médicos ────────────────────────────────────────────────────────────────
export interface Doctor {
  id: string
  name: string
  spec: string
  status: 'available' | 'busy' | 'offshift'
  shift: string
  cases: number
  rating: number
}

export const DOCTORS: Doctor[] = [
  { id:'D-01', name:'Dr. Andrés Morales',  spec:'Medicina General', status:'available', shift:'Diurno',  cases:12, rating:4.9 },
  { id:'D-02', name:'Dra. Laura Pérez',    spec:'Cardiología',      status:'busy',      shift:'Diurno',  cases:8,  rating:4.8 },
  { id:'D-03', name:'Dr. Diego Rivera',    spec:'Pediatría',        status:'available', shift:'Diurno',  cases:15, rating:4.7 },
  { id:'D-04', name:'Dra. Sofía Castro',   spec:'Medicina Interna', status:'busy',      shift:'Nocturno',cases:10, rating:4.9 },
  { id:'D-05', name:'Dr. Mateo Reyes',     spec:'Geriatría',        status:'offshift',  shift:'Nocturno',cases:6,  rating:4.6 },
  { id:'D-06', name:'Dra. Camila Torres',  spec:'Medicina General', status:'available', shift:'Diurno',  cases:14, rating:4.8 },
  { id:'D-07', name:'Dr. Pablo Gómez',     spec:'Neumología',       status:'available', shift:'Diurno',  cases:9,  rating:4.7 },
  { id:'D-08', name:'Dra. Lucía Flores',   spec:'Medicina General', status:'busy',      shift:'Diurno',  cases:11, rating:4.8 },
  { id:'D-09', name:'Dr. Ricardo Vargas',  spec:'Endocrinología',   status:'offshift',  shift:'Nocturno',cases:7,  rating:4.5 },
  { id:'D-10', name:'Dra. Elena Ortiz',    spec:'Medicina General', status:'available', shift:'Nocturno',cases:13, rating:4.9 },
]

// ── Estados de solicitud ────────────────────────────────────────────────────
export type StateId = 'pending' | 'enroute' | 'attending' | 'done' | 'cancelled'

export const STATES: { id: StateId; label: string; color: string }[] = [
  { id:'pending',   label:'Pendiente',   color:'amber'   },
  { id:'enroute',   label:'En camino',   color:'sky'     },
  { id:'attending', label:'Atendiendo',  color:'violet'  },
  { id:'done',      label:'Completada',  color:'emerald' },
  { id:'cancelled', label:'Cancelada',   color:'rose'    },
]

// ── Niveles de prioridad ────────────────────────────────────────────────────
export type PriorityId = 'low' | 'mid' | 'emergency'

export const PRIORITY: { id: PriorityId; label: string }[] = [
  { id:'low',       label:'Baja'       },
  { id:'mid',       label:'Media'      },
  { id:'emergency', label:'Emergencia' },
]

// ── Síntomas de muestra ─────────────────────────────────────────────────────
const SYMPTOMS = [
  'Dolor torácico, dificultad respiratoria',
  'Fiebre alta persistente, escalofríos',
  'Hipertensión descompensada',
  'Cefalea intensa, náuseas',
  'Dolor abdominal agudo',
  'Crisis asmática moderada',
  'Vómitos y deshidratación',
  'Caída con dolor en cadera',
  'Reacción alérgica, urticaria',
  'Glucemia elevada, mareo',
  'Lumbalgia aguda',
  'Tos persistente, malestar general',
]

const FIRST_NAMES = ['María','José','Ana','Luis','Carmen','Carlos','Laura','Diego','Sofía','Andrés','Valentina','Mateo','Camila','Jorge','Lucía','Pablo','Isabel','Ricardo','Elena','Gabriel']
const LAST_NAMES  = ['García','Rodríguez','Martínez','López','Hernández','González','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Reyes','Morales','Cruz','Ortiz','Vargas','Castro']
const STREETS     = ['Av. Libertador','Calle 7','Av. Central','Cra. 23','Av. del Sol','Calle 14','Av. Universidad','Calle Pinos','Av. Bolívar','Cra. 5']
const pick = <T,>(arr: T[], i: number): T => arr[i % arr.length]
const fullName = (i: number) => `${pick(FIRST_NAMES, i*3+1)} ${pick(LAST_NAMES, i*7+5)}`

export interface MedRequest {
  id: string
  patient: string
  age: number
  phone: string
  address: string
  zone: string
  symptoms: string
  doctor: Doctor | null
  state: StateId
  priority: PriorityId
  minutesAgo: number
  callTime: Date
  vitals: { bp: string; hr: number; temp: string; spo2: number }
  historyShort: string
}

export const REQUESTS: MedRequest[] = Array.from({ length: 24 }).map((_, i) => {
  const stateIdx = i % 4
  const priIdx   = (i * 3) % 3
  const docIdx   = (i * 2 + 1) % DOCTORS.length
  const minutesAgo = (i * 13 + 7) % 240
  const callTime   = new Date(Date.now() - minutesAgo * 60000)
  return {
    id: `SOL-${String(2840 + i).padStart(4,'0')}`,
    patient:  fullName(i),
    age:      18 + (i * 7) % 70,
    phone:    `+57 ${String(300+i).padStart(3,'0')} ${String(1000+i*73).slice(0,3)} ${String(1000+i*41).slice(0,4)}`,
    address:  `${pick(STREETS,i)} #${(i*7+12)%99}-${(i*3+4)%99}`,
    zone:     ZONES[(i*5) % ZONES.length],
    symptoms: pick(SYMPTOMS, i*2+1),
    doctor:   stateIdx === 0 ? null : DOCTORS[docIdx],
    state:    STATES[stateIdx].id,
    priority: PRIORITY[priIdx].id,
    minutesAgo,
    callTime,
    vitals: {
      bp:   `${110+(i*3)%40}/${70+(i*2)%20}`,
      hr:   60 + (i*7)%40,
      temp: (36.4 + ((i*13)%18)/10).toFixed(1),
      spo2: 92 + (i*3)%8,
    },
    historyShort: pick([
      'HTA en tratamiento, sin alergias conocidas.',
      'Diabetes tipo II, alergia a penicilina.',
      'Asma controlada, no fumador.',
      'Sin antecedentes relevantes.',
      'EPOC, ex-fumador 10 años.',
      'Cardiopatía isquémica, anticoagulado.',
    ], i),
  }
})

// ── KPIs ───────────────────────────────────────────────────────────────────
export const KPI = {
  todayRequests:     REQUESTS.length,
  todayDelta:        +18,
  patientsAttended:  REQUESTS.filter(r => r.state === 'done').length,
  patientsDelta:     +12,
  doctorsRoute:      DOCTORS.filter(d => d.status === 'busy').length,
  doctorsAvail:      DOCTORS.filter(d => d.status === 'available').length,
  avgResponse:       23,
  avgResponseDelta: -8,
}

// ── Marcadores para mapa ───────────────────────────────────────────────────
export interface MapMarker {
  id: string; x: number; y: number
  state: StateId; priority: PriorityId; zone: string
}

export const MAP_MARKERS: MapMarker[] = REQUESTS.slice(0,14).map((r,i) => ({
  id: r.id, x: 8+((i*53)%84), y: 10+((i*37)%78),
  state: r.state, priority: r.priority, zone: r.zone,
}))

// ── Alta prioridad para overview ──────────────────────────────────────────
export const RECENT_HIGH_PRI = REQUESTS
  .filter(r => r.priority === 'emergency' || r.priority === 'mid')
  .slice(0, 6)
