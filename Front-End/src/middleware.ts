import { defineMiddleware } from 'astro:middleware'
import { decodeToken } from './lib/auth'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

const PUBLIC_PATHS = ['/login', '/api', '/favicon.ico']

function getTokenFromRequest(context: any): string | null {
  const cookieHeader = context.request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.split('; ').find((row: string) => row.startsWith('auth_token='))
  return tokenMatch ? tokenMatch.split('=')[1] : null
}

function isTokenValid(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload) return false
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < now) return false
  return true
}

function getRedirectForLoggedInUser(payload: any): string | null {
  if (payload.role_name === 'ADMIN') {
    return '/admin/stores'
  }
  if (payload.role_name === 'STORE_ADMIN') {
    return '/stores'
  }
  if (payload.role_name === 'STORE_CHEF' && payload.store_id) {
    return `/store/${payload.store_id}/kitchen`
  }
  if (payload.role_name === 'STORE_DELIVERY' && payload.store_id) {
    return `/store/${payload.store_id}/delivery`
  }
  if (payload.store_id) {
    return `/store/${payload.store_id}/orders`
  }
  return null
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url
  const token = getTokenFromRequest(context)
  const isLoggedIn = token && isTokenValid(token)
  const payload = isLoggedIn ? decodeToken(token) : null

  if (pathname === '/login' && isLoggedIn && payload) {
    const redirect = getRedirectForLoggedInUser(payload)
    if (redirect) {
      return context.redirect(redirect)
    }
    const response = await next()
    response.headers.append('set-cookie', 'auth_token=; path=/; max-age=0; SameSite=Lax')
    return response
  }

  if (pathname === '/' && isLoggedIn && payload) {
    const redirect = getRedirectForLoggedInUser(payload)
    if (redirect) {
      return context.redirect(redirect)
    }
    return context.redirect('/login')
  }

  const storeMatch = pathname.match(/^\/store\/(\d+)\/(.+)/)
  if (storeMatch) {
    const urlStoreId = storeMatch[1]
    const subPath = storeMatch[2]

    if (!isLoggedIn) {
      return context.redirect('/login')
    }

    if (payload && !payload.store_id && payload.role_name !== 'ADMIN') {
      const response = context.redirect('/login')
      response.headers.append('set-cookie', 'auth_token=; path=/; max-age=0; SameSite=Lax')
      return response
    }

    if (payload && payload.store_id && String(payload.store_id) !== urlStoreId) {
      return context.redirect(`/store/${payload.store_id}/orders`)
    }

    if (payload && payload.role_name === 'STORE_CHEF' && subPath !== 'kitchen') {
      return context.redirect(`/store/${payload.store_id}/kitchen`)
    }

    if (payload && payload.role_name === 'STORE_DELIVERY' && subPath !== 'delivery') {
      return context.redirect(`/store/${payload.store_id}/delivery`)
    }
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (!isPublic) {
    if (!token) {
      return context.redirect('/login')
    }

    if (!isTokenValid(token)) {
      return context.redirect('/login')
    }
  }

  const response = await next()

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  return response
})
