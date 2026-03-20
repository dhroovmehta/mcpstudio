import { describe, it, expect } from 'vitest'
import {
  createServerSchema,
  createToolSchema,
  updateServerSchema,
  updateToolSchema,
  checkoutSchema,
  testToolSchema,
  apiConfigSchema,
  sanitizeForCodeGen,
  validateServerNameForCodeGen,
} from '@/lib/validation'
import { fetchWithRetry } from '@/lib/utils'
import { checkRateLimit, type RateLimitConfig } from '@/lib/rate-limit'

// ---------------------------------------------------------------------------
// Security Headers (verified via next.config.js -- these test the config values)
// ---------------------------------------------------------------------------
describe('Security Headers: next.config.js', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nextConfig = require('../next.config.js')

  it('defines security headers for all routes', async () => {
    const headersConfig = await nextConfig.headers()
    expect(headersConfig).toHaveLength(1)
    expect(headersConfig[0].source).toBe('/(.*)')

    const headers = headersConfig[0].headers
    const headerMap = new Map(headers.map((h: { key: string; value: string }) => [h.key, h.value]))

    expect(headerMap.get('Strict-Transport-Security')).toContain('max-age=')
    expect(headerMap.get('Strict-Transport-Security')).toContain('includeSubDomains')
    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff')
    expect(headerMap.get('X-Frame-Options')).toBe('DENY')
    expect(headerMap.get('X-XSS-Protection')).toBe('1; mode=block')
    expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(headerMap.get('Permissions-Policy')).toContain('camera=()')
    expect(headerMap.get('Permissions-Policy')).toContain('microphone=()')
  })

  it('sets Content-Security-Policy with frame-ancestors none', async () => {
    const headersConfig = await nextConfig.headers()
    const headers = headersConfig[0].headers
    const csp = headers.find((h: { key: string }) => h.key === 'Content-Security-Policy')
    expect(csp).toBeDefined()
    expect(csp.value).toContain("default-src 'self'")
    expect(csp.value).toContain("frame-ancestors 'none'")
  })
})

// ---------------------------------------------------------------------------
// SSRF Protection
// ---------------------------------------------------------------------------
describe('Security: SSRF Protection', () => {
  const ssrfEndpoints = [
    'http://localhost:8080/api',
    'http://127.0.0.1/api',
    'http://0.0.0.0/api',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.0.0.1/internal',
    'http://192.168.1.1/admin',
    'http://172.16.0.1/secret',
  ]

  ssrfEndpoints.forEach((endpoint) => {
    it(`blocks SSRF attempt: ${endpoint}`, () => {
      const result = apiConfigSchema.safeParse({
        endpoint,
        method: 'GET',
        auth_type: 'none',
      })
      expect(result.success).toBe(false)
    })
  })

  it('allows legitimate public endpoints', () => {
    const result = apiConfigSchema.safeParse({
      endpoint: 'https://api.github.com/repos',
      method: 'GET',
      auth_type: 'bearer',
    })
    expect(result.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// XSS / Injection Prevention
// ---------------------------------------------------------------------------
describe('Security: XSS / Injection Prevention', () => {
  it('rejects script tags in server name', () => {
    const result = createServerSchema.safeParse({
      name: '<script>alert("xss")</script>',
    })
    expect(result.success).toBe(false)
  })

  it('rejects SQL-like injection in server name', () => {
    const result = createServerSchema.safeParse({
      name: "'; DROP TABLE servers; --",
    })
    expect(result.success).toBe(false)
  })

  it('rejects template injection in tool name', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: '{{constructor.constructor("return this")()}}',
    })
    expect(result.success).toBe(false)
  })

  it('sanitizes dangerous characters in descriptions for code gen', () => {
    const malicious = '"); import subprocess; subprocess.run(["id"])'
    const sanitized = sanitizeForCodeGen(malicious)
    expect(sanitized).toContain('\\"')
    expect(sanitized).not.toMatch(/^";\s*import/)
  })

  it('sanitizes template literal injection for code gen', () => {
    const malicious = '${process.env.SECRET}'
    const sanitized = sanitizeForCodeGen(malicious)
    expect(sanitized).toContain('\\$')
    expect(sanitized).not.toBe(malicious)
  })

  it('strips special chars from server names for code gen', () => {
    const result = validateServerNameForCodeGen('My Server"; run("pwn")')
    expect(result.safe).toBe(false)
    expect(result.sanitized).not.toContain('"')
    expect(result.sanitized).not.toContain('(')
  })
})

// ---------------------------------------------------------------------------
// Input Validation (Update Schemas)
// ---------------------------------------------------------------------------
describe('Security: Update Schema Validation', () => {
  it('updateServerSchema rejects empty update', () => {
    const result = updateServerSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('updateServerSchema accepts valid name update', () => {
    const result = updateServerSchema.safeParse({ name: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('updateServerSchema rejects invalid status', () => {
    const result = updateServerSchema.safeParse({ status: 'hacked' })
    expect(result.success).toBe(false)
  })

  it('updateServerSchema rejects XSS in name', () => {
    const result = updateServerSchema.safeParse({ name: '<img onerror=alert(1)>' })
    expect(result.success).toBe(false)
  })

  it('updateToolSchema rejects empty update', () => {
    const result = updateToolSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('updateToolSchema accepts valid name update', () => {
    const result = updateToolSchema.safeParse({ name: 'new_tool_name' })
    expect(result.success).toBe(true)
  })

  it('updateToolSchema rejects SSRF in api_config update', () => {
    const result = updateToolSchema.safeParse({
      api_config: {
        endpoint: 'http://169.254.169.254/latest/meta-data/',
        method: 'GET',
        auth_type: 'none',
      },
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// UUID Validation
// ---------------------------------------------------------------------------
describe('Security: UUID Parameter Validation', () => {
  it('rejects path traversal in server_id', () => {
    const result = createToolSchema.safeParse({
      server_id: '../../../etc/passwd',
      name: 'get_data',
    })
    expect(result.success).toBe(false)
  })

  it('rejects SQL injection in tool_id', () => {
    const result = testToolSchema.safeParse({
      tool_id: 'DROP TABLE tools',
    })
    expect(result.success).toBe(false)
  })

  it('strips extra fields via Zod (no prototype pollution)', () => {
    const result = checkoutSchema.safeParse({
      plan: 'professional',
      admin: true,
      role: 'superuser',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      // Zod strips unknown fields -- only plan and email survive
      expect(Object.keys(result.data)).not.toContain('admin')
      expect(Object.keys(result.data)).not.toContain('role')
    }
  })
})

// ---------------------------------------------------------------------------
// Rate Limiting
// ---------------------------------------------------------------------------
describe('Security: Rate Limiting', () => {
  let testCounter = 0
  function uniqueId() {
    return `security-test-${++testCounter}-${Date.now()}`
  }

  it('enforces limits on auth endpoints (10/min)', () => {
    const authConfig: RateLimitConfig = {
      name: `auth-sec-${Date.now()}-${testCounter++}`,
      maxRequests: 10,
      windowMs: 60_000,
    }
    const ip = uniqueId()

    for (let i = 0; i < 10; i++) {
      checkRateLimit(authConfig, ip)
    }

    const blocked = checkRateLimit(authConfig, ip)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('enforces limits on deploy endpoints (5/min)', () => {
    const deployConfig: RateLimitConfig = {
      name: `deploy-sec-${Date.now()}-${testCounter++}`,
      maxRequests: 5,
      windowMs: 60_000,
    }
    const ip = uniqueId()

    for (let i = 0; i < 5; i++) {
      checkRateLimit(deployConfig, ip)
    }

    const blocked = checkRateLimit(deployConfig, ip)
    expect(blocked.allowed).toBe(false)
  })

  it('isolates rate limit windows per IP', () => {
    const config: RateLimitConfig = {
      name: `isolation-${Date.now()}-${testCounter++}`,
      maxRequests: 2,
      windowMs: 60_000,
    }

    const ip1 = uniqueId()
    const ip2 = uniqueId()

    checkRateLimit(config, ip1)
    checkRateLimit(config, ip1)
    expect(checkRateLimit(config, ip1).allowed).toBe(false)
    expect(checkRateLimit(config, ip2).allowed).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Fetch with Retry (timeout + retry behavior)
// ---------------------------------------------------------------------------
describe('Security: fetchWithRetry', () => {
  it('is exported and callable', () => {
    expect(typeof fetchWithRetry).toBe('function')
  })

  it('rejects on timeout', async () => {
    // Use RFC 5737 TEST-NET address to guarantee no connection
    await expect(
      fetchWithRetry('http://192.0.2.1:1', {
        timeoutMs: 100,
        retries: 0,
        retryDelayMs: 0,
      })
    ).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Webhook Idempotency Pattern Verification
// ---------------------------------------------------------------------------
describe('Security: Webhook Idempotency', () => {
  it('stripe webhook route uses idempotency map', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const webhookSource = fs.readFileSync(
      path.resolve(__dirname, '../app/api/stripe/webhook/route.ts'),
      'utf-8'
    )
    expect(webhookSource).toContain('processedEvents')
    expect(webhookSource).toContain('processedEvents.has(event.id)')
    expect(webhookSource).toContain('processedEvents.set(event.id')
    expect(webhookSource).toContain('IDEMPOTENCY_TTL_MS')
  })
})

// ---------------------------------------------------------------------------
// Error Response Safety (no stack trace leakage)
// ---------------------------------------------------------------------------
describe('Security: Error Responses', () => {
  it('checkout schema rejects unknown plan values', () => {
    const result = checkoutSchema.safeParse({ plan: 'admin' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = result.error.issues[0].message
      expect(msg).not.toContain('stack')
      expect(msg).not.toContain('__dirname')
    }
  })

  it('validation errors are generic and safe', () => {
    const result = createToolSchema.safeParse({
      server_id: 'not-uuid',
      name: 'INVALID',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        expect(issue.message).not.toContain('node_modules')
        expect(issue.message).not.toContain('/Users/')
      })
    }
  })
})
