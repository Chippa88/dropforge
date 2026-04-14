/**
 * addStore.ts — Dropforge Phase 6 v1.0
 * Initiates the Shopify OAuth flow for adding an ADDITIONAL store
 * to an existing Pro-tier user account.
 *
 * WHY THIS IS SEPARATE FROM shopifyInstall.ts:
 *   shopifyInstall.ts handles first-time connections during onboarding.
 *   addStore.ts handles additional stores for Pro users who already
 *   have an account. It enforces the 5-store limit and verifies Pro
 *   subscription status before allowing the OAuth flow to begin.
 *
 * FLOW:
 *   1. User clicks "Add Store" in MultiStore hub
 *   2. Frontend calls this function with their shop domain
 *   3. We verify they're on Pro plan and under the 5-store limit
 *   4. We redirect them through Shopify OAuth
 *   5. shopifyCallback.ts handles the callback and saves the new store
 *
 * #multistore #oauth #pro #phase6
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SHOPIFY_API_KEY    = Deno.env.get('SHOPIFY_API_KEY')    || '';
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET') || '';
const SCOPES = 'read_products,write_products,read_orders,read_inventory,write_inventory';
const REDIRECT_URI = 'https://dropforge.pro/functions/shopifyCallback';
const MAX_STORES_PRO = 5;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user   = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const db = base44.asServiceRole.entities;

    // Verify Pro subscription
    const subs = await db.DropforgeSubscription.filter({ user_id: user.id });
    const sub  = subs?.[0];
    if (!sub || sub.plan !== 'pro' || sub.status !== 'active') {
      return Response.json({
        error: 'Multi-store management requires the Pro plan.',
        upgrade_required: true,
      }, { status: 403 });
    }

    // Check store count
    const stores = await db.Store.filter({ user_id: user.id });
    if ((stores || []).length >= MAX_STORES_PRO) {
      return Response.json({
        error: `Pro plan supports up to ${MAX_STORES_PRO} stores. You've reached the limit.`,
        limit_reached: true,
      }, { status: 403 });
    }

    // Get shop domain from query params
    const url  = new URL(req.url);
    let shop   = url.searchParams.get('shop') || '';
    // Sanitize — strip markdown formatting that can sneak in
    shop = shop.replace(/[\[\]()]/g, '').trim();

    if (!shop || !shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      return Response.json({ error: 'Invalid shop domain. Must be: yourstore.myshopify.com' }, { status: 400 });
    }

    // Check if this store is already connected to this account
    const existing = (stores || []).find(s => s.shopify_domain === shop);
    if (existing) {
      return Response.json({ error: 'This store is already connected to your account.' }, { status: 400 });
    }

    // Build OAuth URL
    const state       = btoa(`${user.id}:${Date.now()}:addstore`);
    const authUrl     = `https://${shop}/admin/oauth/authorize?` + new URLSearchParams({
      client_id:    SHOPIFY_API_KEY,
      scope:        SCOPES,
      redirect_uri: REDIRECT_URI,
      state,
    }).toString();

    return Response.redirect(authUrl, 302);

  } catch (e) {
    console.error('addStore error:', String(e));
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
