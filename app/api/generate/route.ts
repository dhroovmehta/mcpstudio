import { NextResponse } from 'next/server'
import { createServerClient, type Tool } from '@/lib/supabase'
import { localTools, localServers } from '@/lib/local-store'
import { generatePythonCode, generateTypeScriptCode } from '@/lib/code-generator'
import { generateCodeSchema, validateServerNameForCodeGen } from '@/lib/validation'

// POST /api/generate — generate MCP server code from config
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input
  const parsed = generateCodeSchema.safeParse(body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => e.message)
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const { server_id, language } = parsed.data

  try {
    // Fetch server
    let server: any = null
    let tools: Tool[] = []

    try {
      const supabase = createServerClient()
      const [serverResult, toolsResult] = await Promise.all([
        supabase.from('mcp_servers').select('*').eq('id', server_id).single(),
        supabase.from('tools').select('*').eq('server_id', server_id).order('created_at'),
      ])

      if (!serverResult.error && serverResult.data) server = serverResult.data
      if (!toolsResult.error && toolsResult.data) tools = toolsResult.data as Tool[]
    } catch {
      // Local fallback
    }

    if (!server) {
      server = localServers.find((s) => s.id === server_id)
    }
    if (tools.length === 0) {
      tools = localTools.filter((t) => t.server_id === server_id) as Tool[]
    }

    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    if (tools.length === 0) {
      return NextResponse.json({ error: 'No tools configured. Add at least one tool.' }, { status: 400 })
    }

    // Code generation safety: sanitize server name
    const nameCheck = validateServerNameForCodeGen(server.name)
    const safeName = nameCheck.sanitized

    // Generate code
    let code: string
    if (language === 'typescript') {
      code = generateTypeScriptCode(safeName, tools)
    } else {
      code = generatePythonCode(safeName, tools)
    }

    // Save generated code to server record
    try {
      const supabase = createServerClient()
      const { error: updateError } = await supabase
        .from('mcp_servers')
        .update({ generated_code: code, updated_at: new Date().toISOString() })
        .eq('id', server_id)

      if (updateError) {
        console.error(`Failed to save generated code for server ${server_id}:`, updateError.message)
      }
    } catch {
      // Update local
      const idx = localServers.findIndex((s) => s.id === server_id)
      if (idx >= 0) localServers[idx].generated_code = code
    }

    return NextResponse.json({ code, language })
  } catch (err: any) {
    console.error('Code generation failed:', err.message)
    return NextResponse.json(
      { error: 'Code generation failed. Please check your tool configurations.' },
      { status: 500 }
    )
  }
}
