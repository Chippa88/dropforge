/**
 * createCheckoutSession.ts — Dropforge v2.2
 * Creates a Stripe Checkout session for a given price ID.
 * Supports 7-day free trials — card collected upfront, no charge for 7 days.
 *
 * WHY card-upfront vs. no-card trial:
 *   Card-upfront converts better long-term. Users who enter a card are
 *   already committed — they're 3-4x more likely to stay after trial ends.
 *   No-card trials attract tire-kickers who never convert. Industry data
 *   strongly favors card-upfront for B2B SaaS tools like this.
 *
 * #stripe #billing #trial #checkout #phase1
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user   = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { priceId, plan, trial, successUrl, cancelUrl } = await req.json();
    if (!priceId) return Response.json({ error: 'priceId required' }, { status: 400 });

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured' }, { status: 500 });

    // Build Stripe checkout params
    const params = new URLSearchParams({
      'mode':                       'subscription',
      'line_items[0][price]':       priceId,
      'line_items[0][quantity]':    '1',
      'customer_email':             user.email,
      'success_url':                successUrl || 'https://dropforge.pro/Dashboard',
      'cancel_url':                 cancelUrl  || 'https://dropforge.pro/Pricing',
      'metadata[user_id]':          user.id,
      'metadata[user_email]':       user.email,
      'metadata[plan]':             plan || 'starter',
      // Show itemized pricing and trial info on checkout page
      'payment_method_collection':  'always',
    });

    // Add 7-day trial if requested
    // Stripe will show "Your card will be charged $X on [date+7]" on checkout
    if (trial) {
      params.append('subscription_data[trial_period_days]', '7');
    }

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await res.json();
    if (session.error) return Response.json({ error: session.error.message }, { status: 400 });

    return Response.json({ url: session.url });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
