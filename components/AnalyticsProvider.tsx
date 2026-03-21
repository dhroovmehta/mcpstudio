'use client';
import { useEffect } from 'react';

export function captureTrafficSource() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer;

  const source = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    referrer: referrer,
    is_ai_referral: [
      'chat.openai.com',
      'chatgpt.com',
      'claude.ai',
      'perplexity.ai',
      'gemini.google.com',
      'copilot.microsoft.com',
    ].some(domain => referrer.includes(domain)),
    landed_at: new Date().toISOString(),
    page: window.location.pathname,
  };

  // Store in memory for this session
  (window as any).__trafficSource = source;

  // Log to Vercel Analytics as custom event if available
  if (typeof (window as any).va === 'function') {
    (window as any).va('event', {
      name: 'traffic_source',
      data: source,
    });
  }
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    captureTrafficSource();
  }, []);
  return <>{children}</>;
}
