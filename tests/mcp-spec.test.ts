import { describe, it, expect } from 'vitest'
import {
  validateToolName,
  validateToolDescription,
  validatePropertyType,
  validateToolConfig,
  generateMCPConfig,
} from '@/lib/mcp-spec'

describe('validateToolName', () => {
  it('accepts valid names', () => {
    expect(validateToolName('get_weather')).toEqual({ valid: true })
    expect(validateToolName('a')).toEqual({ valid: true })
    expect(validateToolName('tool123')).toEqual({ valid: true })
    expect(validateToolName('my_tool_v2')).toEqual({ valid: true })
  })

  it('rejects empty names', () => {
    expect(validateToolName('')).toMatchObject({ valid: false })
  })

  it('rejects names starting with number', () => {
    expect(validateToolName('1tool')).toMatchObject({ valid: false })
  })

  it('rejects names with uppercase', () => {
    expect(validateToolName('GetWeather')).toMatchObject({ valid: false })
  })

  it('rejects names with spaces', () => {
    expect(validateToolName('get weather')).toMatchObject({ valid: false })
  })

  it('rejects names with hyphens', () => {
    expect(validateToolName('get-weather')).toMatchObject({ valid: false })
  })

  it('rejects names over 64 characters', () => {
    expect(validateToolName('a'.repeat(65))).toMatchObject({ valid: false })
  })

  it('accepts names at exactly 64 characters', () => {
    expect(validateToolName('a'.repeat(64))).toEqual({ valid: true })
  })
})

describe('validateToolDescription', () => {
  it('accepts valid descriptions', () => {
    expect(validateToolDescription('Get weather for a city')).toEqual({ valid: true })
  })

  it('rejects empty descriptions', () => {
    expect(validateToolDescription('')).toMatchObject({ valid: false })
  })

  it('rejects descriptions over 1024 characters', () => {
    expect(validateToolDescription('a'.repeat(1025))).toMatchObject({ valid: false })
  })

  it('accepts 1024-char description', () => {
    expect(validateToolDescription('a'.repeat(1024))).toEqual({ valid: true })
  })
})

describe('validatePropertyType', () => {
  it('accepts valid types', () => {
    expect(validatePropertyType('string')).toBe(true)
    expect(validatePropertyType('number')).toBe(true)
    expect(validatePropertyType('integer')).toBe(true)
    expect(validatePropertyType('boolean')).toBe(true)
    expect(validatePropertyType('array')).toBe(true)
    expect(validatePropertyType('object')).toBe(true)
  })

  it('rejects invalid types', () => {
    expect(validatePropertyType('float')).toBe(false)
    expect(validatePropertyType('date')).toBe(false)
    expect(validatePropertyType('')).toBe(false)
  })
})

describe('validateToolConfig', () => {
  const validConfig = {
    name: 'get_weather',
    description: 'Get weather for a city',
    api_config: {
      endpoint: 'https://api.example.com/weather',
      method: 'GET',
    },
    input_schema: {
      properties: { city: { type: 'string', description: 'City name' } },
    },
  }

  it('accepts a valid config', () => {
    expect(validateToolConfig(validConfig)).toEqual({ valid: true, errors: [] })
  })

  it('rejects missing name', () => {
    const result = validateToolConfig({ ...validConfig, name: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects missing description', () => {
    const result = validateToolConfig({ ...validConfig, description: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects missing endpoint', () => {
    const result = validateToolConfig({
      ...validConfig,
      api_config: { endpoint: '', method: 'GET' },
    })
    expect(result.valid).toBe(false)
  })

  it('rejects invalid URL', () => {
    const result = validateToolConfig({
      ...validConfig,
      api_config: { endpoint: 'not-a-url', method: 'GET' },
    })
    expect(result.valid).toBe(false)
  })

  it('rejects invalid method', () => {
    const result = validateToolConfig({
      ...validConfig,
      api_config: { endpoint: 'https://api.example.com', method: 'INVALID' },
    })
    expect(result.valid).toBe(false)
  })

  it('collects multiple errors', () => {
    const result = validateToolConfig({
      name: '',
      description: '',
      api_config: { endpoint: '', method: 'INVALID' },
      input_schema: { properties: {} },
    })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(3)
  })
})

describe('generateMCPConfig', () => {
  it('generates correct config structure', () => {
    const config = generateMCPConfig('Weather Server', 'https://weather.vercel.app')
    expect(config).toEqual({
      mcpServers: {
        'weather-server': {
          url: 'https://weather.vercel.app/mcp',
          transport: 'sse',
        },
      },
    })
  })

  it('slugifies server name', () => {
    const config = generateMCPConfig('My Cool Server', 'https://example.com') as any
    expect(config.mcpServers['my-cool-server']).toBeDefined()
  })

  it('appends /mcp to URL', () => {
    const config = generateMCPConfig('test', 'https://example.com') as any
    expect(config.mcpServers.test.url).toBe('https://example.com/mcp')
  })
})
