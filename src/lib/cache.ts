/**
 * Redis Cache Layer using Upstash Redis
 * 
 * Uses the same Redis instance as rate limiting for cost efficiency.
 * 
 * Benefits:
 * - 10-100x faster reads (in-memory vs database)
 * - Reduced database load
 * - Lower Supabase costs
 * - Better user experience
 * 
 * Cache Strategy:
 * - Static data (categories, translations): 1 hour TTL
 * - Semi-static (lectio sources, calendar): 15 minutes TTL
 * - Dynamic (news, articles): 5 minutes TTL
 * - User profiles: 5 minutes TTL
 */

import { Redis } from "@upstash/redis";

// Reuse the same Redis instance as rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  STATIC: 3600,      // 1 hour - categories, translations, locales
  SEMI_STATIC: 900,  // 15 minutes - lectio sources, calendar info
  DYNAMIC: 300,      // 5 minutes - news, articles, daily quotes
  USER: 300,         // 5 minutes - user profiles
  SHORT: 60,         // 1 minute - frequently changing data
} as const;

/**
 * Cache key prefixes for organization
 */
export const CACHE_PREFIX = {
  NEWS: "cache:news",
  ARTICLES: "cache:articles",
  LECTIO: "cache:lectio",
  SOURCES: "cache:sources",
  CALENDAR: "cache:calendar",
  QUOTES: "cache:quotes",
  CATEGORIES: "cache:categories",
  USER: "cache:user",
  PROFILE: "cache:profile",
  TRANSLATIONS: "cache:translations",
  LOCALES: "cache:locales",
} as const;

/**
 * Get cached value
 * Returns null if not found or expired
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<T>(key);
    
    if (value === null) {
      console.log(`[Cache MISS] ${key}`);
      return null;
    }
    
    console.log(`[Cache HIT] ${key}`);
    return value;
  } catch (error) {
    console.error(`[Cache ERROR] Failed to get ${key}:`, error);
    return null; // Fail gracefully
  }
}

/**
 * Set cached value with TTL
 * @param key Cache key
 * @param value Value to cache (will be JSON serialized)
 * @param ttl Time to live in seconds (default: 5 minutes)
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.DYNAMIC
): Promise<void> {
  try {
    await redis.setex(key, ttl, value);
    console.log(`[Cache SET] ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`[Cache ERROR] Failed to set ${key}:`, error);
    // Don't throw - caching failure shouldn't break the app
  }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key);
    console.log(`[Cache DELETE] ${key}`);
  } catch (error) {
    console.error(`[Cache ERROR] Failed to delete ${key}:`, error);
  }
}

/**
 * Invalidate cache by pattern
 * @param pattern Glob pattern (e.g., "cache:news:*")
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      console.log(`[Cache INVALIDATE] No keys found for pattern: ${pattern}`);
      return 0;
    }
    
    await redis.del(...keys);
    console.log(`[Cache INVALIDATE] Deleted ${keys.length} keys matching: ${pattern}`);
    return keys.length;
  } catch (error) {
    console.error(`[Cache ERROR] Failed to invalidate pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Helper: Cache wrapper for database queries
 * Automatically caches the result of a function
 * 
 * @example
 * const news = await cacheQuery(
 *   "cache:news:all",
 *   () => supabase.from("news").select("*"),
 *   CACHE_TTL.DYNAMIC
 * );
 */
export async function cacheQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL.DYNAMIC
): Promise<T> {
  // Try to get from cache first
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Cache miss - execute query
  const result = await queryFn();
  
  // Cache the result (fire and forget)
  setCached(key, result, ttl).catch((err) => {
    console.error(`[Cache ERROR] Failed to cache ${key}:`, err);
  });
  
  return result;
}

/**
 * Helper: Invalidate all cache keys for a resource type
 * 
 * @example
 * await invalidateResource("news"); // Deletes cache:news:*
 */
export async function invalidateResource(resource: keyof typeof CACHE_PREFIX): Promise<number> {
  const prefix = CACHE_PREFIX[resource];
  return invalidateCache(`${prefix}:*`);
}

/**
 * Get cache statistics (useful for monitoring)
 */
export async function getCacheStats() {
  try {
    // Simple connectivity check
    await redis.ping();
    return {
      connected: true,
      message: "Redis connected successfully",
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Warm cache for frequently accessed data
 * Call this on server startup or via cron job
 */
export async function warmCache() {
  console.log("[Cache] Warming cache...");
  
  // This is a placeholder - you'll implement specific warming logic
  // For example:
  // - Cache all active news
  // - Cache current month calendar
  // - Cache article categories
  
  console.log("[Cache] Cache warming complete");
}
