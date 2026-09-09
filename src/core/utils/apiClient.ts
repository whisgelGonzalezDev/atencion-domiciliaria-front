import { enqueueAction } from '@/core/offline/queue'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class OfflineQueuedError extends Error {
  constructor(message = 'Sin conexión: la acción se guardó y se sincronizará automáticamente.') {
    super(message)
    this.name = 'OfflineQueuedError'
  }
}

export class OfflineNoCacheError extends Error {
  constructor(message = 'Sin conexión y no hay datos guardados para esta vista.') {
    super(message)
    this.name = 'OfflineNoCacheError'
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: string
  params?: Record<string, string | number | boolean>
  /** Human-readable label shown while this action is queued offline. */
  offlineDescription?: string
}

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

function buildUrl(endpoint: string, params?: RequestOptions['params']): URL {
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  return url
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const errJson = await response.json()
    const raw = errJson?.error?.message ?? errJson?.message ?? response.statusText
    // Preserve array payloads (e.g. NestJS validation errors) as JSON strings
    return typeof raw === 'string' ? raw : JSON.stringify(raw)
  } catch {
    return response.statusText
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, headers = {}, offlineDescription, method = 'GET', ...rest } = options
  const url = buildUrl(endpoint, params)
  const token = localStorage.getItem('auth_token')
  const isMutating = method !== 'GET'

  let response: Response
  try {
    response = await fetch(url.toString(), {
      ...rest,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers as Record<string, string>),
      },
      body,
    })
  } catch {
    if (isMutating && (method === 'POST' || method === 'PATCH' || method === 'DELETE')) {
      await enqueueAction({
        method,
        endpoint: endpoint + url.search,
        body,
        description: offlineDescription ?? endpoint,
      })
      throw new OfflineQueuedError()
    }
    throw new OfflineNoCacheError()
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  const json = await response.json()
  return (json as { data: T }).data
}
