import { defineMiddleware } from 'astro:middleware'

const BACKEND_URL = import.meta.env.API_URL || 'http://backend:3000'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  if (pathname.startsWith('/api/')) {
    const targetUrl = `${BACKEND_URL}${pathname}${context.url.search}`

    const headers = new Headers(context.request.headers)
    headers.delete('host')

    const res = await fetch(targetUrl, {
      method: context.request.method,
      headers,
      body: context.request.method !== 'GET' && context.request.method !== 'HEAD'
        ? context.request.body
        : undefined,
      duplex: 'half',
    } as RequestInit)

    const responseHeaders = new Headers(res.headers)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('transfer-encoding')

    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      responseHeaders.set(key, value)
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    })
  }

  const response = await next()

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  return response
})
