import { useState, useEffect, useCallback } from 'react'
import { isAuthenticated, removeToken } from '../lib/auth'
import { api } from '../lib/api'
import type { AuthResponse, User } from '../lib/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/login', { username, password })
      const token = res.bearerToken || res.token
      if (token) {
        localStorage.setItem('auth_token', token)
        setUser({
          id: res.id || 0,
          username: res.username || username,
          role: res.role || 'STORE_ADMIN',
        })
      }
      return res
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  useEffect(() => {
    if (isAuthenticated()) {
      // TODO: fetch user profile from backend
    }
  }, [])

  return { user, loading, login, logout }
}
