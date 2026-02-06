/**
 * Memory-Based Rate Limiter
 *
 * Production-ready rate limiting for serverless environments.
 *
 * Implementation Notes:
 * - Uses in-memory storage (suitable for single-instance or short-lived functions)
 * - Sliding window algorithm for smooth rate limiting
 * - Configurable per-route limits
 * - Automatic cleanup of expired entries
 *
 * Serverless Consideration:
 * Each serverless instance has its own memory, so rate limiting is per-instance.
 * For strict global rate limiting, use Redis (e.g., Upstash Redis).
 * However, memory-based limiting still provides protection against:
 * - Burst attacks on a single instance
 * - Accidental infinite loops
 * - Basic abuse prevention
 *
 * Future: Add Redis adapter for distributed rate limiting
 */

import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Configuration defaults
const DEFAULT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'); // 1 minute
const DEFAULT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

// In-memory store for rate limiting (fallback)
// Key: identifier (IP or user ID), Value: array of request timestamps
const requestStore = new Map<string, number[]>();

// Optional Upstash Redis (global rate limiting across serverless instances)
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  upstashUrl && upstashToken
    ? new Redis({
        url: upstashUrl,
        token: upstashToken,
      })
    : null;

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60000; // 1 minute
let lastCleanup = Date.now();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp when window resets
  retryAfterMs?: number; // Milliseconds until next allowed request
}

/**
 * Get client identifier from request
 *
 * Priority:
 * 1. X-Forwarded-For header (for proxied requests)
 * 2. X-Real-IP header
 * 3. Connection remote address
 * 4. Fallback to 'anonymous'
 */
function getClientIdentifier(request: NextRequest): string {
  // Check forwarded headers (Netlify, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP in the chain (original client)
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback for development or missing headers
  return 'anonymous';
}

/**
 * Clean up expired entries from the store
 * Called periodically to prevent memory leaks
 */
function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now();

  // Only cleanup once per interval
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;
  const cutoff = now - windowMs;

  // Convert to array to avoid iterator compatibility issues
  const entries = Array.from(requestStore.entries());
  for (const [key, timestamps] of entries) {
    // Filter out expired timestamps
    const valid = timestamps.filter((ts) => ts > cutoff);

    if (valid.length === 0) {
      requestStore.delete(key);
    } else if (valid.length !== timestamps.length) {
      requestStore.set(key, valid);
    }
  }
}

/**
 * Check rate limit for a request
 *
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const {
    windowMs = DEFAULT_WINDOW_MS,
    maxRequests = DEFAULT_MAX_REQUESTS,
    keyGenerator = getClientIdentifier,
  } = config;

  const now = Date.now();
  const key = keyGenerator(request);
  const windowStart = now - windowMs;

  // Redis-backed rate limiting when available
  if (redis) {
    const bucket = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${bucket}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.pexpire(redisKey, windowMs);
    }

    const remaining = Math.max(0, maxRequests - count);
    const resetAt = (bucket + 1) * windowMs;

    if (count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfterMs: Math.max(0, resetAt - now),
      };
    }

    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  // Run cleanup periodically (memory fallback)
  cleanupExpiredEntries(windowMs);

  // Get existing timestamps for this key
  const timestamps = requestStore.get(key) || [];

  // Filter to only include requests within the current window
  const validTimestamps = timestamps.filter((ts) => ts > windowStart);

  // Calculate remaining requests
  const remaining = Math.max(0, maxRequests - validTimestamps.length);
  const resetAt = Math.ceil((validTimestamps[0] || now) + windowMs);

  if (validTimestamps.length >= maxRequests) {
    // Rate limited
    const oldestInWindow = validTimestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  // Add current request timestamp
  validTimestamps.push(now);
  requestStore.set(key, validTimestamps);

  return {
    allowed: true,
    remaining: remaining - 1,
    resetAt,
  };
}

/**
 * Rate limit middleware for API routes
 *
 * Usage:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const rateLimit = await rateLimitMiddleware(request, {
 *     maxRequests: 10,
 *     windowMs: 60000,
 *   });
 *
 *   if (rateLimit.response) {
 *     return rateLimit.response;
 *   }
 *
 *   // Continue with request handling...
 * }
 * ```
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config?: RateLimitConfig
): Promise<{ response: Response | null; result: RateLimitResult }> {
  const result = await checkRateLimit(request, config);

  if (!result.allowed) {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfterMs: result.retryAfterMs,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.retryAfterMs || 0) / 1000)),
          'X-RateLimit-Limit': String(config?.maxRequests || DEFAULT_MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt),
        },
      }
    );

    return { response, result };
  }

  return { response: null, result };
}

/**
 * Preset rate limit configurations for different route types
 */
export const rateLimitPresets = {
  // Strict limit for auth endpoints (prevent brute force)
  auth: {
    windowMs: 900000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 min
  },

  // Moderate limit for write operations
  write: {
    windowMs: 60000, // 1 minute
    maxRequests: 30, // 30 writes per minute
  },

  // Relaxed limit for read operations
  read: {
    windowMs: 60000, // 1 minute
    maxRequests: 100, // 100 reads per minute
  },

  // Very strict for upload operations
  upload: {
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
  },

  // Contact form submissions
  contact: {
    windowMs: 3600000, // 1 hour
    maxRequests: 5, // 5 submissions per hour
  },

  // Comment submissions
  comment: {
    windowMs: 60000, // 1 minute
    maxRequests: 3, // 3 comments per minute
  },
} as const;

export type RateLimitPreset = keyof typeof rateLimitPresets;
