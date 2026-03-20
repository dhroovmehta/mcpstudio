import { z } from 'zod'

// Sanitize string: strip control chars, trim
function sanitizeString(val: string): string {
  // Remove null bytes and control characters (except newline/tab)
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

// Tool name: must be safe for use in generated code (no injection)
const safeToolName = z
  .string()
  .min(1, 'Tool name is required')
  .max(64, 'Tool name must be 64 characters or less')
  .regex(
    /^[a-z][a-z0-9_]*$/,
    'Tool name must start with a letter and contain only lowercase letters, numbers, and underscores'
  )

// Server name: alphanumeric, spaces, hyphens — no special chars that could be injected
const safeServerName = z
  .string()
  .min(1, 'Server name is required')
  .max(100, 'Server name must be 100 characters or less')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/,
    'Server name must start with a letter or number and contain only letters, numbers, spaces, hyphens, and underscores'
  )

// Description: general text, sanitized
const safeDescription = z
  .string()
  .max(1024, 'Description must be 1024 characters or less')
  .transform(sanitizeString)
  .optional()
  .nullable()

// API endpoint URL: must be valid HTTPS/HTTP URL
const safeEndpointUrl = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => url.startsWith('https://') || url.startsWith('http://'),
    'Endpoint must use http:// or https://'
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url)
        // Block private/internal IPs (SSRF protection)
        const hostname = parsed.hostname
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
          return false
        }
        if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) {
          return false
        }
        if (hostname === '169.254.169.254') return false // AWS metadata
        return true
      } catch {
        return false
      }
    },
    'Endpoint must not point to private/internal addresses'
  )

const httpMethod = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])

const authType = z.enum(['none', 'api_key', 'bearer', 'basic'])

// API config schema
export const apiConfigSchema = z.object({
  endpoint: safeEndpointUrl,
  method: httpMethod,
  auth_type: authType,
  auth_value: z.string().max(500).optional(),
  headers: z.record(z.string(), z.string().max(500)).optional(),
  body_template: z.string().max(10000).optional(),
})

// Input schema property
const inputProperty = z.object({
  type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object']),
  description: z.string().max(500),
})

// Input schema
export const inputSchemaSchema = z.object({
  type: z.literal('object'),
  properties: z.record(
    z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Property names must be valid identifiers'),
    inputProperty
  ),
  required: z.array(z.string()).optional(),
})

// Output mapping
const outputField = z.object({
  name: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Output field names must be valid identifiers'),
  path: z.string().regex(/^[a-zA-Z0-9_.]+$/, 'Output path must use dot notation with alphanumeric keys'),
  type: z.string(),
})

export const outputMappingSchema = z.object({
  fields: z.array(outputField),
})

// Full schemas for API routes

export const createServerSchema = z.object({
  name: safeServerName,
  description: safeDescription,
})

export const createToolSchema = z.object({
  server_id: z.string().uuid('Invalid server ID'),
  name: safeToolName,
  description: safeDescription,
  api_config: apiConfigSchema.optional(),
  input_schema: inputSchemaSchema.optional(),
  output_mapping: outputMappingSchema.optional(),
})

export const generateCodeSchema = z.object({
  server_id: z.string().uuid('Invalid server ID'),
  language: z.enum(['python', 'typescript']).default('python'),
})

export const deploySchema = z.object({
  server_id: z.string().uuid('Invalid server ID'),
  language: z.enum(['python', 'typescript']).default('python'),
})

export const testToolSchema = z.object({
  tool_id: z.string().uuid('Invalid tool ID'),
  inputs: z.record(z.string(), z.unknown()).optional(),
})

export const checkoutSchema = z.object({
  plan: z.enum(['professional', 'enterprise']),
  email: z.string().email().optional(),
})

// Update schemas for PUT endpoints (all fields optional except at least one must be present)
export const updateServerSchema = z.object({
  name: safeServerName.optional(),
  description: safeDescription,
  config: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['draft', 'deployed', 'error']).optional(),
}).refine(
  (data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined),
  'At least one field must be provided for update'
)

export const updateToolSchema = z.object({
  name: safeToolName.optional(),
  description: safeDescription,
  api_config: apiConfigSchema.optional(),
  input_schema: inputSchemaSchema.optional(),
  output_mapping: outputMappingSchema.optional(),
}).refine(
  (data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined),
  'At least one field must be provided for update'
)

// Code generation safety: validate that user inputs don't contain code injection patterns
export function sanitizeForCodeGen(value: string): string {
  // Remove characters that could break out of string literals in generated Python/TS
  return value
    .replace(/\\/g, '\\\\')    // escape backslashes first
    .replace(/"/g, '\\"')       // escape double quotes
    .replace(/'/g, "\\'")       // escape single quotes
    .replace(/`/g, '\\`')       // escape backticks (template literals)
    .replace(/\$/g, '\\$')      // escape dollar signs (template interpolation)
    .replace(/\n/g, '\\n')      // escape newlines
    .replace(/\r/g, '\\r')      // escape carriage returns
}

// Validate that a server name is safe for code generation
export function validateServerNameForCodeGen(name: string): { safe: boolean; sanitized: string } {
  const sanitized = name.replace(/[^a-zA-Z0-9 _-]/g, '')
  return {
    safe: sanitized === name,
    sanitized,
  }
}

// Validate that a tool description is safe for code generation
export function validateDescriptionForCodeGen(desc: string): string {
  return sanitizeForCodeGen(desc)
}
