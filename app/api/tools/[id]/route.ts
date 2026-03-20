import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { localTools } from '@/lib/local-store'
import { updateToolSchema } from '@/lib/validation'

// PUT /api/tools/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid tool ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input with Zod
  const parsed = updateToolSchema.safeParse(body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const updates: Record<string, unknown> = { ...parsed.data }

  try {
    const supabase = createServerClient()
    const { data: tool, error } = await supabase
      .from('tools')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Failed to update tool ${id}:`, error.message)
      throw error
    }
    return NextResponse.json({ tool })
  } catch {
    const idx = localTools.findIndex((t) => t.id === id)
    if (idx >= 0) {
      localTools[idx] = { ...localTools[idx], ...updates }
      return NextResponse.json({ tool: localTools[idx] })
    }
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
  }
}

// DELETE /api/tools/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid tool ID' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('tools').delete().eq('id', id)
    if (error) {
      console.error(`Failed to delete tool ${id}:`, error.message)
      throw error
    }
    return NextResponse.json({ success: true })
  } catch {
    const idx = localTools.findIndex((t) => t.id === id)
    if (idx >= 0) {
      localTools.splice(idx, 1)
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
  }
}
