import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import Stripe from 'stripe'

// In-memory idempotency store for processed webhook events
// In production, this should be backed by a database table
const processedEvents = new Map<string, number>()

// Clean up old events every 10 minutes (keep last 24 hours)
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000
setInterval(() => {
  const cutoff = Date.now() - IDEMPOTENCY_TTL_MS
  processedEvents.forEach((timestamp, eventId) => {
    if (timestamp < cutoff) processedEvents.delete(eventId)
  })
}, 10 * 60 * 1000)

// POST /api/stripe/webhook — handle Stripe webhook events
export async function POST(request: Request) {
  let body: string
  try {
    body = await request.text()
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 })
  }

  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check: skip already-processed events
  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true, deduplicated: true })
  }

  // Mark as processed immediately to prevent concurrent duplicates
  processedEvents.set(event.id, Date.now())

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const plan = session.metadata?.plan || 'professional'
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const email = session.customer_email

        if (email) {
          try {
            const supabase = createServerClient()
            const { error: dbError } = await supabase
              .from('users')
              .update({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                tier: plan as 'professional' | 'enterprise',
              })
              .eq('email', email)

            if (dbError) {
              console.error(`Failed to update user tier for ${email}:`, dbError.message)
            }
          } catch (err: any) {
            console.error(`Supabase error during checkout.session.completed:`, err.message)
            // Don't throw — we still return 200 to Stripe to prevent retries
            // The event is idempotency-tracked so we can reprocess manually if needed
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        if (subscription.status === 'past_due' || subscription.status === 'canceled') {
          try {
            const supabase = createServerClient()
            const { error: dbError } = await supabase
              .from('users')
              .update({ tier: 'free', stripe_subscription_id: null })
              .eq('stripe_customer_id', customerId)

            if (dbError) {
              console.error(`Failed to downgrade user for customer ${customerId}:`, dbError.message)
            }
          } catch (err: any) {
            console.error(`Supabase error during subscription.updated:`, err.message)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        try {
          const supabase = createServerClient()
          const { error: dbError } = await supabase
            .from('users')
            .update({ tier: 'free', stripe_subscription_id: null })
            .eq('stripe_customer_id', customerId)

          if (dbError) {
            console.error(`Failed to downgrade user on subscription deletion for ${customerId}:`, dbError.message)
          }
        } catch (err: any) {
          console.error(`Supabase error during subscription.deleted:`, err.message)
        }
        break
      }
    }
  } catch (err: any) {
    // Catch-all: log but still return 200 to prevent Stripe retry storms
    console.error(`Unhandled error processing webhook event ${event.id} (${event.type}):`, err.message)
  }

  return NextResponse.json({ received: true })
}
