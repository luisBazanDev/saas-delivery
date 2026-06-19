import { useState, useEffect, useCallback } from 'react'
import { isAuthenticated, removeToken, getToken, decodeToken, setUser, getUser, setTokenCookie, removeTokenCookie } from '../lib/auth'
import { api } from '../lib/api'
import type { AuthResponse, User } from '../lib/types'

export function useAuth() {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/login', { username, password })
      const token = res.bearerToken || res.token
      if (token) {
        localStorage.setItem('auth_token', token)
        setTokenCookie(token)
        const payload = decodeToken(token)
        if (payload) {
          const userData: User = {
            id: res.id || payload.sub,
            username: res.username || payload.username || username,
            role: res.role || payload.role,
            store_id: res.store_id || payload.store_id,
          }
          setUser(userData)
          setUserState(userData)
        }
      }
      return res
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
          username: payload.username,
          role: payload.role,
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
