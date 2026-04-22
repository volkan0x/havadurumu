const CACHE_STORE_KEY = '__havadurumu_server_cache__'
const PENDING_STORE_KEY = '__havadurumu_server_pending__'

const getCacheStore = () => {
  if (!globalThis[CACHE_STORE_KEY]) {
    globalThis[CACHE_STORE_KEY] = new Map()
  }

  return globalThis[CACHE_STORE_KEY]
}

const getPendingStore = () => {
  if (!globalThis[PENDING_STORE_KEY]) {
    globalThis[PENDING_STORE_KEY] = new Map()
  }

  return globalThis[PENDING_STORE_KEY]
}

const cleanupExpiredEntries = (cache) => {
  const now = Date.now()

  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(key)
    }
  }
}

export const getOrSetServerCache = async (key, ttlMs, resolver) => {
  const cache = getCacheStore()
  const pending = getPendingStore()
  const now = Date.now()
  const cached = cache.get(key)

  if (cached && cached.expiresAt > now) {
    return {
      data: cached.value,
      cacheHit: true
    }
  }

  if (pending.has(key)) {
    const value = await pending.get(key)
    return {
      data: value,
      cacheHit: false
    }
  }

  const promise = resolver()
    .then((value) => {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs
      })
      cleanupExpiredEntries(cache)
      return value
    })
    .finally(() => {
      pending.delete(key)
    })

  pending.set(key, promise)

  const data = await promise
  return {
    data,
    cacheHit: false
  }
}
