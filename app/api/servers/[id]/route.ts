import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { localServers } from '@/lib/local-store'
import { updateServerSchema } from '@/lib/validation'

// GET /api/servers/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid server ID' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { data: server, error } = await supabase
      .from('mcp_servers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !server) {
      // Try local fallback
      const local = localServers.find((s) => s.id === id)
      if (local) return NextResponse.json({ server: local })
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    return NextResponse.json({ server })
  } catch (err: any) {
    const local = localServers.find((s) => s.id === id)
    if (local) return NextResponse.json({ server: local })
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }
}

// PUT /api/servers/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid server ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input with Zod
  const parsed = updateServerSchema.safeParse(body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => e.message)
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const updates: Record<string, unknown> = { ...parsed.data }
  updates.updated_at = new Date().toISOString()

  try {
    const supabase = createServerClient()
    const { data: server, error } = await supabase
      .from('mcp_servers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Failed to update server ${id}:`, error.message)
      throw error
    }
    return NextResponse.json({ server })
  } catch {
    // Local fallback
    const idx = localServers.findIndex((s) => s.id === id)
    if (idx >= 0) {
      localServers[idx] = { ...localServers[idx], ...updates }
      return NextResponse.json({ server: localServers[idx] })
    }
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }
}

// DELETE /api/servers/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid server ID' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('mcp_servers').delete().eq('id', id)
    if (error) {
      console.error(`Failed to delete server ${id}:`, error.message)
      throw error
    }
    return NextResponse.json({ success: true })
  } catch {
    const idx = localServers.findIndex((s) => s.id === id)
    if (idx >= 0) {
      localServers.splice(idx, 1)
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }
}
