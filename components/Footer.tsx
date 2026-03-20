import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-surface-800 bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <span className="font-semibold text-white">MCPStudio</span>
            </div>
            <p className="text-surface-400 text-sm max-w-md">
              Build custom MCP servers visually. No code required.
              Deploy instantly to Vercel and connect to Claude Desktop.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-sm text-surface-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="text-sm text-surface-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/dashboard" className="text-sm text-surface-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer" className="text-sm text-surface-400 hover:text-white transition-colors">MCP Spec</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-surface-400 hover:text-white transition-colors">GitHub</a></li>
              <li><a href="mailto:support@mcpstudio.dev" className="text-sm text-surface-400 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-8 pt-8 text-center">
          <p className="text-sm text-surface-500">
            &copy; {new Date().getFullYear()} MCPStudio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
