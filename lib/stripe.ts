import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe && process.env.STRIPE_SECRET_KEY) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return _stripe
}

// For backwards compatibility with imports expecting 'stripe' export
export const stripe = (typeof window === 'undefined' && process.env.STRIPE_SECRET_KEY)
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null as any

export const STRIPE_PLANS = {
  professional: {
    name: 'Professional',
    price: 2900, // cents
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
    features: [
      '3 MCP servers',
      '10,000 tool calls/day',
      'Analytics dashboard',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 9900, // cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    features: [
      '10 MCP servers',
      '100,000 tool calls/day',
      'Team collaboration',
      'Custom code editor',
      'Dedicated support',
    ],
  },
} as const
