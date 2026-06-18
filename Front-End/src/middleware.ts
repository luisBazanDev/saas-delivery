import { defineMiddleware } from 'astro:middleware'

const BACKEND_URL = import.meta.env.API_URL || 'http://backend:3000'

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  if (!pathname.startsWith('/api/')) {
    return next()
  }

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

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  })
})
