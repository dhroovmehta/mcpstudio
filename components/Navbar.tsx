'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-white">MCPStudio</span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/pricing"
              className={`btn-ghost ${pathname === '/pricing' ? 'text-white bg-surface-800' : ''}`}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className={`btn-ghost ${pathname === '/docs' ? 'text-white bg-surface-800' : ''}`}
            >
              Docs
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-ghost">
              Dashboard
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
