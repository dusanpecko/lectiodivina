/**
 * Rate Limiting Configuration using Upstash Redis
 * 
 * Protects against:
 * - DDoS attacks
 * - Cost explosion from OpenAI API abuse
 * - Service disruption from rapid credit depletion
 * 
 * Setup:
 * 1. Create free account at https://upstash.com
 * 2. Create Redis database
 * 3. Add to .env.local:
 *    UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
 *    UPSTASH_REDIS_REST_TOKEN=your-token
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * API Rate Limiter (General endpoints)
 * 100 requests per minute per IP/user
 */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});

/**
 * AI Rate Limiter (AI generation endpoints)
 * 10 requests per hour per user
 * 
 * Conservative limit to protect €15 OpenAI credit:
 * - Each article generation = ~$0.50-1.00
 * - 10 articles/hour = max $10/hour
 * - With 8 languages planned = need strict limits
 */
export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "ratelimit:ai",
});

/**
 * Admin Rate Limiter
 * 500 requests per minute
 */
export const adminLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(500, "1 m"),
  analytics: true,
  prefix: "ratelimit:admin",
});

/**
 * Daily AI Article Limiter
 * 10 articles per day per user
 * 
 * NOTE: Each article is generated in multiple languages (planned: 8)
 * So 10 articles = 80 API calls total
 */
export const dailyAILimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "24 h"),
  analytics: true,
  prefix: "ratelimit:daily-ai",
});

/**
 * Helper function to get identifier from request
 * Prefers user ID, falls back to IP address
 */
export function getIdentifier(userId?: string, ip?: string): string {
  return userId || ip || "anonymous";
}

/**
 * Helper to format rate limit error response
 */
export function rateLimitError(limit: number, reset: number, remaining: number) {
  const resetDate = new Date(reset);
  const resetIn = Math.ceil((reset - Date.now()) / 1000 / 60); // minutes
  
  return {
    error: "Rate limit exceeded",
    message: `You have exceeded the rate limit. Please try again in ${resetIn} minutes.`,
    limit,
    remaining,
    reset: resetDate.toISOString(),
    resetIn: `${resetIn} minutes`,
  };
}
