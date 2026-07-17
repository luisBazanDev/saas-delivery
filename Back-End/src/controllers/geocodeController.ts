import { Request, Response } from 'express'

const CACHE_TTL = 3600000 // 1 hour
const cache = new Map<string, { data: any; expires: number }>()

let lastNominatimRequest = 0
const NOMINATIM_MIN_INTERVAL = 1000 // 1 second

function getCache(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL })
}

async function rateLimitedFetch(url: string): Promise<globalThis.Response> {
  const now = Date.now()
  const waitTime = NOMINATIM_MIN_INTERVAL - (now - lastNominatimRequest)
  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
  lastNominatimRequest = Date.now()
  return fetch(url, {
    headers: {
      'User-Agent': 'HXDelivery/1.0 (admin@hxdelivery.com)',
    },
  })
}

export async function searchPlace(req: Request, res: Response) {
  const { q, limit = 5 } = req.query
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' })
  }

  const cacheKey = `search:${q}:${limit}`
  const cached = getCache(cacheKey)
  if (cached) {
    return res.json(cached)
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Chiclayo, Peru')}&limit=${limit}&addressdetails=1`
    const response = await rateLimitedFetch(url)
    const data = await response.json()
    setCache(cacheKey, data)
    return res.json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Geocoding service unavailable' })
  }
}

export async function reverseGeocode(req: Request, res: Response) {
  const { lat, lon } = req.query
  if (!lat || !lon || typeof lat !== 'string' || typeof lon !== 'string') {
    return res.status(400).json({ error: 'Query parameters "lat" and "lon" are required' })
  }

  const cacheKey = `reverse:${lat}:${lon}`
  const cached = getCache(cacheKey)
  if (cached) {
    return res.json(cached)
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    const response = await rateLimitedFetch(url)
    const data = await response.json()
    setCache(cacheKey, data)
    return res.json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Geocoding service unavailable' })
  }
}
