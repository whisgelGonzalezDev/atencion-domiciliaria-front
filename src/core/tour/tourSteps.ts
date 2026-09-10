import type { DriveStep } from 'driver.js'

/**
 * Recorrido guiado de onboarding. Cada paso (salvo el de bienvenida) ancla a
 * un elemento marcado con `data-tour="..."` en el sidebar/header — ver
 * DashboardLayout.tsx. Los pasos admin-only se omiten para viewers, igual
 * que los propios ítems de navegación que resaltan.
 */
export function getTourSteps(isAdmin: boolean): DriveStep[] {
  const steps: DriveStep[] = [
    {
      popover: {
        title: 'Bienvenido a Atención Domiciliaria',
        description: 'Un recorrido rápido por las secciones principales del sistema. Puedes cerrarlo en cualquier momento con la X o la tecla Esc.',
      },
    },
    {
      element: '[data-tour="nav-overview"]',
      popover: {
        title: 'Resumen',
        description: 'KPIs del día (solicitudes, pacientes atendidos, médicos en ruta) y un mapa de operaciones en tiempo real.',
        side: 'right',
      },
    },
    {
      element: '[data-tour="nav-requests"]',
      popover: {
        title: 'Solicitudes',
        description: 'El ciclo de vida de cada aviso médico: pendiente → en camino → atendiendo → completada. Aquí se asigna médico, se agregan notas y se cancela si hace falta.',
        side: 'right',
      },
    },
    {
      element: '[data-tour="nav-staff"]',
      popover: {
        title: 'Personal Médico',
        description: 'Estado de los médicos (disponible / en ruta / fuera de turno) y asignación manual de solicitudes.',
        side: 'right',
      },
    },
    {
      element: '[data-tour="nav-map"]',
      popover: {
        title: 'Mapa de Zonas',
        description: 'Vista geográfica ilustrativa de las solicitudes activas por zona y estado.',
        side: 'right',
      },
    },
    {
      element: '[data-tour="nav-patients"]',
      popover: {
        title: 'Pacientes',
        description: 'Historial clínico breve y el registro de solicitudes y visitas de cada paciente.',
        side: 'right',
      },
    },
    {
      element: '[data-tour="nav-visits"]',
      popover: {
        title: 'Visitas',
        description: 'Agenda de visitas programadas, con soporte de recurrencia (semanal, quincenal, mensual) y disponibilidad del médico.',
        side: 'right',
      },
    },
    {
      element: '[data-tour="nav-billing"]',
      popover: {
        title: 'Facturación',
        description: 'Cobros en USD con tasa manual a Bs, método de pago (Pago Móvil, Zelle, efectivo) y su estado.',
        side: 'right',
      },
    },
  ]

  if (isAdmin) {
    steps.push({
      element: '[data-tour="nav-audit-logs"]',
      popover: {
        title: 'Auditoría',
        description: 'Registro de quién hizo qué y cuándo — solo visible para administradores.',
        side: 'right',
      },
    })
  }

  steps.push({
    element: '[data-tour="nav-settings"]',
    popover: {
      title: 'Configuración',
      description: 'Color de acento, densidad de tablas, modo oscuro — y desde aquí puedes repetir este recorrido cuando quieras.',
      side: 'right',
    },
  })

  if (isAdmin) {
    steps.push({
      element: '[data-tour="new-request-btn"]',
      popover: {
        title: 'Nueva solicitud',
        description: 'Registra una solicitud médica nueva con los datos del paciente, ubicación, síntomas y prioridad.',
        side: 'bottom',
      },
    })
  }

  steps.push({
    popover: {
      title: 'Listo',
      description: 'Eso es todo por ahora. Si quieres verlo de nuevo, está disponible desde Configuración → Ayuda.',
    },
  })

  return steps
}
