// Simple in-memory rate limiter for Next.js API routes
// Uses a sliding window approach with IP-based tracking

interface RateLimitEntry {
  count: number
  resetAt: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map())
  }
  return stores.get(name)!
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  stores.forEach((store) => {
    store.forEach((entry, key) => {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    })
  })
}, 60_000) // every minute

export interface RateLimitConfig {
  name: string        // identifier for this limiter (e.g., 'api', 'auth', 'deploy')
  maxRequests: number // max requests per window
  windowMs: number    // window duration in milliseconds
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(config: RateLimitConfig, identifier: string): RateLimitResult {
  const store = getStore(config.name)
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(identifier, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs }
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

// Pre-configured limiters
export const RATE_LIMITS = {
  api: { name: 'api', maxRequests: 60, windowMs: 60_000 } as RateLimitConfig,           // 60/min
  auth: { name: 'auth', maxRequests: 10, windowMs: 60_000 } as RateLimitConfig,          // 10/min
  deploy: { name: 'deploy', maxRequests: 5, windowMs: 60_000 } as RateLimitConfig,       // 5/min
} as const

// Extract client IP from request headers
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Helper to apply rate limiting and return 429 response if exceeded
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig
): { blocked: true; response: Response } | { blocked: false } {
  const ip = getClientIP(request)
  const result = checkRateLimit(config, ip)

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
    return {
      blocked: true,
      response: new Response(
        JSON.stringify({
          error: 'Too many requests',
          retry_after_seconds: retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
          },
        }
      ),
    }
  }

  return { blocked: false }
}
