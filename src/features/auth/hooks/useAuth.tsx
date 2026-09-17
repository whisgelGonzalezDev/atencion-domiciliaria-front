import { useState, useEffect, createContext, useContext } from 'react'
import { apiClient, ApiError } from '@/core/utils/apiClient'

export type Role = 'admin' | 'operativo' | 'doctor'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  hasCompletedTour: boolean
  doctorId?: string
}

export function getHomeRoute(role: Role): string {
  return role === 'doctor' ? '/requests' : '/overview'
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  markTourCompleted: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const stored = localStorage.getItem('auth_user')

    if (!token) {
      setIsLoading(false)
      return
    }

    // No basta con que localStorage tenga algo guardado: un token vencido o
    // revocado igual pasaría el guard de ProtectedRoute si solo miráramos
    // "hay usuario en localStorage". Se confirma contra el backend antes de
    // dar la sesión por válida.
    apiClient<AuthUser>('/auth/me')
      .then(freshUser => {
        localStorage.setItem('auth_user', JSON.stringify(freshUser))
        setUser(freshUser)
      })
      .catch(err => {
        if (err instanceof ApiError) {
          // El backend rechazó el token explícitamente (vencido/inválido) — cerramos sesión.
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          setUser(null)
          return
        }
        // Sin conexión: no se puede confirmar la sesión contra el backend,
        // pero tampoco hay motivo para cerrarla en una app pensada para
        // conectividad inestable — se sigue con lo último guardado.
        if (stored) {
          try {
            setUser(JSON.parse(stored) as AuthUser)
          } catch {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
          }
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiClient<{ accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('auth_token', res.accessToken)
    localStorage.setItem('auth_user', JSON.stringify(res.user))
    setUser(res.user)
    return res.user
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  // Fire-and-forget: the tour already closed visually either way, this just
  // persists the "don't auto-show again" flag. If it fails, worst case the
  // tour reappears next session and the user dismisses it again.
  const markTourCompleted = () => {
    setUser(prev => {
      if (!prev || prev.hasCompletedTour) return prev
      const next = { ...prev, hasCompletedTour: true }
      localStorage.setItem('auth_user', JSON.stringify(next))
      return next
    })
    apiClient('/auth/me/complete-tour', { method: 'PATCH' }).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, markTourCompleted }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
