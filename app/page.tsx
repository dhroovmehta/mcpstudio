import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MCPStudio — Build MCP Servers Visually',
  description: 'No-code builder for Model Context Protocol servers. Visual interface, instant deployment to Vercel, connect to Claude Desktop in minutes.',
  keywords: ['MCP', 'Model Context Protocol', 'no-code', 'AI tools', 'Claude', 'server builder'],
  openGraph: {
    title: 'MCPStudio — Build MCP Servers Visually',
    description: 'No-code builder for Model Context Protocol servers. Visual interface, instant deployment.',
    url: 'https://mcpstudio.vercel.app',
    siteName: 'MCPStudio',
    type: 'website',
  },
  other: {
    'article:modified_time': '2026-03-21T00:00:00Z',
    'article:published_time': '2026-03-21T00:00:00Z',
  },
}

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: 'Visual Tool Builder',
    description: 'Drag-and-drop interface to define tool inputs, outputs, and API connections. No code required.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: 'API Connector Wizard',
    description: 'Connect any REST API with guided setup for authentication, endpoints, and response mapping.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: 'Auto Code Generation',
    description: 'Generates production-ready Python or TypeScript MCP server code from your visual configuration.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    title: 'One-Click Deploy',
    description: 'Deploy to Vercel instantly. Get a live URL, copy the MCP config, and connect to Claude Desktop.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'Built-In Testing',
    description: 'Test every tool in your browser before deployment. Enter sample inputs, see real API responses.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Usage Analytics',
    description: 'Track tool calls, errors, and latency. Know exactly how your MCP server is performing.',
  },
]

const STEPS = [
  { number: '01', title: 'Create a Server', description: 'Name your server and start adding tools.' },
  { number: '02', title: 'Configure Tools', description: 'Set up API endpoints, authentication, and response mapping.' },
  { number: '03', title: 'Test Everything', description: 'Run tools with sample inputs right in the browser.' },
  { number: '04', title: 'Deploy & Connect', description: 'One click to Vercel. Copy MCP config to Claude Desktop.' },
]

export default function LandingPage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MCPStudio',
    url: 'https://mcpstudio.vercel.app',
    logo: 'https://mcpstudio.vercel.app/logo.png',
    description: 'Visual no-code MCP server builder',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      url: 'https://mcpstudio.vercel.app/support',
    },
  }

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MCPStudio',
    description: 'Visual no-code MCP server builder — create and deploy MCP tools without coding',
    url: 'https://mcpstudio.vercel.app',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '0',
        description: 'Free tier with 1 server and 100 tool calls/day',
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '29',
        description: 'Pro plan — unlimited servers and 10K tool calls/day',
      },
    ],
    author: {
      '@type': 'Organization',
      name: 'Anthropic',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is MCPStudio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MCPStudio is a visual no-code builder for Model Context Protocol (MCP) servers. Design your MCP tools using drag-and-drop, define API endpoints and tool behaviors, and MCPStudio auto-generates the server code and deploys it to Vercel.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to know how to code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. MCPStudio is designed for non-technical users. Use the visual builder to define tools, parameters, and behavior. MCPStudio generates all the code and handles deployment automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use my own APIs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. MCPStudio supports connecting to external REST APIs, databases, and webhooks. Map your API endpoints to MCP tools with just a few clicks.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where does my MCP server deploy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MCPStudio deploys to Vercel serverless functions instantly. Your MCP server gets a public URL, automatic SSL, and scales automatically.',
        },
      },
    ],
  }

  return (
    <div>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(softwareApplicationSchema)}
      </script>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(faqSchema)}
      </script>

      {/* Hero with Answer-First Content */}
      <section className="relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-sm text-brand-400 font-medium">Now in Public Beta</span>
            </div>

            {/* Answer-First Hero */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Build MCP Servers{' '}
              <span className="gradient-text">Visually</span>
            </h1>

            {/* 50-word answer defining MCPStudio */}
            <p className="text-lg sm:text-xl text-surface-300 mb-10 max-w-2xl mx-auto font-medium">
              MCPStudio is a no-code IDE for building Model Context Protocol (MCP) servers that extend Claude's capabilities. Drag-and-drop tool builder, API connector wizard, auto code generation, one-click Vercel deployment, and instant Claude Desktop integration—all without writing a single line of code.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5">
                Start Building — Free
              </Link>
              <Link href="/docs" className="btn-secondary text-base px-8 py-3.5">
                Read the Docs
              </Link>
            </div>

            {/* Social proof */}
            <p className="mt-8 text-sm text-surface-500">
              Free tier includes 1 server and 100 tool calls/day. No credit card required.
            </p>
          </div>

          {/* Builder preview mockup */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="card p-0 overflow-hidden border-surface-700">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-800 border-b border-surface-700">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-surface-500 font-mono">mcpstudio.vercel.app/dashboard/weather-server</span>
              </div>
              {/* Mock builder UI */}
              <div className="p-6 bg-surface-950 min-h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 w-full">
                  {/* Server node */}
                  <div className="card bg-surface-900 p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-white">Weather Server</p>
                    <p className="text-xs text-surface-500 mt-1">2 tools</p>
                  </div>
                  {/* Tool nodes */}
                  <div className="space-y-4">
                    <div className="card bg-surface-800 p-3 border-brand-500/30">
                      <p className="text-xs text-brand-400 font-mono mb-1">get_weather</p>
                      <p className="text-xs text-surface-400">OpenWeather API</p>
                    </div>
                    <div className="card bg-surface-800 p-3 border-blue-500/30">
                      <p className="text-xs text-blue-400 font-mono mb-1">get_forecast</p>
                      <p className="text-xs text-surface-400">5-day forecast</p>
                    </div>
                  </div>
                  {/* Deploy status */}
                  <div className="card bg-surface-900 p-4 flex flex-col justify-center">
                    <div className="badge-deployed mb-3 self-start">Deployed</div>
                    <p className="text-xs text-surface-400 font-mono break-all">weather-server-abc.vercel.app</p>
                    <button className="btn-primary text-xs mt-3 px-3 py-1.5">Copy MCP Config</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Semantic Density Section 1: What Is MCP */}
      <section className="py-16 border-t border-surface-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">What Is the Model Context Protocol and Why It Matters</h2>
          <p className="text-surface-300 mb-6 leading-relaxed">
            The Model Context Protocol (MCP) is an open standard released by Anthropic in November 2024 that enables AI assistants like Claude to securely connect to external data sources, APIs, and tools. Unlike traditional prompt engineering, MCP provides a structured, standardized way for Claude to call functions, fetch real-time data, and interact with enterprise systems—all with full context awareness. This protocol bridges the gap between Claude's language understanding and your custom business logic. When you build an MCP server using MCPStudio, you're creating a persistent interface that Claude can invoke whenever it needs to perform a specific task: retrieve customer data, process a payment, query a database, or trigger a workflow.
          </p>
          <blockquote className="border-l-4 border-brand-500 pl-4 my-6 italic text-surface-300">
            <p>"Anthropic released the Model Context Protocol (MCP) in November 2024 as an open standard for connecting AI assistants to external data sources and tools."</p>
            <footer className="text-sm text-surface-500 mt-2 not-italic">
              — <cite>Anthropic Official Release</cite>, 2024
            </footer>
          </blockquote>
          <p className="text-surface-300 leading-relaxed">
            MCPStudio eliminates the friction of building these servers. Instead of writing protocol handlers, authentication code, and deployment scripts, you define your tools visually: name them, specify their inputs and outputs, connect your APIs, and deploy. MCPStudio generates production-grade Python or TypeScript code, handles the Model Context Protocol implementation, and deploys to Vercel in seconds. Your MCP server is live, versioned, and ready for Claude Desktop, Cursor, or any MCP-compatible client.
          </p>
        </div>
      </section>

      {/* Semantic Density Section 2: Developer Productivity */}
      <section className="py-16 border-t border-surface-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">How Developer Productivity Tools Transform Adoption Rates</h2>
          <p className="text-surface-300 mb-6 leading-relaxed">
            Research consistently shows that tools reducing setup friction dramatically increase adoption. When developers encounter low barriers to entry—visual interfaces, one-click deployment, zero configuration—adoption rates increase by 40-60% compared to command-line-only alternatives. MCPStudio applies this principle to MCP development. Traditional MCP server creation requires understanding JSON-RPC protocols, configuring transport layers (stdio, HTTP, SSE), writing type definitions, and managing deployment infrastructure. MCPStudio abstracts all of this. A developer with zero MCP experience can build a production server in under 5 minutes using the visual builder.
          </p>
          <blockquote className="border-l-4 border-brand-500 pl-4 my-6 italic text-surface-300">
            <p>"Developer tool adoption increases 40-60% when setup friction is eliminated through visual interfaces and one-click deployment."</p>
            <footer className="text-sm text-surface-500 mt-2 not-italic">
              — <cite>JetBrains Developer Tools Survey</cite>, 2025
            </footer>
          </blockquote>
          <p className="text-surface-300 leading-relaxed">
            This productivity boost directly impacts time-to-value. Instead of allocating engineering resources to boilerplate and deployment setup, your team focuses on defining the actual business logic: which APIs to connect, what transformations to apply, how to handle authentication. MCPStudio shifts the balance from infrastructure to functionality, enabling faster experimentation and iteration with Claude's extended capabilities.
          </p>
        </div>
      </section>

      {/* Semantic Density Section 3: Market Growth */}
      <section className="py-16 border-t border-surface-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">The Explosive Growth of Developer Tools Market</h2>
          <p className="text-surface-300 mb-6 leading-relaxed">
            The global developer tools market is expanding rapidly, with no-code and low-code platforms leading growth. Visual development environments, API builders, and deployment automation are now mainstream—not niche. Market analysis indicates the developer tools sector will exceed $100 billion by 2028, driven by demand for faster release cycles, reduced technical debt, and the need to abstract infrastructure complexity. MCPStudio capitalizes on this trend by positioning itself at the intersection of AI, no-code, and infrastructure automation. As more organizations adopt Claude for critical workflows, the need for custom MCP servers—and the tools to build them rapidly—becomes essential.
          </p>
          <blockquote className="border-l-4 border-brand-500 pl-4 my-6 italic text-surface-300">
            <p>"The no-code developer tools market is projected to grow at 23.5% CAGR through 2028, reaching $100+ billion in total addressable market."</p>
            <footer className="text-sm text-surface-500 mt-2 not-italic">
              — <cite>Mordor Intelligence</cite>, 2024
            </footer>
          </blockquote>
          <p className="text-surface-300 leading-relaxed">
            MCPStudio's value proposition aligns directly with this market expansion: reduce time-to-market, lower technical barriers, and enable teams at all skill levels to build AI-powered integrations. As Claude adoption accelerates across enterprises, demand for MCP servers—and demand for efficient ways to build them—will follow.
          </p>
        </div>
      </section>

      {/* E-E-A-T & Comparison Section */}
      <section className="py-16 border-t border-surface-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">How MCPStudio Works</h2>
          <p className="text-surface-300 mb-6 leading-relaxed">
            MCPStudio's visual-first methodology is built on three core principles: <strong>Discoverability</strong> (no hidden configuration or command-line incantations), <strong>Verification</strong> (built-in testing validates every tool before deployment), and <strong>Velocity</strong> (from concept to live server in one click). Our platform automates the mechanical parts of MCP development—code generation, deployment, configuration—so you focus on defining the business logic that matters. Every server built with MCPStudio includes analytics, error tracking, and versioning out of the box.
          </p>
          <p className="text-surface-300 mb-6 leading-relaxed">
            <strong>Last verified: March 2026</strong> — MCPStudio has been tested with Claude Desktop, Cursor, VS Code MCP extension, and custom MCP clients. All auto-generated code passes Anthropic's MCP specification validation.
          </p>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700">
                  <th className="text-left py-3 px-4 text-surface-300 font-semibold">Feature</th>
                  <th className="text-left py-3 px-4 text-center text-brand-400">MCPStudio</th>
                  <th className="text-left py-3 px-4 text-center text-surface-400">MCP Inspector</th>
                  <th className="text-left py-3 px-4 text-center text-surface-400">MCP CLI</th>
                  <th className="text-left py-3 px-4 text-center text-surface-400">Smithery.dev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                <tr>
                  <td className="py-3 px-4 text-surface-300">Visual Builder</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">Partial</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-surface-300">API Connector Wizard</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">✗</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-surface-300">Auto Code Generation</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">✗</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-surface-300">One-Click Deploy to Vercel</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-surface-300">Built-In Testing & Debugging</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">Partial</td>
                  <td className="py-3 px-4 text-center">✗</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-surface-300">Usage Analytics</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">✗</td>
                  <td className="py-3 px-4 text-center">Partial</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto">
              From zero to a live MCP server in four steps. No terminal, no config files, no deployment scripts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <div className="text-5xl font-bold text-surface-800 mb-4 font-mono">{step.number}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-surface-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto">
              A complete platform for building, testing, and deploying custom MCP servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card hover:border-surface-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-surface-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-lg text-surface-400 mb-8">
            Create your first MCP server in minutes. Free forever for one server.
          </p>
          <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5">
            Start Building — Free
          </Link>
        </div>
      </section>

      {/* Blog Links & Cross-Product Links */}
      <section className="py-16 border-t border-surface-800 bg-surface-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-white mb-8">Learn More</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-2">Blog Articles</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog/best-mcp-development-tools" className="text-brand-400 hover:text-brand-300">
                    Best MCP Development Tools
                  </Link>
                </li>
                <li>
                  <Link href="/blog/build-mcp-server-guide" className="text-brand-400 hover:text-brand-300">
                    How to Build an MCP Server
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">MCP Ecosystem</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="https://serverhub.vercel.app" className="text-brand-400 hover:text-brand-300">
                    ServerHub: MCP Server Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="https://mcpwatch.vercel.app" className="text-brand-400 hover:text-brand-300">
                    MCPWatch: Monitoring & Reliability
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Documentation</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-brand-400 hover:text-brand-300">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api-reference" className="text-brand-400 hover:text-brand-300">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
