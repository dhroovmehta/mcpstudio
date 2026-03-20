import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
