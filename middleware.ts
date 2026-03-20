import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limit state (in-memory, per-instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Clean expired entries every 60s
let lastCleanup = Date.now()
function cleanupIfNeeded() {
  const now = Date.now()
  if (now - lastCleanup > 60_000) {
    lastCleanup = now
    rateLimitStore.forEach((entry, key) => {
      if (now > entry.resetAt) rateLimitStore.delete(key)
    })
  }
}

function checkLimit(key: string, max: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupIfNeeded()
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt }
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  )
}

// Route-specific rate limits
function getRateLimit(pathname: string): { max: number; windowMs: number } | null {
  // Webhooks are exempt from rate limiting
  if (pathname.startsWith('/api/stripe/webhook')) return null

  // Auth endpoints: 10 req/min
  if (pathname.startsWith('/api/auth')) return { max: 10, windowMs: 60_000 }

  // Deploy endpoint: 5 req/min
  if (pathname.startsWith('/api/deploy')) return { max: 5, windowMs: 60_000 }

  // All other API endpoints: 60 req/min
  if (pathname.startsWith('/api/')) return { max: 60, windowMs: 60_000 }

  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CORS: same-origin only for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // Allow requests with no origin (server-to-server, curl, etc.)
    // Block cross-origin browser requests
    if (origin) {
      try {
        const originUrl = new URL(origin)
        const expectedHost = host?.split(':')[0]
        const originHost = originUrl.hostname

        // Allow same-origin and localhost in dev
        const isSameOrigin = originHost === expectedHost
        const isLocalDev =
          originHost === 'localhost' || originHost === '127.0.0.1'

        if (!isSameOrigin && !isLocalDev) {
          return new NextResponse(
            JSON.stringify({ error: 'CORS: Origin not allowed' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      } catch {
        // Invalid origin header, block it
        return new NextResponse(
          JSON.stringify({ error: 'CORS: Invalid origin' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Reject CORS preflight — same-origin API doesn't need it
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204 })
    }
  }

  // Rate limiting
  const rateLimit = getRateLimit(pathname)
  if (rateLimit) {
    const ip = getIP(request)
    const key = `${pathname.split('/').slice(0, 3).join('/')}:${ip}`
    const result = checkLimit(key, rateLimit.max, rateLimit.windowMs)

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          retry_after_seconds: retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(rateLimit.max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
          },
        }
      )
    }

    // Add rate limit headers to response
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(rateLimit.max))
    response.headers.set('X-RateLimit-Remaining', String(result.remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
