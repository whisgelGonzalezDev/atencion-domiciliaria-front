import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, Moon, Sun, Eye, EyeOff } from 'lucide-react'
import { useAuth, getHomeRoute } from './hooks/useAuth'
import { useTheme } from '@/core/providers/ThemeProvider'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()

  const [email, setEmail] = useState('admin@atencion.med')
  const [password, setPassword] = useState('demo1234')
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string })?.from

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 4) {
      setError('Credenciales inválidas')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const loggedInUser = await login(email, password)
      navigate(from ?? getHomeRoute(loggedInUser.role), { replace: true })
    } catch {
      setError('Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Heart size={18} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
            Atención<span className="text-zinc-400">·domiciliaria</span>
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="flex flex-1">
        {/* Left — Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--accent-soft)' }}>
                <Heart size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Bienvenido de vuelta</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Ingresa con tu cuenta institucional</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Correo electrónico
                </label>
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@atencion.med"
                  className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-shadow"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-3.5 w-3.5 rounded border-zinc-300" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Mantener sesión iniciada</span>
              </label>

              {error && (
                <p className="rounded bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full h-10 rounded text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600 space-y-0.5">
              <p>Demo (contraseña: demo1234):</p>
              <p>admin@atencion.med · operador@atencion.med · medico@atencion.med</p>
            </div>
          </div>
        </div>

        {/* Right — Visual */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden map-grid items-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
          <div className="flex flex-col justify-center px-16 py-12 w-full">
            <span className="mb-8 inline-flex self-start items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs font-medium" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--success)', animation: 'pulse 2s infinite' }} />
              Sistema operativo · 99.9% uptime
            </span>
            <h2 className="text-3xl font-bold leading-snug" style={{ color: 'var(--accent-strong)' }}>
              Coordinación de atención médica domiciliaria, en tiempo real.
            </h2>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: '142', label: 'Solicitudes hoy' },
                { value: '23m',  label: 'Tiempo promedio' },
                { value: '4.8',  label: 'Satisfacción' },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white/70 backdrop-blur px-4 py-4 text-center shadow-card">
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{s.value}</p>
                  <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
