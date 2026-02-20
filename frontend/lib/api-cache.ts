const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: unknown
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

export async function cachedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const hit = cache.get(url)
  if (hit && hit.expiresAt > now) {
    return new Response(JSON.stringify(hit.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
  const res = await fetch(url)
  if (res.ok) {
    const data = await res.json()
    cache.set(url, { data, expiresAt: now + CACHE_TTL_MS })
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
  return res // pass through error responses uncached
}
