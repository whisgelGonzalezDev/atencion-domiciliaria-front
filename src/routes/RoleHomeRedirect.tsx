import { Navigate } from 'react-router-dom'
import { useAuth, getHomeRoute } from '@/features/auth/hooks/useAuth'

export function RoleHomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? getHomeRoute(user.role) : '/overview'} replace />
}
