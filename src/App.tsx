import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/core/providers/ThemeProvider'
import { SystemSettingsProvider } from '@/core/providers/SystemSettingsProvider'
import { AuthProvider } from '@/features/auth/hooks/useAuth'
import { useAppUpdate } from '@/core/pwa/useAppUpdate'
import { router } from '@/routes'
import '@/core/tour/tour.css'
import 'leaflet/dist/leaflet.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export function App() {
  useAppUpdate()

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SystemSettingsProvider>
            <RouterProvider router={router} />
          </SystemSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
