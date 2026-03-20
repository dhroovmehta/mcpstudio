import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { localTools } from '@/lib/local-store'
import { resolvePath } from '@/lib/utils'
import { testToolSchema } from '@/lib/validation'

// POST /api/test — test a tool by making the API call
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input
  const parsed = testToolSchema.safeParse(body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => e.message)
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const { tool_id, inputs } = parsed.data

  try {
    // Fetch tool config
    let tool: any = null
    try {
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', tool_id)
        .single()

      if (!error && data) tool = data
    } catch {
      // fallback
    }

    if (!tool) {
      tool = localTools.find((t) => t.id === tool_id)
    }

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    const apiConfig = tool.api_config
    if (!apiConfig?.endpoint) {
      return NextResponse.json({ error: 'Tool has no API endpoint configured' }, { status: 400 })
    }

    // Validate endpoint URL is not internal/private (SSRF protection)
    try {
      const endpointUrl = new URL(apiConfig.endpoint)
      const hostname = endpointUrl.hostname
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname === '169.254.169.254' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('172.')
      ) {
        return NextResponse.json(
          { error: 'Cannot test against private/internal addresses' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json({ error: 'Invalid API endpoint URL' }, { status: 400 })
    }

    // Build request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(apiConfig.headers || {}),
    }

    // Apply auth
    if (apiConfig.auth_type === 'api_key' && apiConfig.auth_value) {
      headers['X-API-Key'] = apiConfig.auth_value
    } else if (apiConfig.auth_type === 'bearer' && apiConfig.auth_value) {
      headers['Authorization'] = `Bearer ${apiConfig.auth_value}`
    } else if (apiConfig.auth_type === 'basic' && apiConfig.auth_value) {
      headers['Authorization'] = `Basic ${Buffer.from(apiConfig.auth_value).toString('base64')}`
    }

    // Build URL with query params for GET
    let url = apiConfig.endpoint
    const fetchOptions: RequestInit = {
      method: apiConfig.method,
      headers,
    }

    if (apiConfig.method === 'GET' && inputs && Object.keys(inputs).length > 0) {
      const params = new URLSearchParams()
      Object.entries(inputs).forEach(([key, value]) => {
        params.append(key, String(value))
      })
      url = `${url}?${params.toString()}`
    } else if (['POST', 'PUT', 'PATCH'].includes(apiConfig.method) && inputs) {
      // Use body template if provided, otherwise send inputs as JSON
      if (apiConfig.body_template) {
        let bodyStr = apiConfig.body_template
        Object.entries(inputs).forEach(([key, value]) => {
          bodyStr = bodyStr.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
        })
        fetchOptions.body = bodyStr
      } else {
        fetchOptions.body = JSON.stringify(inputs)
      }
    }

    // Make the API call with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000) // 30s timeout
    fetchOptions.signal = controller.signal

    const startTime = Date.now()
    let response: Response
    try {
      response = await fetch(url, fetchOptions)
    } catch (fetchErr: any) {
      clearTimeout(timeout)
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'API call timed out after 30 seconds' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { success: false, error: `API call failed: ${fetchErr.message}` },
        { status: 502 }
      )
    }
    clearTimeout(timeout)
    const latency = Date.now() - startTime

    let responseData: unknown
    const contentType = response.headers.get('content-type') || ''
    try {
      if (contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch {
      responseData = 'Failed to parse response body'
    }

    // Apply output mapping
    const outputMapping = tool.output_mapping?.fields || []
    const mappedOutput: Record<string, unknown> = {}

    if (outputMapping.length > 0 && typeof responseData === 'object') {
      outputMapping.forEach((field: { name: string; path: string }) => {
        mappedOutput[field.name] = resolvePath(responseData, field.path)
      })
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      latency_ms: latency,
      raw_response: responseData,
      mapped_output: outputMapping.length > 0 ? mappedOutput : undefined,
    })
  } catch (err: any) {
    console.error('Test route error:', err.message)
    return NextResponse.json(
      {
        success: false,
        error: 'Tool test failed unexpectedly. Please check your configuration.',
      },
      { status: 500 }
    )
  }
}
