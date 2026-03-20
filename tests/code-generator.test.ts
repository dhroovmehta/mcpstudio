import { describe, it, expect } from 'vitest'
import {
  generatePythonCode,
  generateTypeScriptCode,
  generatePythonRequirements,
  generateTSPackageJson,
} from '@/lib/code-generator'
import type { Tool } from '@/lib/supabase'

const makeTool = (overrides: Partial<Tool> = {}): Tool => ({
  id: 'tool-1',
  server_id: 'server-1',
  name: 'get_weather',
  description: 'Get weather for a city',
  api_config: {
    endpoint: 'https://api.openweathermap.org/data/2.5/weather',
    method: 'GET',
    auth_type: 'api_key',
    auth_value: 'test-key',
    headers: {},
  },
  input_schema: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name' },
    },
    required: ['city'],
  },
  output_mapping: {
    fields: [
      { name: 'temperature', path: 'main.temp', type: 'number' },
      { name: 'description', path: 'weather.0.description', type: 'string' },
    ],
  },
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('generatePythonCode', () => {
  it('generates valid Python code', () => {
    const code = generatePythonCode('Weather Server', [makeTool()])
    expect(code).toContain('from mcp.server.fastmcp import FastMCP')
    expect(code).toContain('mcp = FastMCP("Weather Server")')
    expect(code).toContain('async def get_weather')
    expect(code).toContain('city: str')
    expect(code).toContain('mcp.run(transport="sse")')
  })

  it('includes authentication code for api_key', () => {
    const code = generatePythonCode('Test', [makeTool()])
    expect(code).toContain('X-API-Key')
    expect(code).toContain('os.environ.get')
  })

  it('includes output field extraction', () => {
    const code = generatePythonCode('Test', [makeTool()])
    expect(code).toContain('result["temperature"]')
    expect(code).toContain('result["description"]')
    expect(code).toContain('main.temp')
  })

  it('includes server name header', () => {
    const code = generatePythonCode('My Custom Server', [makeTool()])
    expect(code).toContain('Server: My Custom Server')
  })

  it('handles bearer auth', () => {
    const tool = makeTool({
      api_config: {
        endpoint: 'https://api.example.com',
        method: 'GET',
        auth_type: 'bearer',
        auth_value: 'my-token',
        headers: {},
      },
    })
    const code = generatePythonCode('Test', [tool])
    expect(code).toContain('Bearer')
    expect(code).toContain('API_TOKEN')
  })

  it('handles basic auth', () => {
    const tool = makeTool({
      api_config: {
        endpoint: 'https://api.example.com',
        method: 'GET',
        auth_type: 'basic',
        auth_value: 'user:pass',
        headers: {},
      },
    })
    const code = generatePythonCode('Test', [tool])
    expect(code).toContain('base64')
    expect(code).toContain('Basic')
  })

  it('handles POST method with body', () => {
    const tool = makeTool({
      api_config: {
        endpoint: 'https://api.example.com/query',
        method: 'POST',
        auth_type: 'none',
        headers: {},
      },
    })
    const code = generatePythonCode('Test', [tool])
    expect(code).toContain('client.post')
    expect(code).toContain('json=')
  })

  it('handles multiple tools', () => {
    const tool1 = makeTool()
    const tool2 = makeTool({
      id: 'tool-2',
      name: 'get_forecast',
      description: 'Get 5-day forecast',
    })
    const code = generatePythonCode('Weather', [tool1, tool2])
    expect(code).toContain('async def get_weather')
    expect(code).toContain('async def get_forecast')
  })

  it('handles no auth', () => {
    const tool = makeTool({
      api_config: {
        endpoint: 'https://api.example.com',
        method: 'GET',
        auth_type: 'none',
        headers: {},
      },
    })
    const code = generatePythonCode('Test', [tool])
    // Should not contain auth blocks
    expect(code).not.toContain('X-API-Key')
    expect(code).not.toContain('Bearer')
  })
})

describe('generateTypeScriptCode', () => {
  it('generates valid TypeScript code', () => {
    const code = generateTypeScriptCode('Weather Server', [makeTool()])
    expect(code).toContain('McpServer')
    expect(code).toContain('SSEServerTransport')
    expect(code).toContain('"get_weather"')
    expect(code).toContain('z.string()')
    expect(code).toContain('express')
  })

  it('includes zod parameter types', () => {
    const tool = makeTool({
      input_schema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name' },
          units: { type: 'string', description: 'Units' },
        },
      },
    })
    const code = generateTypeScriptCode('Test', [tool])
    expect(code).toContain('city: z.string()')
    expect(code).toContain('units: z.string()')
  })

  it('includes output extraction with reduce', () => {
    const code = generateTypeScriptCode('Test', [makeTool()])
    expect(code).toContain('result["temperature"]')
    expect(code).toContain('.split(".").reduce')
  })

  it('handles number types in zod', () => {
    const tool = makeTool({
      input_schema: {
        type: 'object',
        properties: {
          lat: { type: 'number', description: 'Latitude' },
          count: { type: 'integer', description: 'Count' },
        },
      },
    })
    const code = generateTypeScriptCode('Test', [tool])
    expect(code).toContain('z.number()')
  })
})

describe('generatePythonRequirements', () => {
  it('includes mcp dependency', () => {
    const reqs = generatePythonRequirements()
    expect(reqs).toContain('mcp')
  })

  it('includes httpx', () => {
    const reqs = generatePythonRequirements()
    expect(reqs).toContain('httpx')
  })
})

describe('generateTSPackageJson', () => {
  it('generates valid JSON', () => {
    const pkg = generateTSPackageJson('Weather Server')
    const parsed = JSON.parse(pkg)
    expect(parsed.name).toBe('weather-server')
    expect(parsed.dependencies).toHaveProperty('@modelcontextprotocol/sdk')
    expect(parsed.dependencies).toHaveProperty('express')
    expect(parsed.dependencies).toHaveProperty('zod')
  })

  it('slugifies server name', () => {
    const pkg = JSON.parse(generateTSPackageJson('My Cool Server'))
    expect(pkg.name).toBe('my-cool-server')
  })
})
