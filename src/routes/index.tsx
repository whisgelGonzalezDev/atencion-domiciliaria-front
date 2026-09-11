import {
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom'
import { DashboardLayout } from '@/layout/DashboardLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { OverviewView } from '@/features/overview/OverviewView'
import { RequestsView } from '@/features/requests/RequestsView'
import { RequestDetailView } from '@/features/requests/RequestDetailView'
import { StaffView } from '@/features/staff/StaffView'
import { MapView } from '@/features/map/MapView'
import { SettingsView } from '@/features/settings/SettingsView'
import { PatientsView } from '@/features/patients/PatientsView'
import { PatientDetailView } from '@/features/patients/PatientDetailView'
import { VisitsView } from '@/features/visits/VisitsView'
import { BillingView } from '@/features/billing/BillingView'
import { AuditLogsView } from '@/features/audit-logs/AuditLogsView'
import { UsersView } from '@/features/users/UsersView'
import { ReportsView } from '@/features/reports/ReportsView'
import { StatisticsView } from '@/features/statistics/StatisticsView'
import { MedicalHistoryListView } from '@/features/medical-history/MedicalHistoryListView'
import { MedicalHistoryWizard } from '@/features/medical-history/MedicalHistoryWizard'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleHomeRedirect } from './RoleHomeRedirect'
import { ErrorBoundary } from '@/core/components'
import { NotFoundPage } from '@/core/components'

const ADMIN_OPERATIVO = ['admin', 'operativo'] as const

const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: <RoleHomeRedirect />,
  },
  {
    path: '/overview',
    element: (
      <ProtectedRoute roles={[...ADMIN_OPERATIVO]}>
        <ErrorBoundary>
          <OverviewView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/requests',
    element: (
      <ErrorBoundary>
        <RequestsView />
      </ErrorBoundary>
    ),
  },
  {
    path: '/requests/:id',
    element: (
      <ErrorBoundary>
        <RequestDetailView />
      </ErrorBoundary>
    ),
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute roles={[...ADMIN_OPERATIVO]}>
        <ErrorBoundary>
          <StaffView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/map',
    element: (
      <ProtectedRoute roles={[...ADMIN_OPERATIVO]}>
        <ErrorBoundary>
          <MapView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients',
    element: (
      <ProtectedRoute roles={[...ADMIN_OPERATIVO]}>
        <ErrorBoundary>
          <PatientsView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients/:id',
    element: (
      <ProtectedRoute roles={[...ADMIN_OPERATIVO]}>
        <ErrorBoundary>
          <PatientDetailView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/visits',
    element: (
      <ProtectedRoute roles={[...ADMIN_OPERATIVO]}>
        <ErrorBoundary>
          <VisitsView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/billing',
    element: (
      <ProtectedRoute roles={['admin']}>
        <ErrorBoundary>
          <BillingView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/audit-logs',
    element: (
      <ProtectedRoute roles={['admin']}>
        <ErrorBoundary>
          <AuditLogsView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute roles={['admin']}>
        <ErrorBoundary>
          <UsersView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute roles={['admin']}>
        <ErrorBoundary>
          <ReportsView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/statistics',
    element: (
      <ProtectedRoute roles={['admin']}>
        <ErrorBoundary>
          <StatisticsView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/medical-history',
    element: (
      <ProtectedRoute roles={['admin', 'doctor']}>
        <ErrorBoundary>
          <MedicalHistoryListView />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/medical-history/:patientId',
    element: (
      <ProtectedRoute roles={['admin', 'doctor']}>
        <ErrorBoundary>
          <MedicalHistoryWizard />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: <SettingsView />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: protectedRoutes,
    },
  ],
  // Matches Vite's `base` — "/" in dev, "/atencion-domiciliaria-front/" when
  // built for the GitHub Pages project page.
  { basename: import.meta.env.BASE_URL },
)
