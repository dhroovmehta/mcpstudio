'use client'

import { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import ToolNode from './ToolNode'
import type { ToolNodeData } from './ToolNode'
import type { Tool } from '@/lib/supabase'

interface VisualBuilderProps {
  tools: Tool[]
  serverName: string
  onEditTool: (toolId: string) => void
  onDeleteTool: (toolId: string) => void
  onTestTool: (toolId: string) => void
}

export default function VisualBuilder({
  tools,
  serverName,
  onEditTool,
  onDeleteTool,
  onTestTool,
}: VisualBuilderProps) {
  const nodeTypes = useMemo(() => ({ toolNode: ToolNode }), [])

  // Build nodes from tools
  const initialNodes: Node[] = useMemo(() => {
    // Server node (center-left)
    const serverNode: Node = {
      id: 'server',
      type: 'default',
      position: { x: 50, y: tools.length > 0 ? (tools.length * 100) / 2 : 100 },
      data: {
        label: (
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center mx-auto mb-1">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <div className="text-xs font-medium text-white">{serverName}</div>
            <div className="text-[10px] text-surface-400">{tools.length} tools</div>
          </div>
        ),
      },
      style: {
        background: '#171717',
        border: '1px solid #404040',
        borderRadius: '12px',
        padding: '12px 16px',
        minWidth: '120px',
      },
    }

    // Tool nodes
    const toolNodes: Node[] = tools.map((tool, idx) => ({
      id: tool.id,
      type: 'toolNode',
      position: { x: 350, y: idx * 140 + 20 },
      data: {
        id: tool.id,
        name: tool.name,
        description: tool.description || '',
        method: tool.api_config?.method || 'GET',
        endpoint: tool.api_config?.endpoint || '',
        status: tool.api_config?.endpoint ? 'configured' : 'incomplete',
        onEdit: onEditTool,
        onDelete: onDeleteTool,
        onTest: onTestTool,
      } satisfies ToolNodeData,
    }))

    return [serverNode, ...toolNodes]
  }, [tools, serverName, onEditTool, onDeleteTool, onTestTool])

  // Edges from server to each tool
  const initialEdges: Edge[] = useMemo(
    () =>
      tools.map((tool) => ({
        id: `server-${tool.id}`,
        source: 'server',
        target: tool.id,
        animated: true,
        style: { stroke: '#22c55e', strokeWidth: 2 },
      })),
    [tools]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } }, eds)),
    [setEdges]
  )

  // Update nodes when tools change
  useMemo(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [tools])

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-surface-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-surface-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#262626" />
        <Controls className="!bottom-4 !left-4" />
        <MiniMap
          nodeColor={(node) => (node.id === 'server' ? '#22c55e' : '#404040')}
          maskColor="rgba(0,0,0,0.5)"
          className="!bottom-4 !right-4"
        />
      </ReactFlow>
    </div>
  )
}
