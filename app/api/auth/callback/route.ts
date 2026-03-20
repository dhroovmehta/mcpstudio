import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/auth/callback — handle Supabase OAuth callback
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    console.error('Auth callback: missing code parameter')
    return NextResponse.redirect(`${origin}/?error=auth_missing_code`)
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback: session exchange failed:', error.message)
      return NextResponse.redirect(`${origin}/?error=auth_exchange_failed`)
    }

    return NextResponse.redirect(`${origin}/dashboard`)
  } catch (err: any) {
    console.error('Auth callback: unexpected error:', err.message)
    return NextResponse.redirect(`${origin}/?error=auth`)
  }
}
