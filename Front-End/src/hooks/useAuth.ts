import { useState, useEffect, useCallback } from 'react'
import { isAuthenticated, removeToken, getToken, decodeToken, setUser, setTokenCookie, removeTokenCookie } from '../lib/auth'
import type { User } from '../lib/types'

export function useAuth() {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (name: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Error al iniciar sesión')
      }

      const data = await res.json()
      const token = data.bearerToken
      if (token) {
        localStorage.setItem('auth_token', token)
        setTokenCookie(token)
        const payload = decodeToken(token)
        if (payload) {
          const userData: User = {
            id: payload.sub,
            name: payload.name,
            role_name: payload.role_name,
            store_id: payload.store_id,
          }
          setUser(userData)
          setUserState(userData)
        }
      }
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    removeToken()
    removeTokenCookie()
    setUserState(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUserState(null)
      return
    }

    const token = getToken()
    if (token) {
      const payload = decodeToken(token)
      if (payload) {
        const userData: User = {
          id: payload.sub,
          name: payload.name,
          role_name: payload.role_name,
          store_id: payload.store_id,
        }
        setUser(userData)
        setUserState(userData)
      }
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated() && !user) {
      refreshUser()
    }
  }, [user, refreshUser])

  return { user, loading, login, logout, refreshUser }
}
