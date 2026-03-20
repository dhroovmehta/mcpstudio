import { describe, it, expect } from 'vitest'
import {
  createServerSchema,
  createToolSchema,
  generateCodeSchema,
  deploySchema,
  testToolSchema,
  checkoutSchema,
  sanitizeForCodeGen,
  validateServerNameForCodeGen,
  validateDescriptionForCodeGen,
  apiConfigSchema,
} from '@/lib/validation'

describe('createServerSchema', () => {
  it('accepts valid server name', () => {
    const result = createServerSchema.safeParse({ name: 'My Weather Server' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createServerSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name with special characters', () => {
    const result = createServerSchema.safeParse({ name: '<script>alert(1)</script>' })
    expect(result.success).toBe(false)
  })

  it('rejects name over 100 characters', () => {
    const result = createServerSchema.safeParse({ name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('accepts optional description', () => {
    const result = createServerSchema.safeParse({ name: 'Server1', description: 'A test server' })
    expect(result.success).toBe(true)
  })

  it('accepts null description', () => {
    const result = createServerSchema.safeParse({ name: 'Server1', description: null })
    expect(result.success).toBe(true)
  })
})

describe('createToolSchema', () => {
  it('accepts valid tool creation payload', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'get_weather',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-UUID server_id', () => {
    const result = createToolSchema.safeParse({ server_id: 'not-a-uuid', name: 'get_weather' })
    expect(result.success).toBe(false)
  })

  it('rejects tool name with uppercase', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'GetWeather',
    })
    expect(result.success).toBe(false)
  })

  it('rejects tool name starting with number', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: '1get_weather',
    })
    expect(result.success).toBe(false)
  })

  it('validates API config endpoint URL', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'get_weather',
      api_config: {
        endpoint: 'not-a-url',
        method: 'GET',
        auth_type: 'none',
      },
    })
    expect(result.success).toBe(false)
  })

  it('blocks private IP endpoints (SSRF)', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'get_weather',
      api_config: {
        endpoint: 'http://192.168.1.1/api',
        method: 'GET',
        auth_type: 'none',
      },
    })
    expect(result.success).toBe(false)
  })

  it('blocks localhost endpoints', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'get_weather',
      api_config: {
        endpoint: 'http://localhost:8080/api',
        method: 'GET',
        auth_type: 'none',
      },
    })
    expect(result.success).toBe(false)
  })

  it('blocks AWS metadata endpoint', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'get_weather',
      api_config: {
        endpoint: 'http://169.254.169.254/latest/meta-data/',
        method: 'GET',
        auth_type: 'none',
      },
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid public URL endpoint', () => {
    const result = createToolSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'get_weather',
      api_config: {
        endpoint: 'https://api.openweathermap.org/data/2.5/weather',
        method: 'GET',
        auth_type: 'api_key',
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('generateCodeSchema', () => {
  it('accepts valid input', () => {
    const result = generateCodeSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      language: 'python',
    })
    expect(result.success).toBe(true)
  })

  it('defaults language to python', () => {
    const result = generateCodeSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.language).toBe('python')
  })

  it('rejects invalid language', () => {
    const result = generateCodeSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      language: 'ruby',
    })
    expect(result.success).toBe(false)
  })
})

describe('testToolSchema', () => {
  it('accepts valid tool_id', () => {
    const result = testToolSchema.safeParse({
      tool_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-UUID tool_id', () => {
    const result = testToolSchema.safeParse({ tool_id: 'abc' })
    expect(result.success).toBe(false)
  })
})

describe('checkoutSchema', () => {
  it('accepts professional plan', () => {
    const result = checkoutSchema.safeParse({ plan: 'professional' })
    expect(result.success).toBe(true)
  })

  it('rejects free plan', () => {
    const result = checkoutSchema.safeParse({ plan: 'free' })
    expect(result.success).toBe(false)
  })

  it('accepts optional email', () => {
    const result = checkoutSchema.safeParse({ plan: 'enterprise', email: 'test@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = checkoutSchema.safeParse({ plan: 'professional', email: 'not-an-email' })
    expect(result.success).toBe(false)
  })
})

describe('sanitizeForCodeGen', () => {
  it('escapes double quotes', () => {
    expect(sanitizeForCodeGen('say "hello"')).toBe('say \\"hello\\"')
  })

  it('escapes single quotes', () => {
    expect(sanitizeForCodeGen("it's")).toBe("it\\'s")
  })

  it('escapes backticks', () => {
    expect(sanitizeForCodeGen('use `code`')).toBe('use \\`code\\`')
  })

  it('escapes dollar signs', () => {
    expect(sanitizeForCodeGen('${inject}')).toBe('\\${inject}')
  })

  it('escapes newlines', () => {
    expect(sanitizeForCodeGen('line1\nline2')).toBe('line1\\nline2')
  })

  it('escapes backslashes', () => {
    expect(sanitizeForCodeGen('path\\to\\file')).toBe('path\\\\to\\\\file')
  })
})

describe('validateServerNameForCodeGen', () => {
  it('accepts clean names', () => {
    const result = validateServerNameForCodeGen('Weather Server')
    expect(result.safe).toBe(true)
    expect(result.sanitized).toBe('Weather Server')
  })

  it('strips special characters', () => {
    const result = validateServerNameForCodeGen('Server<script>')
    expect(result.safe).toBe(false)
    expect(result.sanitized).toBe('Serverscript')
  })
})

describe('validateDescriptionForCodeGen', () => {
  it('sanitizes code injection attempts in descriptions', () => {
    // Test that quotes and special chars get escaped
    const result = validateDescriptionForCodeGen('normal description with "quotes"')
    expect(result).toContain('\\"')
    expect(result).not.toContain('""')
  })
})
