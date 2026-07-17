import type { APIRoute } from 'astro'

const BACKEND_URL = import.meta.env.API_URL || 'http://localhost:3000/api'

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path
  const targetUrl = `${BACKEND_URL}/${path}${new URL(request.url).search}`

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  console.log(`[PROXY] ${request.method} /api/${path} -> ${targetUrl}`)
  console.log(`[PROXY] params.path: "${path}"`)
  console.log(`[PROXY] BACKEND_URL: "${BACKEND_URL}"`)

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('content-length')

  const authHeader = headers.get('authorization')
  console.log(`[PROXY] Auth header: ${authHeader ? 'present' : 'missing'}`)
  if (authHeader) {
    console.log(`[PROXY] Auth header value (first 30 chars): ${authHeader.substring(0, 30)}...`)
  }

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.text()
    : undefined

  console.log(`[PROXY] Body: ${body?.substring(0, 200) || 'none'}`)

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    })

    console.log(`[PROXY] Backend response status: ${res.status}`)

    if (!res.ok) {
      const errorBody = await res.text()
      console.log(`[PROXY] Backend error body: ${errorBody.substring(0, 500)}`)
      return new Response(errorBody, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      })
    }

    const responseHeaders = new Headers(res.headers)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('transfer-encoding')

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error(`[PROXY] Fetch error:`, err)
    return new Response(JSON.stringify({ error: 'Backend unreachable', details: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const GET = ALL
export const POST = ALL
export const PUT = ALL
export const DELETE = ALL
export const PATCH = ALL
