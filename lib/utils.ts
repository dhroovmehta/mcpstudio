export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Fetch with timeout and single retry (for external API calls: Vercel, Stripe, etc.)
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeoutMs?: number; retries?: number; retryDelayMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 30_000, retries = 1, retryDelayMs = 5_000, ...fetchOptions } = options

  async function attempt(): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { ...fetchOptions, signal: controller.signal })
      return response
    } finally {
      clearTimeout(timeout)
    }
  }

  try {
    return await attempt()
  } catch (err: any) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
      return fetchWithRetry(url, { ...options, retries: retries - 1 })
    }
    throw err
  }
}

// Resolve a dot-path on a nested object: "data.temperature" -> obj.data.temperature
export function resolvePath(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}
