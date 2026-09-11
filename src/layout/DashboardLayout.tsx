import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Heart, Home, List, Stethoscope, Map, Settings,
  LogOut, PanelLeft, X, Plus, Moon, Sun, Menu,
  Users, CalendarClock, Receipt, ScrollText, UserCog, FileDown, BarChart3, ClipboardList, Building2,
} from 'lucide-react'
import { useAuth, type Role } from '@/features/auth/hooks/useAuth'
import { useTheme } from '@/core/providers/ThemeProvider'
import { useSystemSettings } from '@/core/providers/SystemSettingsProvider'
import { useProductTour } from '@/core/tour/useProductTour'
import { NewRequestModal } from '@/features/requests/components/NewRequestModal'
import { OfflineBanner } from '@/core/components/OfflineBanner'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  badge?: number
  roles?: Role[]
}

const ADMIN_OPERATIVO: Role[] = ['admin', 'operativo']

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administradora',
  operativo: 'Operador/a',
  doctor: 'Médico',
}

const OPERATIONS_NAV_ITEMS: NavItem[] = [
  { to: '/overview', label: 'Resumen',        icon: Home, roles: ADMIN_OPERATIVO },
  { to: '/requests', label: 'Solicitudes',     icon: List },
  { to: '/staff',    label: 'Personal Médico', icon: Stethoscope, roles: ADMIN_OPERATIVO },
  { to: '/map',      label: 'Mapa de Zonas',   icon: Map, roles: ADMIN_OPERATIVO },
]

const MANAGEMENT_NAV_ITEMS: NavItem[] = [
  { to: '/patients',        label: 'Pacientes',       icon: Users, roles: ADMIN_OPERATIVO },
  { to: '/visits',          label: 'Visitas',         icon: CalendarClock, roles: ADMIN_OPERATIVO },
  { to: '/medical-history', label: 'Historia Médica', icon: ClipboardList, roles: ['admin', 'doctor'] },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: '/billing',        label: 'Facturación',    icon: Receipt,    roles: ['admin'] },
  { to: '/statistics',     label: 'Estadísticas',   icon: BarChart3,  roles: ['admin'] },
  { to: '/audit-logs',     label: 'Auditoría',      icon: ScrollText, roles: ['admin'] },
  { to: '/reports',        label: 'Reportes',       icon: FileDown,   roles: ['admin'] },
  { to: '/users',          label: 'Usuarios',       icon: UserCog,    roles: ['admin'] },
  { to: '/admin-settings', label: 'Panel Admin',    icon: Building2,  roles: ['admin'] },
]

const BASE = 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100'
const ACTIVE = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
const INACTIVE = 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const { settings } = useSystemSettings()
  const clinicName = settings?.clinicName || 'Atención domiciliaria'
  const isAdmin = user?.role === 'admin'
  const isOperativo = user?.role === 'operativo'
  const canManageOps = isAdmin || isOperativo
  const hasRole = (roles?: Role[]) => !roles || (user ? roles.includes(user.role) : false)
  const visibleManagementItems = MANAGEMENT_NAV_ITEMS.filter(item => hasRole(item.roles))
  const visibleAdminItems = ADMIN_NAV_ITEMS.filter(item => hasRole(item.roles))
  const { isDark, toggle: toggleTheme } = useTheme()
  const { startTour } = useProductTour()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const closeMobileNav = () => setMobileOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Auto-arranca el recorrido guiado la primera vez que el usuario entra al
  // dashboard. El timeout deja que el sidebar/header ya estén pintados antes
  // de que driver.js busque los elementos `data-tour`.
  useEffect(() => {
    if (!user || user.hasCompletedTour) return
    const timer = setTimeout(() => startTour(), 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <OfflineBanner />
      <div className="flex flex-1 overflow-hidden relative">
      {/* Backdrop, mobile drawer only */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — a fixed sliding drawer below md, a static column at md+ */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shrink-0 transition-transform duration-200 w-64',
          'md:static md:z-auto md:transition-[width] md:duration-200 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ width: collapsed ? '4rem' : undefined }}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="" className="h-5 w-5 shrink-0 rounded object-contain" />
              ) : (
                <Heart size={18} style={{ color: 'var(--accent)' }} className="shrink-0" />
              )}
              <span className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight truncate">
                {clinicName}
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ml-auto"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <PanelLeft size={16} /> : <X size={16} />}
          </button>
          <button
            onClick={closeMobileNav}
            className="md:hidden flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ml-auto"
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {!collapsed && (
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
              Operaciones
            </p>
          )}
          {OPERATIONS_NAV_ITEMS.filter(item => hasRole(item.roles)).map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobileNav}
              data-tour={`nav-${to.slice(1)}`}
              className={({ isActive }) => [BASE, isActive ? ACTIVE : INACTIVE].join(' ')}
              title={collapsed ? label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
              {!collapsed && badge !== undefined && badge > 0 && (
                <span
                  className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          ))}

          {visibleManagementItems.length > 0 && (
            <>
              {!collapsed && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  Gestión
                </p>
              )}
              {visibleManagementItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobileNav}
                  data-tour={`nav-${to.slice(1)}`}
                  className={({ isActive }) => [BASE, isActive ? ACTIVE : INACTIVE].join(' ')}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{label}</span>}
                </NavLink>
              ))}
            </>
          )}

          {visibleAdminItems.length > 0 && (
            <>
              {!collapsed && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  Administración
                </p>
              )}
              {visibleAdminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobileNav}
                  data-tour={`nav-${to.slice(1)}`}
                  className={({ isActive }) => [BASE, isActive ? ACTIVE : INACTIVE].join(' ')}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{label}</span>}
                </NavLink>
              ))}
            </>
          )}

          {!collapsed && (
            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
              Sistema
            </p>
          )}
          <NavLink
            to="/settings"
            onClick={closeMobileNav}
            data-tour="nav-settings"
            className={({ isActive }) => [BASE, isActive ? ACTIVE : INACTIVE].join(' ')}
            title={collapsed ? 'Configuración' : undefined}
          >
            <Settings size={16} className="shrink-0" />
            {!collapsed && <span className="flex-1 truncate">Configuración</span>}
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-2">
          {!collapsed && user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{ROLE_LABEL[user.role]}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={[BASE, 'w-full text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400'].join(' ')}
            title={collapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-6 gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canManageOps && (
              <button
                onClick={() => setModalOpen(true)}
                data-tour="new-request-btn"
                className="hidden sm:inline-flex items-center gap-1.5 rounded px-3 h-8 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-strong)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
              >
                <Plus size={13} />
                Nueva solicitud
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      </div>

      <NewRequestModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => setModalOpen(false)} />
    </div>
  )
}
