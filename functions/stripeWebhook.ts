/**
 * stripeWebhook.ts — Dropforge v2
 * Handles Stripe billing events and updates DropforgeSubscription records.
 * App ID: 69ddbfdda0639c2cd71b024b (new Dropforge app)
 */

import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const base44 = createClient({
  appId: '69ddbfdda0639c2cd71b024b',
});

const PRICE_TO_PLAN: Record<string, string> = {
  'price_1TLu5aPM6gWUtTPVk70mRYFp': 'starter',
  'price_1TLu5tPM6gWUtTPVzwFiOdyY': 'growth',
  'price_1TLu65PM6gWUtTPVzonIXm6Z': 'pro',
};

const PLAN_LIMITS: Record<string, { products_limit: number; niches_limit: number }> = {
  starter: { products_limit: 20,     niches_limit: 1 },
  growth:  { products_limit: 75,     niches_limit: 3 },
  pro:     { products_limit: 999999, niches_limit: 999999 },
};

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const db = base44.asServiceRole.entities;

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userEmail = session.customer_email || session.metadata?.user_email;
        const userId    = session.metadata?.user_id;
        const customerId     = session.customer as string;
        const subscriptionId = session.subscription as string;
        const planName  = session.metadata?.plan || 'starter';

        if (!userEmail || !subscriptionId) break;

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId   = stripeSub.items.data[0]?.price?.id;
        const plan      = PRICE_TO_PLAN[priceId] || planName;
        const limits    = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

        const subData = {
          user_id: userId,
          user_email: userEmail,
          plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          products_used: 0,
          products_limit: limits.products_limit,
          niches_limit: limits.niches_limit,
          period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          period_end:   new Date(stripeSub.current_period_end   * 1000).toISOString(),
          trial_ends_at: null,
        };

        const existing = await db.DropforgeSubscription.filter({ user_email: userEmail });
        if (existing.length > 0) {
          await db.DropforgeSubscription.update(existing[0].id, subData);
        } else {
          await db.DropforgeSubscription.create(subData);
        }
        console.log(`Subscription activated: ${userEmail} → ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId    = sub.items.data[0]?.price?.id;
        const plan       = PRICE_TO_PLAN[priceId] || 'starter';
        const limits     = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
        const status     = sub.status === 'active' ? 'active'
                         : sub.status === 'past_due' ? 'past_due' : 'cancelled';

        const existing = await db.DropforgeSubscription.filter({ stripe_customer_id: customerId });
        if (existing.length > 0) {
          await db.DropforgeSubscription.update(existing[0].id, {
            plan, status,
            products_limit: limits.products_limit,
            niches_limit:   limits.niches_limit,
            period_start: new Date(sub.current_period_start * 1000).toISOString(),
            period_end:   new Date(sub.current_period_end   * 1000).toISOString(),
          });
          console.log(`Subscription updated: ${customerId} → ${plan} / ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const existing = await db.DropforgeSubscription.filter({ stripe_customer_id: customerId });
        if (existing.length > 0) {
          await db.DropforgeSubscription.update(existing[0].id, {
            plan: 'free', status: 'cancelled',
            products_limit: 0, niches_limit: 0,
            stripe_subscription_id: '',
          });
          console.log(`Subscription cancelled: ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const existing = await db.DropforgeSubscription.filter({ stripe_customer_id: customerId });
        if (existing.length > 0) {
          await db.DropforgeSubscription.update(existing[0].id, { status: 'past_due' });
          console.log(`Payment failed: ${customerId} → past_due`);
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return new Response('Internal error', { status: 500 });
  }

  return Response.json({ received: true });
});
