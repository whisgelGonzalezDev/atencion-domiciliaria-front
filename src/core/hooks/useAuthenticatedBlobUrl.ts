import { useEffect, useState } from 'react'
import { BASE_URL } from '@/core/utils/apiClient'

/**
 * Los endpoints de archivos requieren el header Authorization, así que un
 * <img src="..."> plano no sirve: hay que traer los bytes con fetch (con el
 * token) y exponerlos como blob: URL.
 */
export function useAuthenticatedBlobUrl(endpoint: string | undefined): {
  blobUrl: string | null
  loading: boolean
  error: boolean
} {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!endpoint)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!endpoint) {
      setBlobUrl(null)
      return
    }

    let cancelled = false
    let objectUrl: string | null = null
    setLoading(true)
    setError(false)

    const token = localStorage.getItem('auth_token')
    fetch(`${BASE_URL}${endpoint}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el archivo')
        return res.blob()
      })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [endpoint])

  return { blobUrl, loading, error }
}
