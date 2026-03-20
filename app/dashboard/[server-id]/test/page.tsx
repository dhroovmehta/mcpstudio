'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Tool, MCPServer } from '@/lib/supabase'

export default function TestPage() {
  const params = useParams()
  const serverId = params['server-id'] as string

  const [server, setServer] = useState<MCPServer | null>(null)
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
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
          if (data.tools?.length > 0) setSelectedTool(data.tools[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [serverId])

  async function runTest() {
    if (!selectedTool) return
    setRunning(true)
    setResult(null)

    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id: selectedTool.id, inputs }),
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setResult(JSON.stringify({ error: 'Test failed', message: String(err) }, null, 2))
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-surface-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/dashboard/${serverId}`} className="btn-ghost text-xs">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Builder
          </Link>
          <h1 className="text-2xl font-bold text-white">Test Tools — {server?.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Tool Selection + Inputs */}
          <div className="space-y-4">
            {/* Tool selector */}
            <div className="card">
              <label className="label">Select Tool</label>
              <select
                className="input"
                value={selectedTool?.id || ''}
                onChange={(e) => {
                  const tool = tools.find((t) => t.id === e.target.value)
                  setSelectedTool(tool || null)
                  setInputs({})
                  setResult(null)
                }}
              >
                {tools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} — {tool.api_config?.method} {tool.api_config?.endpoint}
                  </option>
                ))}
              </select>
            </div>

            {/* Input fields */}
            {selectedTool && (
              <div className="card space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Input Parameters</h3>
                {Object.entries(selectedTool.input_schema?.properties || {}).map(
                  ([key, schema]: [string, any]) => (
                    <div key={key}>
                      <label className="label">
                        {key}
                        <span className="text-surface-500 ml-2">({schema.type})</span>
                        {(selectedTool.input_schema?.required || []).includes(key) && (
                          <span className="text-red-400 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        className="input font-mono text-sm"
                        placeholder={schema.description || key}
                        value={inputs[key] || ''}
                        onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                      />
                    </div>
                  )
                )}

                {Object.keys(selectedTool.input_schema?.properties || {}).length === 0 && (
                  <p className="text-sm text-surface-400">No input parameters.</p>
                )}

                <button
                  onClick={runTest}
                  disabled={running}
                  className="btn-primary w-full"
                >
                  {running ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Running...
                    </span>
                  ) : (
                    'Run Test'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right: Result */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Result</h3>
            {result ? (
              <pre className="code-preview text-xs whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {result}
              </pre>
            ) : (
              <p className="text-sm text-surface-400">
                Run a test to see the API response and mapped output.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
