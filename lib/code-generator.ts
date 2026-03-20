import Handlebars from 'handlebars'
import type { Tool as ToolType } from './supabase'
import { sanitizeForCodeGen } from './validation'

// Python MCP server template
const PYTHON_TEMPLATE = `# Generated MCP Server — Built with MCPStudio
# Server: {{serverName}}
# Generated: {{timestamp}}

from mcp.server.fastmcp import FastMCP
import httpx
import json
import os

mcp = FastMCP("{{serverName}}")

{{#each tools}}
@mcp.tool()
async def {{this.funcName}}({{this.inputParams}}) -> str:
    """{{this.description}}"""

    headers = {{this.headersJson}}
    {{#if this.hasAuth}}
    # Authentication
    {{this.authCode}}
    {{/if}}

    async with httpx.AsyncClient() as client:
        response = await client.{{this.methodLower}}(
            "{{this.endpoint}}",
            headers=headers,
            {{#if this.hasBody}}
            json={{this.bodyJson}},
            {{/if}}
            {{#if this.hasParams}}
            params={{this.paramsJson}},
            {{/if}}
        )
        response.raise_for_status()

    data = response.json()
    result = {}
    {{#each this.outputs}}
    # Extract: {{this.name}}
    _val = data
    for _key in "{{this.path}}".split("."):
        if isinstance(_val, dict):
            _val = _val.get(_key)
        elif isinstance(_val, list) and _key.isdigit():
            _val = _val[int(_key)] if int(_key) < len(_val) else None
        else:
            _val = None
    result["{{this.name}}"] = _val
    {{/each}}

    return json.dumps(result)

{{/each}}

if __name__ == "__main__":
    mcp.run(transport="sse")
`

// TypeScript MCP server template
const TYPESCRIPT_TEMPLATE = `// Generated MCP Server — Built with MCPStudio
// Server: {{serverName}}
// Generated: {{timestamp}}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import express from "express";

const server = new McpServer({
  name: "{{serverName}}",
  version: "1.0.0",
});

{{#each tools}}
server.tool(
  "{{this.name}}",
  "{{this.description}}",
  {
    {{#each this.zodParams}}
    {{this.name}}: z.{{this.zodType}}().describe("{{this.description}}"),
    {{/each}}
  },
  async ({{{this.destructuredParams}}}) => {
    const headers: Record<string, string> = {{{this.headersJsonTs}}};
    {{#if this.hasAuth}}
    // Authentication
    {{this.authCodeTs}}
    {{/if}}

    const response = await fetch("{{this.endpoint}}", {
      method: "{{this.method}}",
      headers,
      {{#if this.hasBody}}
      body: JSON.stringify({{{this.bodyJsonTs}}}),
      {{/if}}
    });

    if (!response.ok) {
      return { content: [{ type: "text", text: \`API error: \${response.status} \${response.statusText}\` }] };
    }

    const data = await response.json();
    const result: Record<string, unknown> = {};
    {{#each this.outputs}}
    result["{{this.name}}"] = "{{this.path}}".split(".").reduce((o: any, k: string) => o?.[k], data);
    {{/each}}

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

{{/each}}

const app = express();

let transport: SSEServerTransport | null = null;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).json({ error: "Not connected" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`MCP server running on port \${PORT}\`);
});
`

// Helper: convert tool config to template data
function prepareToolData(tool: ToolType) {
  const apiConfig = tool.api_config
  const inputSchema = tool.input_schema
  const outputMapping = tool.output_mapping

  // Function name (Python safe — strip anything that isn't alphanumeric/underscore)
  const funcName = tool.name.replace(/[^a-z0-9_]/gi, '_').toLowerCase()
  // Validate function name starts with a letter
  const safeFuncName = /^[a-z]/.test(funcName) ? funcName : `fn_${funcName}`

  // Input params for Python — sanitize property names to prevent code injection
  const properties = inputSchema?.properties || {}
  const safeProperties: Record<string, any> = {}
  for (const [name, schema] of Object.entries(properties)) {
    const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_')
    if (/^[a-zA-Z_]/.test(safeName)) {
      safeProperties[safeName] = schema
    }
  }
  const inputParams = Object.entries(safeProperties)
    .map(([name, schema]: [string, any]) => {
      const pyType = schema.type === 'number' ? 'float' : schema.type === 'integer' ? 'int' : schema.type === 'boolean' ? 'bool' : 'str'
      return `${name}: ${pyType}`
    })
    .join(', ')

  // Zod params for TypeScript — use sanitized property names
  const zodParams = Object.entries(safeProperties).map(([name, schema]: [string, any]) => ({
    name,
    zodType: schema.type === 'number' ? 'number' : schema.type === 'integer' ? 'number' : schema.type === 'boolean' ? 'boolean' : 'string',
    description: sanitizeForCodeGen(schema.description || name),
  }))

  // Headers
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(apiConfig.headers || {}) }

  // Auth
  let authCode = ''
  let authCodeTs = ''
  const hasAuth = apiConfig.auth_type !== 'none'
  if (apiConfig.auth_type === 'api_key') {
    authCode = `headers["X-API-Key"] = os.environ.get("API_KEY", "${apiConfig.auth_value || ''}")`
    authCodeTs = `headers["X-API-Key"] = process.env.API_KEY || "${apiConfig.auth_value || ''}";`
  } else if (apiConfig.auth_type === 'bearer') {
    authCode = `headers["Authorization"] = f"Bearer {os.environ.get('API_TOKEN', '${apiConfig.auth_value || ''}')}"`
    authCodeTs = `headers["Authorization"] = \`Bearer \${process.env.API_TOKEN || "${apiConfig.auth_value || ''}"}\`;`
  } else if (apiConfig.auth_type === 'basic') {
    authCode = `import base64\n    headers["Authorization"] = f"Basic {base64.b64encode(os.environ.get('API_CREDENTIALS', '${apiConfig.auth_value || ''}').encode()).decode()}"`
    authCodeTs = `headers["Authorization"] = \`Basic \${Buffer.from(process.env.API_CREDENTIALS || "${apiConfig.auth_value || ''}").toString("base64")}\`;`
  }

  // Body template — substitute input params
  let bodyJson = '{}'
  let bodyJsonTs = '{}'
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(apiConfig.method)
  if (hasBody && apiConfig.body_template) {
    bodyJson = apiConfig.body_template
    bodyJsonTs = apiConfig.body_template
  } else if (hasBody) {
    // Auto-build body from input params (use sanitized property names)
    const bodyEntries = Object.keys(safeProperties).map(name => `"${name}": ${name}`)
    bodyJson = `{${bodyEntries.join(', ')}}`
    bodyJsonTs = `{${Object.keys(safeProperties).map(n => `${n}`).join(', ')}}`
  }

  // Query params for GET
  const hasParams = apiConfig.method === 'GET' && Object.keys(safeProperties).length > 0
  const paramsEntries = Object.keys(safeProperties).map(name => `"${name}": ${name}`)
  const paramsJson = `{${paramsEntries.join(', ')}}`

  // Output mapping — sanitize field names and paths
  const outputs = (outputMapping?.fields || []).map((f: { name: string; path: string; type: string }) => ({
    name: f.name.replace(/[^a-zA-Z0-9_]/g, '_'),
    path: f.path.replace(/[^a-zA-Z0-9_.]/g, ''),
  }))

  // Destructured params string for TypeScript callback
  const destructuredParams = Object.keys(safeProperties).length > 0
    ? ` ${Object.keys(safeProperties).join(', ')} `
    : ''

  return {
    name: tool.name.replace(/[^a-z0-9_]/gi, '_').toLowerCase(),
    funcName: safeFuncName,
    description: sanitizeForCodeGen(tool.description || ''),
    endpoint: apiConfig.endpoint,
    method: apiConfig.method,
    methodLower: apiConfig.method.toLowerCase(),
    inputParams,
    zodParams,
    destructuredParams,
    headersJson: JSON.stringify(headers),
    headersJsonTs: JSON.stringify(headers),
    hasAuth,
    authCode,
    authCodeTs,
    hasBody,
    bodyJson,
    bodyJsonTs,
    hasParams,
    paramsJson,
    outputs,
  }
}

export function generatePythonCode(serverName: string, tools: ToolType[]): string {
  const template = Handlebars.compile(PYTHON_TEMPLATE)
  return template({
    serverName,
    timestamp: new Date().toISOString(),
    tools: tools.map(prepareToolData),
  })
}

export function generateTypeScriptCode(serverName: string, tools: ToolType[]): string {
  const template = Handlebars.compile(TYPESCRIPT_TEMPLATE)
  return template({
    serverName,
    timestamp: new Date().toISOString(),
    tools: tools.map(prepareToolData),
  })
}

// Generate requirements.txt for Python
export function generatePythonRequirements(): string {
  return `mcp[cli]>=1.0.0
httpx>=0.25.0
uvicorn>=0.24.0
`
}

// Generate package.json for TypeScript
export function generateTSPackageJson(serverName: string): string {
  return JSON.stringify({
    name: serverName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'tsx index.ts',
      build: 'tsc',
    },
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.0.0',
      express: '^4.18.0',
      zod: '^3.22.0',
      tsx: '^4.7.0',
    },
    devDependencies: {
      '@types/express': '^4.17.0',
      typescript: '^5.3.0',
    },
  }, null, 2)
}
