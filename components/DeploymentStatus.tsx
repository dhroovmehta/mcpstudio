'use client'

import { useState } from 'react'
import { generateMCPConfig } from '@/lib/mcp-spec'

interface DeploymentStatusProps {
  serverName: string
  status: 'draft' | 'deployed' | 'error'
  deploymentUrl: string | null
  onDeploy: () => void
  deploying: boolean
}

export default function DeploymentStatus({
  serverName,
  status,
  deploymentUrl,
  onDeploy,
  deploying,
}: DeploymentStatusProps) {
  const [copied, setCopied] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  const mcpConfig = deploymentUrl
    ? JSON.stringify(generateMCPConfig(serverName, deploymentUrl), null, 2)
    : null

  async function copyConfig() {
    if (mcpConfig) {
      await navigator.clipboard.writeText(mcpConfig)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="card space-y-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Deployment</h3>

      {/* Status indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          status === 'deployed' ? 'bg-brand-500 animate-pulse' :
          status === 'error' ? 'bg-red-500' :
          'bg-surface-600'
        }`} />
        <span className="text-sm text-surface-300 capitalize">{status}</span>
      </div>

      {/* Deploy button */}
      {status !== 'deployed' && (
        <button
          onClick={onDeploy}
          disabled={deploying}
          className="btn-primary w-full"
        >
          {deploying ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Deploying...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
              Deploy to Vercel
            </>
          )}
        </button>
      )}

      {/* Deployed info */}
      {status === 'deployed' && deploymentUrl && (
        <>
          <div>
            <label className="label">Deployment URL</label>
            <div className="flex items-center gap-2">
              <code className="text-xs text-brand-400 bg-surface-800 px-3 py-2 rounded-lg flex-1 truncate font-mono">
                {deploymentUrl}
              </code>
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs"
              >
                Open
              </a>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn-secondary w-full text-sm"
          >
            {showConfig ? 'Hide' : 'Show'} Claude Desktop Config
          </button>

          {showConfig && mcpConfig && (
            <div className="relative">
              <pre className="code-preview text-xs whitespace-pre-wrap">{mcpConfig}</pre>
              <button
                onClick={copyConfig}
                className="absolute top-2 right-2 btn-ghost text-xs"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          <button onClick={onDeploy} disabled={deploying} className="btn-ghost w-full text-sm">
            {deploying ? 'Redeploying...' : 'Redeploy'}
          </button>
        </>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-400">
          Deployment failed. Check your configuration and try again.
        </p>
      )}
    </div>
  )
}
