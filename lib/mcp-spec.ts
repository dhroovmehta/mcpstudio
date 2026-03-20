// MCP (Model Context Protocol) schema validation
// Ensures generated servers conform to the MCP specification

export interface MCPToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
    }>
    required?: string[]
  }
}

export interface MCPServerConfig {
  name: string
  version: string
  tools: MCPToolDefinition[]
}

// Validate tool name: lowercase, alphanumeric, underscores only
export function validateToolName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length === 0) {
    return { valid: false, error: 'Tool name is required' }
  }
  if (name.length > 64) {
    return { valid: false, error: 'Tool name must be 64 characters or less' }
  }
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    return { valid: false, error: 'Tool name must start with a letter and contain only lowercase letters, numbers, and underscores' }
  }
  return { valid: true }
}

// Validate tool description
export function validateToolDescription(desc: string): { valid: boolean; error?: string } {
  if (!desc || desc.length === 0) {
    return { valid: false, error: 'Tool description is required' }
  }
  if (desc.length > 1024) {
    return { valid: false, error: 'Tool description must be 1024 characters or less' }
  }
  return { valid: true }
}

// Validate input schema property type
export function validatePropertyType(type: string): boolean {
  return ['string', 'number', 'integer', 'boolean', 'array', 'object'].includes(type)
}

// Validate entire tool config
export function validateToolConfig(tool: {
  name: string
  description: string
  api_config: {
    endpoint: string
    method: string
  }
  input_schema: {
    properties: Record<string, unknown>
  }
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const nameCheck = validateToolName(tool.name)
  if (!nameCheck.valid) errors.push(nameCheck.error!)

  const descCheck = validateToolDescription(tool.description)
  if (!descCheck.valid) errors.push(descCheck.error!)

  if (!tool.api_config?.endpoint) {
    errors.push('API endpoint is required')
  } else {
    try {
      new URL(tool.api_config.endpoint)
    } catch {
      errors.push('API endpoint must be a valid URL')
    }
  }

  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(tool.api_config?.method)) {
    errors.push('HTTP method must be GET, POST, PUT, DELETE, or PATCH')
  }

  return { valid: errors.length === 0, errors }
}

// Generate MCP config JSON for Claude Desktop
export function generateMCPConfig(serverName: string, deploymentUrl: string): object {
  return {
    mcpServers: {
      [serverName.toLowerCase().replace(/\s+/g, '-')]: {
        url: `${deploymentUrl}/mcp`,
        transport: 'sse',
      },
    },
  }
}
