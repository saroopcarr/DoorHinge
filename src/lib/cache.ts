// src/lib/cache.ts
// Purpose: Redis caching layer for high-traffic data
// Enables horizontal scaling by reducing database load on hot properties

import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient> | null = null

/**
 * Get or create Redis connection singleton
 * In production, this reduces database queries for frequently-accessed properties
 */
export async function getRedisClient() {
  if (redisClient) {
    return redisClient
  }

  // Return mock cache if Redis not available (dev fallback)
  if (!process.env.REDIS_URL) {
    console.warn('⚠️  REDIS_URL not set - using in-memory cache (not production-safe)')
    return createMockRedis()
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    })

    redisClient.on('error', (err) => {
      console.error('Redis error:', err)
      redisClient = null
    })

    await redisClient.connect()
    console.log('✅ Connected to Redis')
    return redisClient
  } catch (error) {
    console.warn('Redis connection failed:', error)
    return createMockRedis()
  }
}

/**
 * Mock Redis for development (in-memory, not suitable for production)
 * In production, use real Redis to enable horizontal scaling
 */
function createMockRedis() {
  const store = new Map<string, { value: string; expiresAt: number }>()

  return {
    get: async (key: string) => {
      const entry = store.get(key)
      if (!entry) return null
      if (Date.now() > entry.expiresAt) {
        store.delete(key)
        return null
      }
      return entry.value
    },
    setEx: async (key: string, seconds: number, value: string) => {
      const expiresAt = Date.now() + seconds * 1000
      store.set(key, { value, expiresAt })
      return 'OK'
    },
    del: async (...keys: string[]) => {
      let count = 0
      keys.forEach((key) => {
        if (store.delete(key)) count++
      })
      return count
    },
    flushAll: async () => {
      store.clear()
      return 'OK'
    },
  }
}

/**
 * Cache helper: get cached value or fetch from function
 * Pattern: Check cache → if miss, execute function → store result → return
 */
export async function cacheWithTTL<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const redis = await getRedisClient()

  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
  } catch (error) {
    console.error('Cache get error:', error)
  }

  const result = await fetchFn()

  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(result))
  } catch (error) {
    console.error('Cache set error:', error)
  }

  return result
}

/**
 * Invalidate cache entries (called when data changes)
 * Critical for consistency: when a property is updated, clear its cache
 */
export async function invalidateCache(...keys: string[]) {
  const redis = await getRedisClient()
  try {
    await redis.del(...keys)
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

/**
 * Cache key generators for consistency
 */
export const cacheKeys = {
  property: (id: string) => `property:${id}`,
  propertyList: (area?: string) => `properties:list:${area || 'all'}`,
  user: (id: string) => `user:${id}`,
  profile: (userId: string) => `profile:${userId}`,
}
