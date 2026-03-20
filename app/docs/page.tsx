export default function DocsPage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Documentation</h1>

        <div className="space-y-12">
          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" id="getting-started">Getting Started</h2>
            <div className="prose prose-invert max-w-none">
              <div className="card space-y-4">
                <h3 className="text-lg font-medium text-white">1. Create an Account</h3>
                <p className="text-surface-400 text-sm">
                  Sign up with your email or GitHub account. The free tier includes 1 server and 100 tool calls per day.
                </p>

                <h3 className="text-lg font-medium text-white">2. Create Your First Server</h3>
                <p className="text-surface-400 text-sm">
                  From the dashboard, click &quot;Create Server&quot;. Give it a name (e.g., &quot;Weather Tools&quot;) and an optional description.
                </p>

                <h3 className="text-lg font-medium text-white">3. Add Tools</h3>
                <p className="text-surface-400 text-sm">
                  Each tool connects to an API endpoint. Configure the HTTP method, authentication, input parameters, and output mapping.
                </p>

                <h3 className="text-lg font-medium text-white">4. Test</h3>
                <p className="text-surface-400 text-sm">
                  Use the built-in test panel to call your tools with sample inputs. Verify the API responds correctly and your output mapping extracts the right fields.
                </p>

                <h3 className="text-lg font-medium text-white">5. Deploy</h3>
                <p className="text-surface-400 text-sm">
                  Click &quot;Deploy to Vercel&quot;. MCPStudio generates the server code and deploys it. You get a live URL in seconds.
                </p>

                <h3 className="text-lg font-medium text-white">6. Connect to Claude Desktop</h3>
                <p className="text-surface-400 text-sm">
                  Copy the MCP configuration JSON and add it to your Claude Desktop settings. Claude can now use your custom tools.
                </p>
              </div>
            </div>
          </section>

          {/* API Configuration */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" id="api-config">API Configuration</h2>
            <div className="card space-y-4">
              <h3 className="text-lg font-medium text-white">Endpoint</h3>
              <p className="text-surface-400 text-sm">
                The full URL of the REST API endpoint your tool will call. Example: <code className="text-brand-400 bg-surface-800 px-1.5 py-0.5 rounded text-xs">https://api.openweathermap.org/data/2.5/weather</code>
              </p>

              <h3 className="text-lg font-medium text-white">HTTP Method</h3>
              <p className="text-surface-400 text-sm">
                GET, POST, PUT, DELETE, or PATCH. Most read operations use GET, while write operations use POST.
              </p>

              <h3 className="text-lg font-medium text-white">Authentication</h3>
              <div className="text-surface-400 text-sm space-y-2">
                <p><strong className="text-surface-300">None</strong> — No authentication required.</p>
                <p><strong className="text-surface-300">API Key</strong> — Sent as an X-API-Key header.</p>
                <p><strong className="text-surface-300">Bearer Token</strong> — Sent as Authorization: Bearer token.</p>
                <p><strong className="text-surface-300">Basic Auth</strong> — Sent as Authorization: Basic base64(credentials).</p>
              </div>

              <h3 className="text-lg font-medium text-white">Input Parameters</h3>
              <p className="text-surface-400 text-sm">
                Define the inputs that Claude will provide when calling the tool. Each parameter has a name, type (string, number, boolean), and description.
                For GET requests, parameters are sent as query strings. For POST/PUT/PATCH, they are sent as JSON body.
              </p>

              <h3 className="text-lg font-medium text-white">Output Mapping</h3>
              <p className="text-surface-400 text-sm">
                Specify which fields from the API response to return. Use dot notation for nested fields.
                Example: <code className="text-brand-400 bg-surface-800 px-1.5 py-0.5 rounded text-xs">main.temp</code> extracts the temperature from an OpenWeather response.
              </p>
            </div>
          </section>

          {/* MCP Configuration */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" id="mcp-config">Claude Desktop Configuration</h2>
            <div className="card space-y-4">
              <p className="text-surface-400 text-sm">
                After deploying, MCPStudio provides a JSON configuration block. Add this to your Claude Desktop config file:
              </p>
              <div className="code-preview">
                <pre className="text-surface-300">{`{
  "mcpServers": {
    "your-server": {
      "url": "https://your-server.vercel.app/mcp",
      "transport": "sse"
    }
  }
}`}</pre>
              </div>
              <p className="text-surface-400 text-sm">
                On macOS, the config file is located at <code className="text-brand-400 bg-surface-800 px-1.5 py-0.5 rounded text-xs">~/Library/Application Support/Claude/claude_desktop_config.json</code>
              </p>
            </div>
          </section>

          {/* Limits */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4" id="limits">Rate Limits</h2>
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-700">
                      <th className="text-left py-3 px-4 text-surface-300 font-medium">Tier</th>
                      <th className="text-left py-3 px-4 text-surface-300 font-medium">Servers</th>
                      <th className="text-left py-3 px-4 text-surface-300 font-medium">Tool Calls/Day</th>
                      <th className="text-left py-3 px-4 text-surface-300 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody className="text-surface-400">
                    <tr className="border-b border-surface-800">
                      <td className="py-3 px-4">Free</td>
                      <td className="py-3 px-4">1</td>
                      <td className="py-3 px-4">100</td>
                      <td className="py-3 px-4">$0</td>
                    </tr>
                    <tr className="border-b border-surface-800">
                      <td className="py-3 px-4">Professional</td>
                      <td className="py-3 px-4">3</td>
                      <td className="py-3 px-4">10,000</td>
                      <td className="py-3 px-4">$29/mo</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Enterprise</td>
                      <td className="py-3 px-4">10</td>
                      <td className="py-3 px-4">100,000</td>
                      <td className="py-3 px-4">$99/mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
