import { NextResponse } from 'next/server'
import { createServerClient, type Tool } from '@/lib/supabase'
import { localTools, localServers } from '@/lib/local-store'
import {
  generatePythonCode,
  generateTypeScriptCode,
  generatePythonRequirements,
  generateTSPackageJson,
} from '@/lib/code-generator'
import {
  createDeployment,
  preparePythonDeploymentFiles,
  prepareTSDeploymentFiles,
} from '@/lib/vercel-api'
import { deploySchema, validateServerNameForCodeGen } from '@/lib/validation'

// POST /api/deploy — generate code and deploy to Vercel
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input
  const parsed = deploySchema.safeParse(body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => e.message)
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const { server_id, language } = parsed.data

  try {
    // Fetch server and tools
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
      return NextResponse.json({ error: 'No tools configured' }, { status: 400 })
    }

    // Code generation safety: sanitize server name
    const nameCheck = validateServerNameForCodeGen(server.name)
    const safeName = nameCheck.sanitized

    // Generate code
    let code: string
    let deployFiles: Array<{ file: string; data: string }>

    if (language === 'typescript') {
      code = generateTypeScriptCode(safeName, tools)
      const packageJson = generateTSPackageJson(safeName)
      deployFiles = prepareTSDeploymentFiles(code, packageJson, safeName)
    } else {
      code = generatePythonCode(safeName, tools)
      const requirements = generatePythonRequirements()
      deployFiles = preparePythonDeploymentFiles(code, requirements, safeName)
    }

    // Check for Vercel token
    if (!process.env.VERCEL_API_TOKEN || process.env.VERCEL_API_TOKEN === 'your_vercel_api_token') {
      // Demo mode: generate code but skip actual deployment
      const demoUrl = `https://${safeName.toLowerCase().replace(/\s+/g, '-')}-demo.vercel.app`

      // Update server status
      try {
        const supabase = createServerClient()
        const { error: updateError } = await supabase
          .from('mcp_servers')
          .update({
            status: 'deployed',
            generated_code: code,
            deployment_url: demoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', server_id)

        if (updateError) {
          console.error(`Failed to update server status for ${server_id}:`, updateError.message)
        }
      } catch {
        const idx = localServers.findIndex((s) => s.id === server_id)
        if (idx >= 0) {
          localServers[idx] = {
            ...localServers[idx],
            status: 'deployed',
            generated_code: code,
            deployment_url: demoUrl,
            updated_at: new Date().toISOString(),
          }
        }
      }

      return NextResponse.json({
        deployment_url: demoUrl,
        status: 'deployed',
        code,
        demo_mode: true,
        message: 'Demo deployment. Set VERCEL_API_TOKEN for real deployments.',
      })
    }

    // Real deployment to Vercel
    const projectName = safeName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    let deployment: { id: string; url: string; readyState: string }

    try {
      deployment = await createDeployment(projectName, deployFiles)
    } catch (err: any) {
      console.error('Vercel deployment API call failed:', err.message)
      return NextResponse.json(
        { error: 'Deployment to Vercel failed. Please try again later.' },
        { status: 502 }
      )
    }

    const deploymentUrl = `https://${deployment.url}`

    // Update server and create deployment record
    try {
      const supabase = createServerClient()
      const results = await Promise.allSettled([
        supabase
          .from('mcp_servers')
          .update({
            status: 'deployed',
            generated_code: code,
            deployment_url: deploymentUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', server_id),
        supabase.from('deployments').insert({
          server_id,
          vercel_deployment_id: deployment.id,
          version: new Date().toISOString(),
          status: deployment.readyState === 'READY' ? 'ready' : 'building',
          deployment_url: deploymentUrl,
        }),
      ])

      // Log any DB failures but don't fail the deploy response
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error('DB update after deployment failed:', result.reason)
        }
      }
    } catch {
      const idx = localServers.findIndex((s) => s.id === server_id)
      if (idx >= 0) {
        localServers[idx] = {
          ...localServers[idx],
          status: 'deployed',
          generated_code: code,
          deployment_url: deploymentUrl,
        }
      }
    }

    return NextResponse.json({
      deployment_url: deploymentUrl,
      deployment_id: deployment.id,
      status: deployment.readyState,
      code,
    })
  } catch (err: any) {
    console.error('Deploy route error:', err.message)
    return NextResponse.json(
      { error: 'Deployment failed. Please check your configuration and try again.' },
      { status: 500 }
    )
  }
}
