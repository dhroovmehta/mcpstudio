import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { localTools } from '@/lib/local-store'
import { createToolSchema } from '@/lib/validation'
import { v4 as uuidv4 } from 'uuid'

// Max tools per server (defense against abuse / resource exhaustion)
const MAX_TOOLS_PER_SERVER = 50

// GET /api/tools?server_id=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const serverId = searchParams.get('server_id')

  if (!serverId) {
    return NextResponse.json({ error: 'server_id is required' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { data: tools, error } = await supabase
      .from('tools')
      .select('*')
      .eq('server_id', serverId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(`Failed to fetch tools for server ${serverId}:`, error.message)
      throw error
    }
    return NextResponse.json({ tools: tools || [] })
  } catch {
    return NextResponse.json({
      tools: localTools.filter((t) => t.server_id === serverId),
    })
  }
}

// POST /api/tools — create a new tool (with zod validation)
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input with zod
  const parsed = createToolSchema.safeParse(body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const { server_id, name, description, api_config, input_schema, output_mapping } = parsed.data
  const id = uuidv4()
  const now = new Date().toISOString()

  const toolData = {
    id,
    server_id,
    name,
    description: description || null,
    api_config: api_config || {},
    input_schema: input_schema || { type: 'object' as const, properties: {} },
    output_mapping: output_mapping || { fields: [] },
    created_at: now,
  }

  try {
    const supabase = createServerClient()

    // Quota enforcement: check how many tools this server already has
    const { data: existingTools, error: countError } = await supabase
      .from('tools')
      .select('id')
      .eq('server_id', server_id)

    if (!countError && existingTools && existingTools.length >= MAX_TOOLS_PER_SERVER) {
      return NextResponse.json(
        {
          error: `Tool limit reached. Maximum ${MAX_TOOLS_PER_SERVER} tools per server.`,
          quota: { current: existingTools.length, limit: MAX_TOOLS_PER_SERVER },
        },
        { status: 403 }
      )
    }

    const { data: tool, error } = await supabase
      .from('tools')
      .insert(toolData)
      .select()
      .single()

    if (error) {
      console.error('Failed to create tool in DB:', error.message)
      throw error
    }
    return NextResponse.json({ tool }, { status: 201 })
  } catch {
    // Local fallback: enforce tool quota on local store too
    const localCount = localTools.filter((t) => t.server_id === server_id).length
    if (localCount >= MAX_TOOLS_PER_SERVER) {
      return NextResponse.json(
        {
          error: `Tool limit reached. Maximum ${MAX_TOOLS_PER_SERVER} tools per server.`,
          quota: { current: localCount, limit: MAX_TOOLS_PER_SERVER },
        },
        { status: 403 }
      )
    }

    localTools.push(toolData)
    return NextResponse.json({ tool: toolData }, { status: 201 })
  }
}
