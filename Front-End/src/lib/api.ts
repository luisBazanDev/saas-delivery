import { getToken, removeToken, removeTokenCookie } from './auth'

const API_BASE = typeof window === 'undefined'
  ? (import.meta.env.API_URL || 'http://localhost:3000/api')
  : (import.meta.env.PUBLIC_API_URL || '/api')

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401) {
      removeToken()
      removeTokenCookie()
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
      throw new Error('unauthorized')
    }
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
