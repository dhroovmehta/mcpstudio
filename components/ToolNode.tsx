'use client'

import { Handle, Position, type NodeProps } from 'reactflow'

export interface ToolNodeData {
  id: string
  name: string
  description: string
  method: string
  endpoint: string
  status: 'configured' | 'incomplete' | 'error'
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onTest: (id: string) => void
}

export default function ToolNode({ data }: NodeProps<ToolNodeData>) {
  const methodColors: Record<string, string> = {
    GET: 'text-green-400 bg-green-400/10',
    POST: 'text-blue-400 bg-blue-400/10',
    PUT: 'text-yellow-400 bg-yellow-400/10',
    DELETE: 'text-red-400 bg-red-400/10',
    PATCH: 'text-purple-400 bg-purple-400/10',
  }

  const statusColors: Record<string, string> = {
    configured: 'border-brand-500/30',
    incomplete: 'border-yellow-500/30',
    error: 'border-red-500/30',
  }

  return (
    <div className={`bg-surface-900 border ${statusColors[data.status] || 'border-surface-700'} rounded-lg p-4 min-w-[240px] shadow-xl`}>
      <Handle type="target" position={Position.Left} className="!bg-brand-500 !w-3 !h-3 !border-2 !border-surface-900" />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${methodColors[data.method] || 'text-surface-400 bg-surface-800'}`}>
            {data.method}
          </span>
          <span className="text-sm font-medium text-white font-mono">{data.name}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => data.onTest(data.id)}
            className="p-1 text-surface-500 hover:text-brand-400 transition-colors"
            title="Test tool"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </button>
          <button
            onClick={() => data.onEdit(data.id)}
            className="p-1 text-surface-500 hover:text-white transition-colors"
            title="Edit tool"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            onClick={() => data.onDelete(data.id)}
            className="p-1 text-surface-500 hover:text-red-400 transition-colors"
            title="Delete tool"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-xs text-surface-400 mb-2 line-clamp-2">{data.description}</p>
      )}

      {/* Endpoint */}
      {data.endpoint && (
        <p className="text-[10px] text-surface-500 font-mono truncate">{data.endpoint}</p>
      )}

      <Handle type="source" position={Position.Right} className="!bg-brand-500 !w-3 !h-3 !border-2 !border-surface-900" />
    </div>
  )
}
