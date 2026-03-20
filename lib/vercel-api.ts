// Vercel Deployments API integration
// Creates projects and deployments programmatically

import { fetchWithRetry } from '@/lib/utils'

const VERCEL_API_BASE = 'https://api.vercel.com'

interface VercelFile {
  file: string
  data: string // base64 encoded
}

interface CreateDeploymentResponse {
  id: string
  url: string
  readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR'
}

interface DeploymentStatusResponse {
  id: string
  url: string
  readyState: string
  alias?: string[]
}

function getToken(): string {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) throw new Error('VERCEL_API_TOKEN is not set')
  return token
}

// Deploy files directly to Vercel (no GitHub needed)
export async function createDeployment(
  projectName: string,
  files: Array<{ file: string; data: string }>
): Promise<CreateDeploymentResponse> {
  const token = getToken()

  // Encode file contents to base64 (Vercel wants either encoding: "base64" or raw data)
  const vercelFiles = files.map((f) => ({
    file: f.file,
    data: Buffer.from(f.data).toString('base64'),
    encoding: 'base64' as const,
  }))

  const response = await fetchWithRetry(`${VERCEL_API_BASE}/v13/deployments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      files: vercelFiles,
      projectSettings: {
        framework: null, // raw deployment
      },
    }),
    timeoutMs: 30_000,
    retries: 1,
    retryDelayMs: 5_000,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Vercel deployment failed: ${response.status} ${error}`)
  }

  return response.json()
}

// Check deployment status
export async function getDeploymentStatus(deploymentId: string): Promise<DeploymentStatusResponse> {
  const token = getToken()

  const response = await fetchWithRetry(`${VERCEL_API_BASE}/v13/deployments/${deploymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeoutMs: 30_000,
    retries: 1,
    retryDelayMs: 5_000,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get deployment status: ${response.status} ${error}`)
  }

  return response.json()
}

// Delete a deployment
export async function deleteDeployment(deploymentId: string): Promise<void> {
  const token = getToken()

  const response = await fetchWithRetry(`${VERCEL_API_BASE}/v13/deployments/${deploymentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeoutMs: 30_000,
    retries: 1,
    retryDelayMs: 5_000,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete deployment: ${response.status} ${error}`)
  }
}

// Prepare deployment files for a Python MCP server
export function preparePythonDeploymentFiles(
  code: string,
  requirements: string,
  serverName: string
): Array<{ file: string; data: string }> {
  return [
    {
      file: 'api/index.py',
      data: code,
    },
    {
      file: 'requirements.txt',
      data: requirements,
    },
    {
      file: 'vercel.json',
      data: JSON.stringify({
        version: 2,
        builds: [
          {
            src: 'api/index.py',
            use: '@vercel/python',
          },
        ],
        routes: [
          { src: '/(.*)', dest: '/api/index.py' },
        ],
      }, null, 2),
    },
  ]
}

// Prepare deployment files for a TypeScript MCP server
export function prepareTSDeploymentFiles(
  code: string,
  packageJson: string,
  serverName: string
): Array<{ file: string; data: string }> {
  return [
    {
      file: 'api/index.ts',
      data: code,
    },
    {
      file: 'package.json',
      data: packageJson,
    },
    {
      file: 'vercel.json',
      data: JSON.stringify({
        version: 2,
        builds: [
          {
            src: 'api/index.ts',
            use: '@vercel/node',
          },
        ],
        routes: [
          { src: '/(.*)', dest: '/api/index.ts' },
        ],
      }, null, 2),
    },
    {
      file: 'tsconfig.json',
      data: JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          esModuleInterop: true,
          strict: true,
          outDir: './dist',
        },
        include: ['api/**/*.ts'],
      }, null, 2),
    },
  ]
}
