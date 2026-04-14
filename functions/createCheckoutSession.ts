/**
 * createCheckoutSession.ts — Dropforge v2
 * Creates a Stripe Checkout session for a given price ID.
 * Redirects to dropforge.pro on success/cancel.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { priceId, plan, successUrl, cancelUrl } = await req.json();
    if (!priceId) return Response.json({ error: 'priceId required' }, { status: 400 });

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured' }, { status: 500 });

    const params = new URLSearchParams({
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'customer_email': user.email,
      'success_url': successUrl || 'https://dropforge.pro/Dashboard',
      'cancel_url':  cancelUrl  || 'https://dropforge.pro/Pricing',
      'metadata[user_id]':    user.id,
      'metadata[user_email]': user.email,
      'metadata[plan]':       plan || 'starter',
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
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
