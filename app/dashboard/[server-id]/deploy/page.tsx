'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { MCPServer } from '@/lib/supabase'
import { generateMCPConfig } from '@/lib/mcp-spec'

export default function DeployPage() {
  const params = useParams()
  const serverId = params['server-id'] as string

  const [server, setServer] = useState<MCPServer | null>(null)
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [language, setLanguage] = useState<'python' | 'typescript'>('python')
  const [copied, setCopied] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/servers/${serverId}`)
        if (res.ok) {
          const data = await res.json()
          setServer(data.server)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [serverId])

  async function handleDeploy() {
    setDeploying(true)
    try {
      // Generate code first
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId, language }),
      })

      if (genRes.ok) {
        const genData = await genRes.json()
        setGeneratedCode(genData.code)
      }

      // Deploy
      const deployRes = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId, language }),
      })

      if (deployRes.ok) {
        const deployData = await deployRes.json()
        setServer((prev) =>
          prev
            ? {
                ...prev,
                status: 'deployed',
                deployment_url: deployData.deployment_url,
                generated_code: deployData.code,
              }
            : prev
        )
      } else {
        const err = await deployRes.json()
        alert(`Deployment failed: ${err.error}`)
      }
    } catch (err) {
      console.error(err)
      alert('Deployment failed')
    } finally {
      setDeploying(false)
    }
  }

  async function copyConfig() {
    if (server?.deployment_url) {
      const config = JSON.stringify(generateMCPConfig(server.name, server.deployment_url), null, 2)
      await navigator.clipboard.writeText(config)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-surface-500">Loading...</p>
      </div>
    )
  }

  if (!server) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-400">Server not found.</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/dashboard/${serverId}`} className="btn-ghost text-xs">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Builder
          </Link>
          <h1 className="text-2xl font-bold text-white">Deploy — {server.name}</h1>
        </div>

        <div className="space-y-6">
          {/* Language selection */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Server Language</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setLanguage('python')}
                className={`btn-secondary flex-1 ${language === 'python' ? 'border-brand-500 text-brand-400' : ''}`}
              >
                Python
              </button>
              <button
                onClick={() => setLanguage('typescript')}
                className={`btn-secondary flex-1 ${language === 'typescript' ? 'border-brand-500 text-brand-400' : ''}`}
              >
                TypeScript
              </button>
            </div>
          </div>

          {/* Deploy button */}
          {server.status !== 'deployed' ? (
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Deploy?</h3>
              <p className="text-sm text-surface-400 mb-6">
                MCPStudio will generate your MCP server code and deploy it to Vercel.
              </p>
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="btn-primary text-base px-8 py-3"
              >
                {deploying ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deploying to Vercel...
                  </span>
                ) : (
                  'Deploy to Vercel'
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Deployment success */}
              <div className="card border-brand-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
                  <h3 className="text-lg font-semibold text-white">Deployed Successfully</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Deployment URL</label>
                    <code className="block text-sm text-brand-400 bg-surface-800 px-4 py-2.5 rounded-lg font-mono">
                      {server.deployment_url}
                    </code>
                  </div>

                  <div>
                    <label className="label">Claude Desktop Configuration</label>
                    <pre className="code-preview text-xs">
                      {JSON.stringify(
                        generateMCPConfig(server.name, server.deployment_url!),
                        null,
                        2
                      )}
                    </pre>
                    <button onClick={copyConfig} className="btn-primary mt-3 text-sm">
                      {copied ? 'Copied!' : 'Copy Configuration'}
                    </button>
                  </div>

                  <div className="bg-surface-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">How to connect to Claude Desktop:</h4>
                    <ol className="text-sm text-surface-400 space-y-1 list-decimal list-inside">
                      <li>Copy the configuration above</li>
                      <li>Open Claude Desktop Settings</li>
                      <li>Go to Developer &gt; MCP Servers</li>
                      <li>Paste the configuration and save</li>
                      <li>Restart Claude Desktop</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Redeploy */}
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="btn-secondary w-full"
              >
                {deploying ? 'Redeploying...' : 'Redeploy'}
              </button>
            </>
          )}

          {/* Generated code preview */}
          {generatedCode && (
            <div className="card">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Generated Code</h3>
              <pre className="code-preview text-xs whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                {generatedCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
