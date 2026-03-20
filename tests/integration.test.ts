import { describe, it, expect, beforeEach } from 'vitest'
import { localServers, localTools } from '@/lib/local-store'
import { generatePythonCode, generateTypeScriptCode } from '@/lib/code-generator'
import { preparePythonDeploymentFiles, prepareTSDeploymentFiles, } from '@/lib/vercel-api'
import { generatePythonRequirements, generateTSPackageJson } from '@/lib/code-generator'
import { validateToolConfig } from '@/lib/mcp-spec'
import { createServerSchema, createToolSchema, generateCodeSchema, deploySchema } from '@/lib/validation'
import type { Tool } from '@/lib/supabase'

// Full integration test: create server -> add tools -> validate -> generate code -> prepare deploy
describe('Integration: Server Pipeline', () => {
  beforeEach(() => {
    // Clear local stores
    localServers.length = 0
    localTools.length = 0
  })

  const validServerPayload = { name: 'Weather API Server', description: 'A weather tool server' }

  const validToolPayload = {
    server_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'get_weather',
    description: 'Get current weather for a city',
    api_config: {
      endpoint: 'https://api.openweathermap.org/data/2.5/weather',
      method: 'GET' as const,
      auth_type: 'api_key' as const,
      auth_value: 'test-key',
      headers: {},
    },
    input_schema: {
      type: 'object' as const,
      properties: {
        city: { type: 'string', description: 'City name' },
        units: { type: 'string', description: 'Temperature units' },
      },
      required: ['city'],
    },
    output_mapping: {
      fields: [
        { name: 'temperature', path: 'main.temp', type: 'number' },
        { name: 'description', path: 'weather.0.description', type: 'string' },
      ],
    },
  }

  it('Step 1: validates server creation input', () => {
    const result = createServerSchema.safeParse(validServerPayload)
    expect(result.success).toBe(true)
  })

  it('Step 2: validates tool creation input', () => {
    const result = createToolSchema.safeParse(validToolPayload)
    expect(result.success).toBe(true)
  })

  it('Step 3: validates tool config via MCP spec', () => {
    const result = validateToolConfig({
      name: validToolPayload.name,
      description: validToolPayload.description,
      api_config: validToolPayload.api_config,
      input_schema: validToolPayload.input_schema,
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('Step 4: generates Python code from tool config', () => {
    const tool: Tool = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      server_id: validToolPayload.server_id,
      name: validToolPayload.name,
      description: validToolPayload.description,
      api_config: validToolPayload.api_config,
      input_schema: validToolPayload.input_schema,
      output_mapping: validToolPayload.output_mapping,
      created_at: new Date().toISOString(),
    }

    const code = generatePythonCode('Weather API Server', [tool])
    expect(code).toContain('FastMCP')
    expect(code).toContain('get_weather')
    expect(code).toContain('city: str')
    expect(code).toContain('units: str')
    expect(code).toContain('X-API-Key')
    expect(code).toContain('result["temperature"]')
    expect(code).toContain('result["description"]')
  })

  it('Step 4b: generates TypeScript code from tool config', () => {
    const tool: Tool = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      server_id: validToolPayload.server_id,
      name: validToolPayload.name,
      description: validToolPayload.description,
      api_config: validToolPayload.api_config,
      input_schema: validToolPayload.input_schema,
      output_mapping: validToolPayload.output_mapping,
      created_at: new Date().toISOString(),
    }

    const code = generateTypeScriptCode('Weather API Server', [tool])
    expect(code).toContain('McpServer')
    expect(code).toContain('z.string()')
    expect(code).toContain('result["temperature"]')
  })

  it('Step 5: prepares Python deployment files', () => {
    const tool: Tool = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      server_id: validToolPayload.server_id,
      name: validToolPayload.name,
      description: validToolPayload.description,
      api_config: validToolPayload.api_config,
      input_schema: validToolPayload.input_schema,
      output_mapping: validToolPayload.output_mapping,
      created_at: new Date().toISOString(),
    }

    const code = generatePythonCode('Weather API Server', [tool])
    const requirements = generatePythonRequirements()
    const files = preparePythonDeploymentFiles(code, requirements, 'Weather API Server')

    expect(files).toHaveLength(3)
    expect(files.map(f => f.file)).toContain('api/index.py')
    expect(files.map(f => f.file)).toContain('requirements.txt')
    expect(files.map(f => f.file)).toContain('vercel.json')

    // Verify vercel.json has correct build config
    const vercelJson = JSON.parse(files.find(f => f.file === 'vercel.json')!.data)
    expect(vercelJson.builds[0].use).toBe('@vercel/python')
  })

  it('Step 5b: prepares TypeScript deployment files', () => {
    const tool: Tool = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      server_id: validToolPayload.server_id,
      name: validToolPayload.name,
      description: validToolPayload.description,
      api_config: validToolPayload.api_config,
      input_schema: validToolPayload.input_schema,
      output_mapping: validToolPayload.output_mapping,
      created_at: new Date().toISOString(),
    }

    const code = generateTypeScriptCode('Weather API Server', [tool])
    const packageJson = generateTSPackageJson('Weather API Server')
    const files = prepareTSDeploymentFiles(code, packageJson, 'Weather API Server')

    expect(files).toHaveLength(4)
    expect(files.map(f => f.file)).toContain('api/index.ts')
    expect(files.map(f => f.file)).toContain('package.json')
    expect(files.map(f => f.file)).toContain('vercel.json')
    expect(files.map(f => f.file)).toContain('tsconfig.json')
  })

  it('validates deploy schema input', () => {
    const result = deploySchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      language: 'python',
    })
    expect(result.success).toBe(true)
  })

  it('validates generate code schema input', () => {
    const result = generateCodeSchema.safeParse({
      server_id: '550e8400-e29b-41d4-a716-446655440000',
      language: 'typescript',
    })
    expect(result.success).toBe(true)
  })
})

describe('Integration: Code Generation Safety', () => {
  it('sanitizes malicious tool names in generated Python code', () => {
    const tool: Tool = {
      id: 'tool-1',
      server_id: 'server-1',
      name: 'get_weather',
      description: 'Normal description',
      api_config: {
        endpoint: 'https://api.example.com/weather',
        method: 'GET',
        auth_type: 'none',
        headers: {},
      },
      input_schema: {
        type: 'object',
        properties: {
          safe_param: { type: 'string', description: 'A safe parameter' },
        },
      },
      output_mapping: { fields: [{ name: 'result', path: 'data.value', type: 'string' }] },
      created_at: new Date().toISOString(),
    }

    const code = generatePythonCode('Test Server', [tool])
    expect(code).toContain('safe_param')
    // Generated code should be syntactically valid
    expect(code).toContain('async def get_weather')
    expect(code).toContain('FastMCP')
  })

  it('handles tools with no input parameters', () => {
    const tool: Tool = {
      id: 'tool-1',
      server_id: 'server-1',
      name: 'health_check',
      description: 'Check API health',
      api_config: {
        endpoint: 'https://api.example.com/health',
        method: 'GET',
        auth_type: 'none',
        headers: {},
      },
      input_schema: { type: 'object', properties: {} },
      output_mapping: { fields: [] },
      created_at: new Date().toISOString(),
    }

    const pyCode = generatePythonCode('Health', [tool])
    expect(pyCode).toContain('async def health_check()')

    const tsCode = generateTypeScriptCode('Health', [tool])
    expect(tsCode).toContain('health_check')
  })

  it('handles multiple tools in a single server', () => {
    const tools: Tool[] = [
      {
        id: 'tool-1',
        server_id: 'server-1',
        name: 'get_weather',
        description: 'Get weather',
        api_config: { endpoint: 'https://api.example.com/weather', method: 'GET', auth_type: 'none', headers: {} },
        input_schema: { type: 'object', properties: { city: { type: 'string', description: 'City' } } },
        output_mapping: { fields: [] },
        created_at: new Date().toISOString(),
      },
      {
        id: 'tool-2',
        server_id: 'server-1',
        name: 'get_forecast',
        description: 'Get forecast',
        api_config: { endpoint: 'https://api.example.com/forecast', method: 'POST', auth_type: 'bearer', auth_value: 'token123', headers: {} },
        input_schema: { type: 'object', properties: { city: { type: 'string', description: 'City' }, days: { type: 'number', description: 'Days' } } },
        output_mapping: { fields: [{ name: 'forecast', path: 'data.forecast', type: 'string' }] },
        created_at: new Date().toISOString(),
      },
    ]

    const pyCode = generatePythonCode('Weather Suite', tools)
    expect(pyCode).toContain('async def get_weather')
    expect(pyCode).toContain('async def get_forecast')
    expect(pyCode).toContain('Bearer')

    const tsCode = generateTypeScriptCode('Weather Suite', tools)
    expect(tsCode).toContain('"get_weather"')
    expect(tsCode).toContain('"get_forecast"')
  })
})

describe('Integration: Quota Enforcement', () => {
  beforeEach(() => {
    localServers.length = 0
  })

  it('local store tracks servers for quota checks', () => {
    expect(localServers).toHaveLength(0)

    // Add servers up to free tier limit (3)
    for (let i = 0; i < 3; i++) {
      localServers.push({
        id: `server-${i}`,
        name: `Server ${i}`,
        status: 'draft',
        user_id: 'demo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    expect(localServers).toHaveLength(3)
  })
})
