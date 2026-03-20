import { NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { checkoutSchema } from '@/lib/validation'

// POST /api/stripe/checkout — create a Stripe checkout session
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => e.message)
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const { plan, email } = parsed.data

  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key') {
    return NextResponse.json({
      error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local',
      demo_mode: true,
    }, { status: 503 })
  }

  try {
    const planConfig = STRIPE_PLANS[plan]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      customer_email: email || undefined,
      metadata: {
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout session creation failed:', err.message)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
