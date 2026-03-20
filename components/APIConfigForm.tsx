'use client'

import { useState } from 'react'
import type { Tool } from '@/lib/supabase'

interface InputParam {
  name: string
  type: string
  description: string
  required: boolean
}

interface OutputField {
  name: string
  path: string
  type: string
}

interface APIConfigFormProps {
  tool?: Tool | null
  onSave: (data: {
    name: string
    description: string
    api_config: Tool['api_config']
    input_schema: Tool['input_schema']
    output_mapping: Tool['output_mapping']
  }) => void
  onCancel: () => void
}

export default function APIConfigForm({ tool, onSave, onCancel }: APIConfigFormProps) {
  const [name, setName] = useState(tool?.name || '')
  const [description, setDescription] = useState(tool?.description || '')
  const [endpoint, setEndpoint] = useState(tool?.api_config?.endpoint || '')
  const [method, setMethod] = useState<Tool['api_config']['method']>(tool?.api_config?.method || 'GET')
  const [authType, setAuthType] = useState<string>(tool?.api_config?.auth_type || 'none')
  const [authValue, setAuthValue] = useState(tool?.api_config?.auth_value || '')
  const [headers, setHeaders] = useState<Record<string, string>>(tool?.api_config?.headers || {})
  const [bodyTemplate, setBodyTemplate] = useState(tool?.api_config?.body_template || '')

  const [inputs, setInputs] = useState<InputParam[]>(
    tool?.input_schema?.properties
      ? Object.entries(tool.input_schema.properties).map(([key, val]: [string, any]) => ({
          name: key,
          type: val.type || 'string',
          description: val.description || '',
          required: (tool.input_schema.required || []).includes(key),
        }))
      : [{ name: '', type: 'string', description: '', required: false }]
  )

  const [outputs, setOutputs] = useState<OutputField[]>(
    tool?.output_mapping?.fields || [{ name: '', path: '', type: 'string' }]
  )

  const [headerKey, setHeaderKey] = useState('')
  const [headerValue, setHeaderValue] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  function addInput() {
    setInputs([...inputs, { name: '', type: 'string', description: '', required: false }])
  }

  function removeInput(idx: number) {
    setInputs(inputs.filter((_, i) => i !== idx))
  }

  function updateInput(idx: number, field: keyof InputParam, value: string | boolean) {
    const updated = [...inputs]
    ;(updated[idx] as any)[field] = value
    setInputs(updated)
  }

  function addOutput() {
    setOutputs([...outputs, { name: '', path: '', type: 'string' }])
  }

  function removeOutput(idx: number) {
    setOutputs(outputs.filter((_, i) => i !== idx))
  }

  function updateOutput(idx: number, field: keyof OutputField, value: string) {
    const updated = [...outputs]
    updated[idx][field] = value
    setOutputs(updated)
  }

  function addHeader() {
    if (headerKey.trim()) {
      setHeaders({ ...headers, [headerKey.trim()]: headerValue })
      setHeaderKey('')
      setHeaderValue('')
    }
  }

  function removeHeader(key: string) {
    const updated = { ...headers }
    delete updated[key]
    setHeaders(updated)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors: string[] = []

    if (!name.trim()) validationErrors.push('Tool name is required')
    if (!/^[a-z][a-z0-9_]*$/.test(name)) validationErrors.push('Tool name: lowercase letters, numbers, underscores only. Must start with a letter.')
    if (!description.trim()) validationErrors.push('Description is required')
    if (!endpoint.trim()) validationErrors.push('Endpoint URL is required')

    // Filter empty inputs/outputs
    const validInputs = inputs.filter((i) => i.name.trim())
    const validOutputs = outputs.filter((o) => o.name.trim() && o.path.trim())

    if (validOutputs.length === 0) validationErrors.push('At least one output field is required')

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])

    const properties: Record<string, { type: string; description: string }> = {}
    const required: string[] = []
    validInputs.forEach((input) => {
      properties[input.name] = { type: input.type, description: input.description }
      if (input.required) required.push(input.name)
    })

    onSave({
      name: name.trim(),
      description: description.trim(),
      api_config: {
        endpoint: endpoint.trim(),
        method,
        auth_type: authType as Tool['api_config']['auth_type'],
        auth_value: authValue,
        headers,
        body_template: bodyTemplate || undefined,
      },
      input_schema: {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      },
      output_mapping: {
        fields: validOutputs,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-400">{err}</p>
          ))}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Tool Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tool Name</label>
            <input
              type="text"
              className="input font-mono"
              placeholder="get_weather"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            />
            <p className="text-xs text-surface-500 mt-1">Lowercase, underscores only</p>
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              placeholder="Get current weather for a city"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">API Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <label className="label">Method</label>
            <select
              className="input"
              value={method}
              onChange={(e) => setMethod(e.target.value as Tool['api_config']['method'])}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="label">Endpoint URL</label>
            <input
              type="url"
              className="input font-mono text-sm"
              placeholder="https://api.example.com/v1/data"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>
        </div>

        {/* Authentication */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Authentication</label>
            <select
              className="input"
              value={authType}
              onChange={(e) => setAuthType(e.target.value)}
            >
              <option value="none">None</option>
              <option value="api_key">API Key</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
            </select>
          </div>
          {authType !== 'none' && (
            <div>
              <label className="label">
                {authType === 'api_key' ? 'API Key' : authType === 'bearer' ? 'Token' : 'Credentials (user:pass)'}
              </label>
              <input
                type="password"
                className="input font-mono text-sm"
                placeholder="Enter value..."
                value={authValue}
                onChange={(e) => setAuthValue(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Custom Headers */}
        <div>
          <label className="label">Custom Headers</label>
          <div className="space-y-2">
            {Object.entries(headers).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-surface-400 font-mono">{key}: {val}</span>
                <button type="button" onClick={() => removeHeader(key)} className="text-red-400 text-xs hover:text-red-300">
                  Remove
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1 text-sm"
                placeholder="Header name"
                value={headerKey}
                onChange={(e) => setHeaderKey(e.target.value)}
              />
              <input
                type="text"
                className="input flex-1 text-sm"
                placeholder="Header value"
                value={headerValue}
                onChange={(e) => setHeaderValue(e.target.value)}
              />
              <button type="button" onClick={addHeader} className="btn-ghost text-sm">Add</button>
            </div>
          </div>
        </div>

        {/* Body Template (for POST/PUT/PATCH) */}
        {['POST', 'PUT', 'PATCH'].includes(method) && (
          <div>
            <label className="label">Body Template (JSON, optional)</label>
            <textarea
              className="input font-mono text-sm min-h-[80px]"
              placeholder='{"query": "{{input_name}}"}'
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
            />
            <p className="text-xs text-surface-500 mt-1">Leave blank to auto-build from input params</p>
          </div>
        )}
      </div>

      {/* Input Parameters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Input Parameters</h3>
          <button type="button" onClick={addInput} className="btn-ghost text-xs">
            + Add Parameter
          </button>
        </div>
        <div className="space-y-3">
          {inputs.map((input, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
              <input
                type="text"
                className="input col-span-3 text-sm font-mono"
                placeholder="param_name"
                value={input.name}
                onChange={(e) => updateInput(idx, 'name', e.target.value.replace(/[^a-z0-9_]/gi, '_'))}
              />
              <select
                className="input col-span-2 text-sm"
                value={input.type}
                onChange={(e) => updateInput(idx, 'type', e.target.value)}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="integer">Integer</option>
                <option value="boolean">Boolean</option>
              </select>
              <input
                type="text"
                className="input col-span-4 text-sm"
                placeholder="Description"
                value={input.description}
                onChange={(e) => updateInput(idx, 'description', e.target.value)}
              />
              <label className="col-span-2 flex items-center gap-1.5 h-[46px]">
                <input
                  type="checkbox"
                  checked={input.required}
                  onChange={(e) => updateInput(idx, 'required', e.target.checked)}
                  className="rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs text-surface-400">Required</span>
              </label>
              <button
                type="button"
                onClick={() => removeInput(idx)}
                className="col-span-1 h-[46px] flex items-center justify-center text-surface-500 hover:text-red-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Output Mapping */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Output Mapping</h3>
          <button type="button" onClick={addOutput} className="btn-ghost text-xs">
            + Add Field
          </button>
        </div>
        <p className="text-xs text-surface-500">Map API response fields to tool output. Use dot notation for nested fields (e.g., main.temp).</p>
        <div className="space-y-3">
          {outputs.map((output, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
              <input
                type="text"
                className="input col-span-4 text-sm font-mono"
                placeholder="output_name"
                value={output.name}
                onChange={(e) => updateOutput(idx, 'name', e.target.value)}
              />
              <input
                type="text"
                className="input col-span-4 text-sm font-mono"
                placeholder="data.field.path"
                value={output.path}
                onChange={(e) => updateOutput(idx, 'path', e.target.value)}
              />
              <select
                className="input col-span-3 text-sm"
                value={output.type}
                onChange={(e) => updateOutput(idx, 'type', e.target.value)}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
              </select>
              <button
                type="button"
                onClick={() => removeOutput(idx)}
                className="col-span-1 h-[46px] flex items-center justify-center text-surface-500 hover:text-red-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-surface-800">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {tool ? 'Update Tool' : 'Add Tool'}
        </button>
      </div>
    </form>
  )
}
