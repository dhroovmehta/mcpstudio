'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { MCPServer } from '@/lib/supabase'

export default function DashboardPage() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchServers()
  }, [])

  async function fetchServers() {
    try {
      const res = await fetch('/api/servers')
      if (res.ok) {
        const data = await res.json()
        setServers(data.servers || [])
      }
    } catch (err) {
      console.error('Failed to fetch servers:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createServer(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setServers([data.server, ...servers])
        setNewName('')
        setNewDescription('')
        setShowCreate(false)
      }
    } catch (err) {
      console.error('Failed to create server:', err)
    } finally {
      setCreating(false)
    }
  }

  async function deleteServer(id: string) {
    if (!confirm('Are you sure you want to delete this server?')) return

    try {
      const res = await fetch(`/api/servers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setServers(servers.filter((s) => s.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete server:', err)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return <span className="badge-deployed">Deployed</span>
      case 'error':
        return <span className="badge-error">Error</span>
      default:
        return <span className="badge-draft">Draft</span>
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Servers</h1>
            <p className="text-sm text-surface-400 mt-1">
              Build and manage your MCP servers
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Server
          </button>
        </div>

        {/* Create server modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card max-w-md w-full">
              <h2 className="text-lg font-semibold text-white mb-4">Create New Server</h2>
              <form onSubmit={createServer} className="space-y-4">
                <div>
                  <label className="label">Server Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Weather Assistant"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="label">Description (optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="What does this server do?"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Server'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Server list */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-surface-800 rounded w-2/3 mb-3" />
                <div className="h-3 bg-surface-800 rounded w-full mb-2" />
                <div className="h-3 bg-surface-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : servers.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No servers yet</h3>
            <p className="text-sm text-surface-400 mb-6">
              Create your first MCP server to get started.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Create Your First Server
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => (
              <div key={server.id} className="card hover:border-surface-700 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  {statusBadge(server.status)}
                  <button
                    onClick={() => deleteServer(server.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-surface-500 hover:text-red-400"
                    title="Delete server"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">{server.name}</h3>
                {server.description && (
                  <p className="text-sm text-surface-400 mb-4">{server.description}</p>
                )}

                {server.deployment_url && (
                  <p className="text-xs text-surface-500 font-mono mb-4 truncate">
                    {server.deployment_url}
                  </p>
                )}

                <Link
                  href={`/dashboard/${server.id}`}
                  className="btn-secondary w-full text-center text-sm"
                >
                  Open Builder
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
