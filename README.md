# MCPStudio

Comprehensive developer toolkit for building, testing, and debugging Model Context Protocol (MCP) servers. Accelerate MCP development with visual tools, schema validation, and integrated debugging.

## Features

- **Visual Server Builder** — Drag-and-drop MCP server scaffolding with pre-built patterns
- **Schema Validation** — Validate resource, prompt, and tool definitions against MCP spec
- **Interactive Debugger** — Step through MCP requests with full state inspection
- **Test Suite Generator** — Auto-generate test cases from your MCP definitions
- **Type Generation** — Create TypeScript types from your MCP schemas
- **Client Simulator** — Test your server with a built-in MCP client
- **Documentation Generator** — Auto-generate API docs from your server definition
- **Protocol Analyzer** — Inspect MCP traffic and identify performance issues

## Quick Start

```bash
npm install -D mcpstudio
npx mcpstudio init
```

```typescript
// With MCPStudio type generation
import { MyServerSchema } from 'mcpstudio/generated/schema';
import { createMCPServer } from 'mcpstudio';

const server = createMCPServer({
  name: 'my-data-server',
  resources: [
    {
      uri: 'database://users/{id}',
      name: 'User',
      description: 'Get a user by ID',
      handler: async (uri) => {
        const id = uri.split('/').pop();
        return { 
          text: JSON.stringify({ id, name: 'User ' + id })
        };
      }
    }
  ],
  tools: [
    {
      name: 'search_users',
      description: 'Search users by name',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' }
        }
      }
    }
  ]
});
```

## Development Tools

- **Local Server Runner** — Run your MCP server with hot reload and error reporting
- **Request Inspector** — See exactly what clients are sending and how your server responds
- **Performance Profiler** — Measure response times and identify bottlenecks
- **Schema Linter** — Validate your MCP definitions against best practices
- **Mock Client** — Test your server without building a real client

## Testing & Quality

- **Unit Test Generator** — Create test files from your MCP schema
- **Integration Tests** — Test real client-server interactions
- **Regression Testing** — Ensure changes don't break existing functionality
- **Coverage Reports** — See which resources and tools are tested
- **Snapshot Testing** — Catch unintended changes in responses

## Use Cases

- **Rapid Prototyping** — Build MCP servers in minutes instead of hours
- **Team Collaboration** — Share MCP definitions as versioned schemas
- **API Documentation** — Auto-generate docs that stay in sync with code
- **Quality Assurance** — Automated testing ensures MCP compliance
- **Performance Optimization** — Profile and optimize your server
- **Training & Onboarding** — Visual builders help new developers learn MCP

## Documentation

- [Full Documentation](https://mcpstudio-docs.vercel.app)
- [MCP Spec Reference](https://mcpstudio-docs.vercel.app/mcp-spec)
- [API Guide](https://mcpstudio-docs.vercel.app/api)
- [Best Practices](https://mcpstudio-docs.vercel.app/best-practices)

## Live Demo

Try MCPStudio: [https://mcpstudio-demo.vercel.app](https://mcpstudio-demo.vercel.app)

## Community

- **GitHub Issues** — [Report bugs and request features](https://github.com/zeros-projects/mcpstudio/issues)
- **Discussions** — [Ask questions and share ideas](https://github.com/zeros-projects/mcpstudio/discussions)

## License

MIT © 2024 MCPStudio
