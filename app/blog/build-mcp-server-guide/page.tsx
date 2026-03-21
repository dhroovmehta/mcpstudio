import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Build an MCP Server: Step-by-Step Guide',
  description: 'Complete guide to building a Model Context Protocol (MCP) server from scratch. Learn MCP architecture, configuration, testing, and deployment to production.',
  keywords: [
    'build MCP server',
    'MCP tutorial',
    'Model Context Protocol guide',
    'MCP architecture',
    'MCP configuration',
    'MCP deployment',
    'MCP Python',
    'MCP TypeScript',
  ],
  openGraph: {
    title: 'How to Build an MCP Server: Step-by-Step Guide',
    description: 'Learn to build, configure, test, and deploy MCP servers with this complete step-by-step guide.',
    type: 'article',
    authors: ['MCPStudio'],
  },
}

export default function BuildMCPServerGuide() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Build an MCP Server: Step-by-Step Guide',
    description: 'Complete step-by-step guide to building Model Context Protocol servers.',
    author: { '@type': 'Organization', name: 'MCPStudio' },
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      <div className="mb-12">
        <h1 className="text-5xl font-bold text-surface-950 dark:text-surface-100 mb-4">
          How to Build an MCP Server: Step-by-Step Guide
        </h1>
        <div className="flex items-center gap-4 text-surface-600 dark:text-surface-400">
          <span>By MCPStudio</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2>Introduction: What is an MCP Server?</h2>
        <p>
          A Model Context Protocol (MCP) server exposes custom tools to Claude and other AI assistants. Unlike traditional APIs that return JSON responses, MCP servers define structured tools with inputs, outputs, and descriptions. Claude reads these tool definitions, understands when to use each tool, and invokes them as needed. Building an MCP server is the mechanism by which you "teach Claude new skills" — custom integrations with your data, APIs, and business logic.
        </p>
        <p>
          As the industry has recognized, "custom tools are no longer a luxury — they're the foundation of competitive AI." MCP servers are the standard protocol for delivering these tools. Whether you're building a weather integration, a database query tool, or a complex API wrapper, MCP servers provide a clean, standardized way to extend Claude's capabilities.
        </p>
        <p>
          This guide walks you through building a complete MCP server from scratch, from initial setup through production deployment. You'll learn MCP architecture, how to configure tools, test them interactively, and deploy to Vercel. By the end, you'll have a live MCP server that Claude can call.
        </p>

        <h2>Step 1: Plan Your MCP Server and Define Tools</h2>

        <h3>What Problem Are You Solving?</h3>
        <p>
          Start by identifying what capabilities Claude needs. Common examples include:
        </p>
        <ul>
          <li><strong>Weather Integration:</strong> Provide real-time weather data from OpenWeather API</li>
          <li><strong>Database Queries:</strong> Let Claude query a PostgreSQL database with natural language</li>
          <li><strong>Email Integration:</strong> Enable Claude to send emails or read recent messages</li>
          <li><strong>Payment Processing:</strong> Allow Claude to process payments via Stripe API</li>
          <li><strong>File Operations:</strong> Enable Claude to read/write files from cloud storage</li>
          <li><strong>Custom Business Logic:</strong> Expose internal APIs, microservices, or machine learning models</li>
        </ul>
        <p>
          Define 2-5 tools for your first server. Each tool should handle a specific task (e.g., "get current weather," "search database," "send email"). Too many tools in one server creates complexity; too few limits utility.
        </p>

        <h3>Define Your Tool Schema</h3>
        <p>
          For each tool, define:
        </p>
        <ul>
          <li><strong>Name:</strong> snake_case identifier (e.g., `get_weather`, `search_products`)</li>
          <li><strong>Description:</strong> Human-readable explanation of what the tool does</li>
          <li><strong>Input Parameters:</strong> Required and optional inputs with types and descriptions</li>
          <li><strong>Output:</strong> Expected response format and data structure</li>
        </ul>
        <p>
          Example: A weather tool might have inputs (city: string, units: "fahrenheit" | "celsius") and output (temperature: number, condition: string, humidity: number).
        </p>

        <h2>Step 2: Choose Your Technology Stack</h2>

        <h3>No-Code: MCPStudio</h3>
        <p>
          If you're not a programmer, use <Link href="/" className="text-brand-500 hover:underline">MCPStudio</Link>. The visual builder lets you define tools by filling out forms (tool name, description, API endpoint, parameter mapping). MCPStudio auto-generates Python or TypeScript server code and deploys to Vercel. No coding required. Time to deployment: under 15 minutes.
        </p>

        <h3>Low-Code: Visual Workflow Builder</h3>
        <p>
          Some platforms offer visual workflow designers where you define tool logic using drag-and-drop blocks (like Zapier for MCP). Suitable for non-programmers building complex integrations without full coding.
        </p>

        <h3>Code-First: Python or TypeScript</h3>
        <p>
          For developers, build directly in Python (using anthropic-sdk) or TypeScript (using @anthropic-ai/sdk). This gives maximum flexibility for custom logic, error handling, and optimization. Requires programming knowledge.
        </p>
        <p>
          Python example (starter template):
        </p>
        <pre><code className="language-python">{`import asyncio
import json
from typing import Any
from anthropic import Anthropic

# Initialize Anthropic client
client = Anthropic()

# Define your MCP tools
TOOLS = [
    {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"},
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature units",
                }
            },
            "required": ["city"]
        }
    }
]

# Implement tool handlers
def get_weather(city: str, units: str = "celsius") -> dict[str, Any]:
    # Call external API or database
    return {
        "city": city,
        "temperature": 22,
        "condition": "Sunny",
        "units": units
    }

# Route tool calls
def process_tool_call(tool_name: str, tool_input: dict) -> str:
    if tool_name == "get_weather":
        result = get_weather(**tool_input)
        return json.dumps(result)
    else:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})

# Main loop
async def main():
    messages = [
        {"role": "user", "content": "What's the weather in Paris?"}
    ]

    while True:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages
        )

        # Check if Claude wants to use a tool
        if response.stop_reason == "tool_use":
            for content_block in response.content:
                if content_block.type == "tool_use":
                    tool_result = process_tool_call(
                        content_block.name,
                        content_block.input
                    )
                    messages.append({"role": "assistant", "content": response.content})
                    messages.append({
                        "role": "user",
                        "content": [
                            {
                                "type": "tool_result",
                                "tool_use_id": content_block.id,
                                "content": tool_result
                            }
                        ]
                    })
                    break
        else:
            # Claude finished (no more tool calls)
            print(response.content[0].text)
            break

if __name__ == "__main__":
    asyncio.run(main())`}</code></pre>

        <h2>Step 3: Set Up Your Development Environment</h2>

        <h3>If Using MCPStudio</h3>
        <p>
          No setup needed. Sign up at MCPStudio, create a server, start adding tools.
        </p>

        <h3>If Using Python</h3>
        <ul>
          <li>Install Python 3.10+</li>
          <li>Create a virtual environment: `python -m venv venv`</li>
          <li>Activate it: `source venv/bin/activate` (macOS/Linux) or `venv\Scripts\activate` (Windows)</li>
          <li>Install dependencies: `pip install anthropic requests python-dotenv`</li>
          <li>Create `.env` file with API keys: `ANTHROPIC_API_KEY=sk-...`</li>
        </ul>

        <h3>If Using TypeScript</h3>
        <ul>
          <li>Install Node.js 18+</li>
          <li>Create project: `mkdir my-mcp-server && cd my-mcp-server`</li>
          <li>Initialize npm: `npm init -y && npm install @anthropic-ai/sdk axios dotenv`</li>
          <li>Create `tsconfig.json`: `npx tsc --init`</li>
          <li>Create `.env` with `ANTHROPIC_API_KEY=sk-...`</li>
        </ul>

        <h2>Step 4: Define Your Tools and Implement Handlers</h2>

        <h3>Tool Definition Structure</h3>
        <p>
          Each tool needs:
        </p>
        <ul>
          <li>**name**: Identifier (snake_case)</li>
          <li>**description**: What the tool does (1-2 sentences)</li>
          <li>**input_schema**: JSON Schema describing inputs</li>
        </ul>

        <h3>Example: Weather Tool</h3>
        <pre><code className="language-json">{`{
  "name": "get_weather",
  "description": "Get the current weather for a city using the OpenWeather API",
  "input_schema": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "The name of the city (e.g., 'London', 'Paris')"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature unit (default: celsius)"
      }
    },
    "required": ["city"]
  }
}`}</code></pre>

        <h3>Implement Handler Functions</h3>
        <p>
          For each tool, write a handler function that:
        </p>
        <ol>
          <li>Validates inputs</li>
          <li>Calls external APIs or databases</li>
          <li>Transforms the response</li>
          <li>Returns a clean JSON object</li>
          <li>Handles errors gracefully</li>
        </ol>

        <p>
          Python example:
        </p>
        <pre><code className="language-python">{`import requests
import os

def get_weather(city: str, units: str = "celsius") -> dict:
    """Fetch weather data from OpenWeather API"""
    api_key = os.getenv("OPENWEATHER_API_KEY")

    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={
                "q": city,
                "appid": api_key,
                "units": "metric" if units == "celsius" else "imperial"
            },
            timeout=5
        )
        response.raise_for_status()
        data = response.json()

        return {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": data["main"]["temp"],
            "condition": data["weather"][0]["main"],
            "description": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "units": units
        }
    except requests.RequestException as e:
        return {
            "error": f"Failed to fetch weather: {str(e)}",
            "city": city
        }`}</code></pre>

        <h2>Step 5: Test Your Tools Locally</h2>

        <h3>If Using MCPStudio</h3>
        <p>
          Use the built-in test console. Click each tool, enter sample parameters (city="Paris"), and see the response in real-time. MCPStudio handles all the protocol details — you just test inputs and outputs.
        </p>

        <h3>If Using Code</h3>
        <p>
          Create a test script:
        </p>
        <pre><code className="language-python">{`# test_tools.py
import json
from your_server import process_tool_call

# Test the weather tool
test_input = {"city": "London", "units": "celsius"}
result = process_tool_call("get_weather", test_input)
print(json.dumps(json.loads(result), indent=2))`}</code></pre>

        <p>
          Run: `python test_tools.py`
        </p>

        <h3>Test with Claude Locally</h3>
        <p>
          Run your MCP server locally and test it with Claude Desktop config:
        </p>
        <pre><code className="language-json">{`{
  "mcpServers": {
    "weather": {
      "command": "python",
      "args": ["/path/to/your/server.py"]
    }
  }
}`}</code></pre>

        <h2>Step 6: Configure and Finalize</h2>

        <h3>Error Handling and Timeouts</h3>
        <p>
          Ensure every tool has error handling:
        </p>
        <ul>
          <li>Catch network errors (API unreachable)</li>
          <li>Set request timeouts (avoid hanging forever)</li>
          <li>Return meaningful error messages to Claude</li>
          <li>Log errors for debugging</li>
        </ul>

        <h3>Authentication and Secrets</h3>
        <p>
          Never hardcode API keys in your code. Use environment variables:
        </p>
        <pre><code className="language-python">{`import os
api_key = os.getenv("OPENWEATHER_API_KEY")
if not api_key:
    raise ValueError("OPENWEATHER_API_KEY not set")`}</code></pre>

        <h3>Rate Limiting and Cost Control</h3>
        <p>
          Implement safeguards if calling expensive APIs:
        </p>
        <ul>
          <li>Track API calls per user/day</li>
          <li>Return error if quota exceeded</li>
          <li>Set maximum request size (prevent large queries)</li>
          <li>Cache responses when appropriate</li>
        </ul>

        <h2>Step 7: Deploy Your MCP Server</h2>

        <h3>Option A: Deploy with MCPStudio (One Click)</h3>
        <p>
          In MCPStudio, click "Deploy." Select Vercel as your hosting. MCPStudio handles everything:
        </p>
        <ul>
          <li>Generates production-ready code</li>
          <li>Creates Vercel project</li>
          <li>Configures environment variables</li>
          <li>Deploys and returns a live URL</li>
        </ul>
        <p>
          Total time: 2 minutes.
        </p>

        <h3>Option B: Deploy Manually to Vercel</h3>
        <ol>
          <li>Sign up at <strong>vercel.com</strong></li>
          <li>Create a Git repository (GitHub, GitLab, Bitbucket)</li>
          <li>Push your MCP server code</li>
          <li>In Vercel dashboard, click "New Project"</li>
          <li>Select your Git repository</li>
          <li>Set Environment Variables (OPENWEATHER_API_KEY, etc.)</li>
          <li>Click "Deploy"</li>
          <li>Vercel provides a live URL: `https://my-mcp-server.vercel.app`</li>
        </ol>

        <h3>Option C: Deploy to AWS Lambda or GCP Cloud Functions</h3>
        <p>
          For enterprise deployments, containerize your MCP server (Docker) and deploy to:
        </p>
        <ul>
          <li>AWS ECS (container orchestration)</li>
          <li>AWS Lambda (serverless functions)</li>
          <li>Google Cloud Run (serverless containers)</li>
          <li>Azure Container Instances</li>
        </ul>

        <h2>Step 8: Connect to Claude Desktop</h2>

        <h3>Get Your MCP Configuration</h3>
        <p>
          MCPStudio generates a copy-paste config. If you deployed manually, create config.json:
        </p>
        <pre><code className="language-json">{`{
  "mcpServers": {
    "weather": {
      "url": "https://my-mcp-server.vercel.app"
    }
  }
}`}</code></pre>

        <h3>Update Claude Desktop Config</h3>
        <p>
          Edit Claude Desktop's config file (location varies by OS):
        </p>
        <ul>
          <li><strong>macOS:</strong> `~/Library/Application Support/Claude/claude_desktop_config.json`</li>
          <li><strong>Windows:</strong> `%APPDATA%\Claude\claude_desktop_config.json`</li>
          <li><strong>Linux:</strong> `~/.config/Claude/claude_desktop_config.json`</li>
        </ul>

        <h3>Paste Your MCP Config</h3>
        <pre><code className="language-json">{`{
  "mcpServers": {
    "weather-server": {
      "url": "https://my-mcp-server.vercel.app"
    }
  }
}`}</code></pre>

        <h3>Restart Claude Desktop</h3>
        <p>
          Close and reopen Claude Desktop. In the chat, you should see your tools listed in the tool picker. Try invoking one: "What's the weather in Paris?"
        </p>

        <h2>Step 9: Monitor and Optimize</h2>

        <h3>Track Tool Usage</h3>
        <p>
          Log every tool invocation for monitoring:
        </p>
        <pre><code className="language-python">{`import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_weather(city: str) -> dict:
    logger.info(f"Tool invoked: get_weather, city={city}")
    # ... rest of implementation
    logger.info(f"Tool succeeded: {json.dumps(result)}")
    return result`}</code></pre>

        <h3>Monitor Errors</h3>
        <p>
          Set up error tracking with Sentry, LogRocket, or your cloud provider's logging:
        </p>
        <ul>
          <li>Track API failures (external services down)</li>
          <li>Track invalid inputs (Claude sent unexpected data)</li>
          <li>Track timeout errors (requests taking too long)</li>
          <li>Alert on error rate spikes</li>
        </ul>

        <h3>Optimize Performance</h3>
        <p>
          Once deployed, monitor response times and optimize:
        </p>
        <ul>
          <li>Cache API responses to reduce external calls</li>
          <li>Add connection pooling for databases</li>
          <li>Implement request batching for bulk operations</li>
          <li>Use CDN for static assets</li>
        </ul>

        <h2>Common Pitfalls and Solutions</h2>

        <table>
          <thead>
            <tr>
              <th>Problem</th>
              <th>Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tool not appearing in Claude</td>
              <td>Restart Claude Desktop after updating config. Verify URL is correct and server is running.</td>
            </tr>
            <tr>
              <td>Tool invocation times out</td>
              <td>Add timeout to external API calls. Optimize database queries. Consider caching.</td>
            </tr>
            <tr>
              <td>Claude misusing the tool</td>
              <td>Improve tool description and input examples. Validate inputs strictly.</td>
            </tr>
            <tr>
              <td>API key leaking in logs</td>
              <td>Never log API responses directly. Sanitize sensitive data before logging.</td>
            </tr>
            <tr>
              <td>Deployment fails silently</td>
              <td>Check deployment logs (Vercel dashboard). Test locally first with `mcp-cli`.</td>
            </tr>
          </tbody>
        </table>

        <h2>Next Steps: Advanced Patterns</h2>

        <h3>Tool Composition</h3>
        <p>
          Build complex tools by composing simpler ones. Example: "search_products" calls internal search API, then "get_price" retrieves pricing, then "apply_discount" calculates final price.
        </p>

        <h3>Streaming Responses</h3>
        <p>
          For long-running operations (document processing, data analysis), implement streaming to send partial results back to Claude as they complete.
        </p>

        <h3>Custom Validation</h3>
        <p>
          Validate tool inputs before calling external services. Reject invalid requests early with clear error messages.
        </p>

        <h3>Authentication and Authorization</h3>
        <p>
          If tools access user data, implement:
        </p>
        <ul>
          <li>User authentication (verify Claude user's identity)</li>
          <li>Authorization (check permissions before granting access)</li>
          <li>Rate limiting (prevent abuse)</li>
        </ul>

        <h2>Conclusion</h2>

        <p>
          Building an MCP server is straightforward once you understand the architecture. Start with a simple tool (weather, database query, API wrapper), test locally, deploy, and connect to Claude Desktop. Use MCPStudio for rapid prototyping (no code) or build from scratch if you need custom logic.
        </p>

        <p>
          As you add more tools and scale usage, focus on error handling, monitoring, and performance. Your MCP server is now an extension of Claude — ensure it's reliable, fast, and secure.
        </p>

        <p>
          Ready to get started? Use <Link href="/" className="text-brand-500 hover:underline">MCPStudio</Link> to build your first MCP server in minutes. No coding required.
        </p>
      </div>
    </article>
  )
}
