import type { APIRoute } from 'astro'

const BACKEND_URL = import.meta.env.API_URL || 'http://backend:3000'

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path
  const targetUrl = `${BACKEND_URL}/${path}${new URL(request.url).search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.text()
    : undefined

  const res = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  })

  const responseHeaders = new Headers(res.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('transfer-encoding')

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  })
}

export const GET = ALL
export const POST = ALL
export const PUT = ALL
export const DELETE = ALL
export const PATCH = ALL
