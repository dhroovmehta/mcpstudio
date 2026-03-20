import { NextResponse } from 'next/server'
import { createServerClient, TIER_LIMITS } from '@/lib/supabase'
import { localServers } from '@/lib/local-store'
import { createServerSchema } from '@/lib/validation'
import { v4 as uuidv4 } from 'uuid'

// GET /api/servers — list all servers
export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: servers, error } = await supabase
      .from('mcp_servers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch servers:', error.message)
      return NextResponse.json({ servers: [] })
    }

    return NextResponse.json({ servers: servers || [] })
  } catch (err: any) {
    // Supabase not configured — fall back to local store
    return NextResponse.json({ servers: localServers })
  }
}

// POST /api/servers — create a new server (with quota enforcement)
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input with zod
  const parsed = createServerSchema.safeParse(body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => e.message)
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const { name, description } = parsed.data
  const id = uuidv4()
  const now = new Date().toISOString()

  try {
    const supabase = createServerClient()

    // Quota enforcement: check how many servers the user already has
    // For now, we check total servers (no auth = demo mode, skip quota)
    // In production, this would filter by authenticated user_id
    const { data: existingServers, error: countError } = await supabase
      .from('mcp_servers')
      .select('id', { count: 'exact' })

    if (countError) {
      console.error('Failed to count servers for quota check:', countError.message)
      // Proceed cautiously — don't block if quota check fails
    } else if (existingServers) {
      // Default to free tier limits when no auth is present
      // In production, look up the user's tier from the users table
      const tierLimit = TIER_LIMITS.free.maxServers
      if (existingServers.length >= tierLimit) {
        return NextResponse.json(
          {
            error: `Server limit reached. Free tier allows ${tierLimit} server(s). Upgrade to create more.`,
            quota: { current: existingServers.length, limit: tierLimit },
          },
          { status: 403 }
        )
      }
    }

    const { data: server, error } = await supabase
      .from('mcp_servers')
      .insert({
        id,
        name,
        description: description || null,
        status: 'draft',
        config: {},
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create server in DB:', error.message)
      throw error
    }

    return NextResponse.json({ server }, { status: 201 })
  } catch {
    // Local fallback (demo mode) — enforce quota on local store too
    if (localServers.length >= TIER_LIMITS.free.maxServers) {
      return NextResponse.json(
        {
          error: `Server limit reached. Free tier allows ${TIER_LIMITS.free.maxServers} server(s). Upgrade to create more.`,
          quota: { current: localServers.length, limit: TIER_LIMITS.free.maxServers },
        },
        { status: 403 }
      )
    }

    const server = {
      id,
      name,
      description: description || null,
      status: 'draft' as const,
      config: {},
      generated_code: null,
      deployment_url: null,
      user_id: 'demo',
      created_at: now,
      updated_at: now,
    }
    localServers.push(server)
    return NextResponse.json({ server }, { status: 201 })
  }
}
