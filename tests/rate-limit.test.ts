import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, type RateLimitConfig } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  const config: RateLimitConfig = {
    name: 'test-limiter',
    maxRequests: 3,
    windowMs: 60_000,
  }

  // Use unique identifiers per test to avoid cross-test contamination
  let testId = 0
  function uniqueId() {
    return `test-ip-${++testId}-${Date.now()}`
  }

  it('allows requests under the limit', () => {
    const ip = uniqueId()
    const result = checkRateLimit(config, ip)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('tracks request count', () => {
    const ip = uniqueId()
    checkRateLimit(config, ip) // 1
    checkRateLimit(config, ip) // 2
    const result = checkRateLimit(config, ip) // 3
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(0)
  })

  it('blocks when limit is exceeded', () => {
    const ip = uniqueId()
    checkRateLimit(config, ip) // 1
    checkRateLimit(config, ip) // 2
    checkRateLimit(config, ip) // 3
    const result = checkRateLimit(config, ip) // 4 — blocked
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('tracks different IPs independently', () => {
    const ip1 = uniqueId()
    const ip2 = uniqueId()
    checkRateLimit(config, ip1) // ip1: 1
    checkRateLimit(config, ip1) // ip1: 2
    checkRateLimit(config, ip1) // ip1: 3
    const blocked = checkRateLimit(config, ip1) // ip1: blocked
    expect(blocked.allowed).toBe(false)

    const allowed = checkRateLimit(config, ip2) // ip2: 1
    expect(allowed.allowed).toBe(true)
  })

  it('provides resetAt timestamp', () => {
    const ip = uniqueId()
    const before = Date.now()
    const result = checkRateLimit(config, ip)
    expect(result.resetAt).toBeGreaterThanOrEqual(before + config.windowMs)
  })

  it('different limiter names are independent', () => {
    const ip = uniqueId()
    const configA: RateLimitConfig = { name: `limiter-a-${testId}`, maxRequests: 1, windowMs: 60_000 }
    const configB: RateLimitConfig = { name: `limiter-b-${testId}`, maxRequests: 1, windowMs: 60_000 }

    checkRateLimit(configA, ip) // A: 1
    const blockedA = checkRateLimit(configA, ip) // A: blocked
    expect(blockedA.allowed).toBe(false)

    const allowedB = checkRateLimit(configB, ip) // B: 1
    expect(allowedB.allowed).toBe(true)
  })
})
