import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnalyticsProvider from '@/components/AnalyticsProvider'

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
  twitter: {
    card: 'summary_large_image',
    title: 'MCPStudio — Build MCP Servers Visually',
    description: 'No-code builder for Model Context Protocol servers.',
  },
  verification: {
    google: 'x2SOtWXlw9tE1I4J22Ov_SllJ1BBlArLSRdblTSNqL8',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <AnalyticsProvider>
      <head>
        <Script
          id="mcpstudio-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'MCPStudio',
              description: 'Visual no-code MCP server builder — create and deploy MCP tools without coding',
              url: 'https://mcpstudio-zeta.vercel.app',
              applicationCategory: 'DeveloperApplication',
              offers: [
                {
                  '@type': 'Offer',
                  priceCurrency: 'USD',
                  price: '0',
                  description: 'Free tier with basic features',
                },
                {
                  '@type': 'Offer',
                  priceCurrency: 'USD',
                  price: '29',
                  description: 'Pro plan',
                },
                {
                  '@type': 'Offer',
                  priceCurrency: 'USD',
                  price: '99',
                  description: 'Enterprise plan',
                },
              ],
              author: {
                '@type': 'Organization',
                name: 'MCPStudio Team',
              },
            }),
          }}
        />
        <Script
          id="mcpstudio-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is MCPStudio?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'MCPStudio is a visual no-code builder for Model Context Protocol (MCP) servers. Design your MCP tools using drag-and-drop, define API endpoints and tool behaviors, and MCPStudio auto-generates the server code and deploys it to production.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Do I need to know how to code to use MCPStudio?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. MCPStudio is designed for non-technical users. Use the visual builder to define tools, parameters, and behavior. MCPStudio generates all the code and handles deployment automatically.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I use my own APIs with MCPStudio?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. MCPStudio supports connecting to external REST APIs, databases, and webhooks. Map your API endpoints to MCP tools with just a few clicks. Pro and Enterprise plans include custom integrations.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Where does MCPStudio deploy my MCP server?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'MCPStudio deploys to Vercel serverless functions instantly. Your MCP server gets a public URL, automatic SSL, and scales automatically. No infrastructure management required.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I use MCPStudio tools in Claude Desktop?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. Any MCP server built with MCPStudio works in Claude Desktop, Cursor, and VS Code with MCP support. MCPStudio generates the configuration file you need to add to your editor.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
      </AnalyticsProvider>
    </html>
  )
}
