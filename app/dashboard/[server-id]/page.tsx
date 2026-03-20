'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import APIConfigForm from '@/components/APIConfigForm'
import DeploymentStatus from '@/components/DeploymentStatus'
import type { MCPServer, Tool } from '@/lib/supabase'

// Dynamic import for ReactFlow (SSR incompatible)
const VisualBuilder = dynamic(() => import('@/components/VisualBuilder'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-950 rounded-xl border border-surface-800">
      <p className="text-surface-500">Loading builder...</p>
    </div>
  ),
})

type Panel = 'none' | 'add-tool' | 'edit-tool' | 'test-tool' | 'code-preview'

export default function ServerBuilderPage() {
  const params = useParams()
  const serverId = params['server-id'] as string

  const [server, setServer] = useState<MCPServer | null>(null)
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [panel, setPanel] = useState<Panel>('none')
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [testingTool, setTestingTool] = useState<Tool | null>(null)
  const [testInputs, setTestInputs] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testRunning, setTestRunning] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'typescript'>('python')

  useEffect(() => {
    fetchServerAndTools()
  }, [serverId])

  async function fetchServerAndTools() {
    try {
      const [serverRes, toolsRes] = await Promise.all([
        fetch(`/api/servers/${serverId}`),
        fetch(`/api/tools?server_id=${serverId}`),
      ])

      if (serverRes.ok) {
        const data = await serverRes.json()
        setServer(data.server)
      }
      if (toolsRes.ok) {
        const data = await toolsRes.json()
        setTools(data.tools || [])
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  async function saveTool(data: {
    name: string
    description: string
    api_config: Tool['api_config']
    input_schema: Tool['input_schema']
    output_mapping: Tool['output_mapping']
  }) {
    try {
      if (editingTool) {
        // Update existing tool
        const res = await fetch(`/api/tools/${editingTool.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          const updated = await res.json()
          setTools(tools.map((t) => (t.id === editingTool.id ? updated.tool : t)))
        }
      } else {
        // Create new tool
        const res = await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, server_id: serverId }),
        })
        if (res.ok) {
          const created = await res.json()
          setTools([...tools, created.tool])
        }
      }
      setPanel('none')
      setEditingTool(null)
    } catch (err) {
      console.error('Failed to save tool:', err)
    }
  }

  const handleEditTool = useCallback((toolId: string) => {
    const tool = tools.find((t) => t.id === toolId)
    if (tool) {
      setEditingTool(tool)
      setPanel('edit-tool')
    }
  }, [tools])

  const handleDeleteTool = useCallback(async (toolId: string) => {
    if (!confirm('Delete this tool?')) return
    try {
      const res = await fetch(`/api/tools/${toolId}`, { method: 'DELETE' })
      if (res.ok) {
        setTools((prev) => prev.filter((t) => t.id !== toolId))
      }
    } catch (err) {
      console.error('Failed to delete tool:', err)
    }
  }, [])

  const handleTestTool = useCallback((toolId: string) => {
    const tool = tools.find((t) => t.id === toolId)
    if (tool) {
      setTestingTool(tool)
      setTestInputs({})
      setTestResult(null)
      setPanel('test-tool')
    }
  }, [tools])

  async function runTest() {
    if (!testingTool) return
    setTestRunning(true)
    setTestResult(null)

    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: testingTool.id,
          inputs: testInputs,
        }),
      })
      const data = await res.json()
      setTestResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setTestResult(JSON.stringify({ error: 'Test failed', message: String(err) }, null, 2))
    } finally {
      setTestRunning(false)
    }
  }

  async function generateCode() {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId, language: codeLanguage }),
      })
      if (res.ok) {
        const data = await res.json()
        setGeneratedCode(data.code)
        setPanel('code-preview')
      }
    } catch (err) {
      console.error('Failed to generate code:', err)
    }
  }

  async function deployServer() {
    setDeploying(true)
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId, language: codeLanguage }),
      })
      if (res.ok) {
        const data = await res.json()
        setServer((prev) =>
          prev ? { ...prev, status: 'deployed', deployment_url: data.deployment_url } : prev
        )
      } else {
        const data = await res.json()
        alert(`Deployment failed: ${data.error || 'Unknown error'}`)
        setServer((prev) => (prev ? { ...prev, status: 'error' } : prev))
      }
    } catch (err) {
      console.error('Deployment failed:', err)
      setServer((prev) => (prev ? { ...prev, status: 'error' } : prev))
    } finally {
      setDeploying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-surface-500">Loading server...</p>
      </div>
    )
  }

  if (!server) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-surface-400 mb-4">Server not found.</p>
          <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Main canvas area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800 bg-surface-900">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-ghost text-xs">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-white">{server.name}</h1>
              {server.description && (
                <p className="text-xs text-surface-500">{server.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingTool(null)
                setPanel('add-tool')
              }}
              className="btn-secondary text-xs"
            >
              + Add Tool
            </button>
            <button onClick={generateCode} className="btn-ghost text-xs">
              Preview Code
            </button>
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value as 'python' | 'typescript')}
              className="input text-xs py-1.5 px-2 w-auto"
            >
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <VisualBuilder
            tools={tools}
            serverName={server.name}
            onEditTool={handleEditTool}
            onDeleteTool={handleDeleteTool}
            onTestTool={handleTestTool}
          />
        </div>
      </div>

      {/* Side panel */}
      <div className="w-96 border-l border-surface-800 bg-surface-900 overflow-y-auto">
        {panel === 'none' && (
          <div className="p-4 space-y-4">
            <DeploymentStatus
              serverName={server.name}
              status={server.status}
              deploymentUrl={server.deployment_url}
              onDeploy={deployServer}
              deploying={deploying}
            />

            {/* Tools list */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Tools ({tools.length})
              </h3>
              {tools.length === 0 ? (
                <p className="text-sm text-surface-400">
                  No tools yet. Click &quot;Add Tool&quot; to create your first tool.
                </p>
              ) : (
                <div className="space-y-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleEditTool(tool.id)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors"
                    >
                      <p className="text-sm font-mono text-white">{tool.name}</p>
                      <p className="text-xs text-surface-400 truncate">{tool.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(panel === 'add-tool' || panel === 'edit-tool') && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              {panel === 'edit-tool' ? 'Edit Tool' : 'Add New Tool'}
            </h2>
            <APIConfigForm
              tool={editingTool}
              onSave={saveTool}
              onCancel={() => {
                setPanel('none')
                setEditingTool(null)
              }}
            />
          </div>
        )}

        {panel === 'test-tool' && testingTool && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Test: {testingTool.name}</h2>
              <button onClick={() => setPanel('none')} className="btn-ghost text-xs">Close</button>
            </div>

            {/* Input fields */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-surface-300">Inputs</h3>
              {Object.entries(testingTool.input_schema?.properties || {}).map(([key, schema]: [string, any]) => (
                <div key={key}>
                  <label className="label">{key} ({schema.type})</label>
                  <input
                    type="text"
                    className="input font-mono text-sm"
                    placeholder={schema.description || key}
                    value={testInputs[key] || ''}
                    onChange={(e) => setTestInputs({ ...testInputs, [key]: e.target.value })}
                  />
                </div>
              ))}
              {Object.keys(testingTool.input_schema?.properties || {}).length === 0 && (
                <p className="text-sm text-surface-400">No input parameters defined.</p>
              )}
            </div>

            <button
              onClick={runTest}
              disabled={testRunning}
              className="btn-primary w-full"
            >
              {testRunning ? 'Running...' : 'Run Test'}
            </button>

            {/* Test result */}
            {testResult && (
              <div>
                <h3 className="text-sm font-semibold text-surface-300 mb-2">Result</h3>
                <pre className="code-preview text-xs whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}

        {panel === 'code-preview' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Generated Code</h2>
              <button onClick={() => setPanel('none')} className="btn-ghost text-xs">Close</button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setCodeLanguage('python'); generateCode() }}
                className={`btn-ghost text-xs ${codeLanguage === 'python' ? 'bg-surface-800 text-white' : ''}`}
              >
                Python
              </button>
              <button
                onClick={() => { setCodeLanguage('typescript'); generateCode() }}
                className={`btn-ghost text-xs ${codeLanguage === 'typescript' ? 'bg-surface-800 text-white' : ''}`}
              >
                TypeScript
              </button>
            </div>
            {generatedCode ? (
              <pre className="code-preview text-xs whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {generatedCode}
              </pre>
            ) : (
              <p className="text-sm text-surface-400">Generating code...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
