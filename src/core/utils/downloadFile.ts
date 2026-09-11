import { BASE_URL } from './apiClient'

/**
 * Descarga un archivo desde el backend (p. ej. un CSV) y dispara la
 * descarga en el navegador. A diferencia de `apiClient`, no asume una
 * respuesta JSON `{data: T}` — el body se trata como binario.
 */
export async function downloadFile(endpoint: string, filename: string): Promise<void> {
  const token = localStorage.getItem('auth_token')
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.error?.message ?? body?.message ?? 'No se pudo generar el reporte'
    throw new Error(typeof message === 'string' ? message : 'No se pudo generar el reporte')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
