import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with MCP server building.',
    features: [
      '1 MCP server',
      '100 tool calls/day',
      'Visual builder',
      'Vercel hosting',
      'Python & TypeScript',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/dashboard',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'For power users building multiple servers.',
    features: [
      '3 MCP servers',
      '10,000 tool calls/day',
      'Everything in Free',
      'Analytics dashboard',
      'Priority support',
      'Version history',
    ],
    cta: 'Get Professional',
    href: '/dashboard?plan=professional',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For teams building production MCP infrastructure.',
    features: [
      '10 MCP servers',
      '100,000 tool calls/day',
      'Everything in Professional',
      'Team collaboration',
      'Custom code editor',
      'Dedicated support',
    ],
    cta: 'Get Enterprise',
    href: '/dashboard?plan=enterprise',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-surface-400 max-w-2xl mx-auto">
            Start free. Upgrade when you need more servers and higher limits.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card relative flex flex-col ${
                plan.highlight
                  ? 'border-brand-500 ring-1 ring-brand-500/20'
                  : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge bg-brand-500 text-white px-3 py-1">Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-surface-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-surface-400 text-sm ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm text-surface-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={plan.highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'What is an MCP server?',
                a: 'MCP (Model Context Protocol) is a standard for giving AI assistants like Claude custom tools. An MCP server exposes these tools via a standard protocol, so Claude can call external APIs, databases, or any service you connect.',
              },
              {
                q: 'Do I need coding experience?',
                a: 'No. MCPStudio provides a visual interface for everything. You configure APIs through forms, not code. We generate the server code for you automatically.',
              },
              {
                q: 'Where do servers run?',
                a: 'Servers deploy to Vercel, which provides free hosting with generous limits. Your server gets a unique URL that Claude Desktop connects to.',
              },
              {
                q: 'Can I see the generated code?',
                a: 'Yes. MCPStudio generates clean Python or TypeScript code. Professional and Enterprise users can view and edit the code directly.',
              },
              {
                q: 'What counts as a tool call?',
                a: 'Each time Claude (or another MCP client) invokes one of your tools, that counts as a tool call. The free tier includes 100 calls/day, which is plenty for personal use.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="card">
                <h3 className="text-base font-semibold text-white mb-2">{q}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
