import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy client-side Supabase client
let _supabase: SupabaseClient | null = null
export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || url === 'your_supabase_url') {
      throw new Error('Supabase not configured')
    }
    _supabase = createClient(url, key, { db: { schema: 'mcpstudio' } }) as any
  }
  return _supabase
}

// Server-side Supabase client with service role
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || url === 'your_supabase_url') {
    throw new Error('Supabase not configured')
  }
  return createClient(url, serviceKey, { auth: { persistSession: false }, db: { schema: 'mcpstudio' } }) as any
}

// Database types
export interface User {
  id: string
  email: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  tier: 'free' | 'professional' | 'enterprise'
  created_at: string
}

export interface MCPServer {
  id: string
  user_id: string
  name: string
  description: string | null
  config: Record<string, unknown> | null
  generated_code: string | null
  deployment_url: string | null
  status: 'draft' | 'deployed' | 'error'
  created_at: string
  updated_at: string
}

export interface Tool {
  id: string
  server_id: string
  name: string
  description: string | null
  api_config: {
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    auth_type: 'none' | 'api_key' | 'bearer' | 'basic'
    auth_value?: string
    headers?: Record<string, string>
    body_template?: string
  }
  input_schema: {
    type: 'object'
    properties: Record<string, { type: string; description: string }>
    required?: string[]
  }
  output_mapping: {
    fields: Array<{ name: string; path: string; type: string }>
  }
  created_at: string
}

export interface Deployment {
  id: string
  server_id: string
  vercel_deployment_id: string | null
  version: string | null
  status: 'building' | 'ready' | 'error'
  deployment_url: string | null
  created_at: string
}

export interface ToolUsage {
  id: string
  server_id: string
  tool_id: string
  calls_count: number
  errors_count: number
  avg_latency_ms: number | null
  date: string
  created_at: string
}

// Tier limits (DB-backed enforcement)
export const TIER_LIMITS = {
  free: { maxServers: 3, maxCallsPerDay: 100 },
  professional: { maxServers: Infinity, maxCallsPerDay: 10000 },
  enterprise: { maxServers: Infinity, maxCallsPerDay: 100000 },
} as const
