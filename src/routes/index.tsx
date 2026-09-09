import {
  createBrowserRouter,
  Navigate,
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
import { ProtectedRoute } from './ProtectedRoute'
import { ErrorBoundary } from '@/core/components'
import { NotFoundPage } from '@/core/components'

const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/overview" replace />,
  },
  {
    path: '/overview',
    element: (
      <ErrorBoundary>
        <OverviewView />
      </ErrorBoundary>
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
      <ErrorBoundary>
        <StaffView />
      </ErrorBoundary>
    ),
  },
  {
    path: '/map',
    element: <MapView />,
  },
  {
    path: '/patients',
    element: (
      <ErrorBoundary>
        <PatientsView />
      </ErrorBoundary>
    ),
  },
  {
    path: '/patients/:id',
    element: (
      <ErrorBoundary>
        <PatientDetailView />
      </ErrorBoundary>
    ),
  },
  {
    path: '/visits',
    element: (
      <ErrorBoundary>
        <VisitsView />
      </ErrorBoundary>
    ),
  },
  {
    path: '/billing',
    element: (
      <ErrorBoundary>
        <BillingView />
      </ErrorBoundary>
    ),
  },
  {
    path: '/audit-logs',
    element: (
      <ErrorBoundary>
        <AuditLogsView />
      </ErrorBoundary>
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

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/login',
    element: <Navigate to="/login" replace />,
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: protectedRoutes,
  },
])
