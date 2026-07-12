import type { UserRole, DecodedToken } from './types'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const LAST_ACTIVITY_KEY = 'last_activity'
const SESSION_TIMEOUT = 30 * 60 * 1000
const COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 60 * 60

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function setTokenCookie(token: string): void {
  if (!isBrowser()) return
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function getTokenCookie(): string | null {
  if (!isBrowser()) return null
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE_NAME}=`))
  return match ? match.split('=')[1] : null
}

export function removeTokenCookie(): void {
  if (!isBrowser()) return
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function getToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (!isBrowser()) return
  localStorage.setItem(TOKEN_KEY, token)
  updateLastActivity()
}

export function removeToken(): void {
  if (!isBrowser()) return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(LAST_ACTIVITY_KEY)
}

export function getUser(): { id: number; username: string; role: UserRole; store_id?: number } | null {
  if (!isBrowser()) return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function setUser(user: { id: number; username: string; role: UserRole; store_id?: number }): void {
  if (!isBrowser()) return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  updateLastActivity()
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  const payload = decodeToken(token)
  if (!payload) return false
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < now) {
    removeToken()
    return false
  }
  return true
}

export function hasRole(requiredRole: string): boolean {
  const user = getUser()
  if (!user) return false
    const roleHierarchy: Record<UserRole, number> = {
      ADMIN: 100,
      STORE_ADMIN: 50,
      STORE_MANAGER: 30,
      STORE_CHEF: 20,
      STORE_DELIVERY: 10,
    }
  const userLevel = roleHierarchy[user.role] || 0
  const requiredLevel = roleHierarchy[requiredRole as UserRole] || 0
  return userLevel >= requiredLevel
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function updateLastActivity(): void {
  if (!isBrowser()) return
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
}

export function isSessionExpired(): boolean {
  if (!isBrowser()) return false
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
  if (!lastActivity) return false
  return Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT
}

export function checkSession(): boolean {
  if (!isBrowser()) return false
  if (isSessionExpired()) {
    removeToken()
    return false
  }
  updateLastActivity()
  return true
}
