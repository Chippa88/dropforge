/**
 * shopifyCallback.ts — Dropforge v2.1
 * Handles Shopify OAuth callback — verifies HMAC, exchanges code for
 * permanent access token, saves Store record, redirects to dashboard.
 *
 * v2.1 fix: user_id is now derived from shopify_domain as a stable
 * placeholder since no Base44 user session exists during OAuth handshake.
 * #shopify #oauth #callback #phase1 #fix
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SHOPIFY_API_KEY    = Deno.env.get('SHOPIFY_API_KEY')!;
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET')!;

Deno.serve(async (req) => {
  const url    = new URL(req.url);
  const params = url.searchParams;

  const shop = params.get('shop');
  const code = params.get('code');
  const hmac = params.get('hmac');

  console.log('=== SHOPIFY CALLBACK HIT ===', { shop, hasCode: !!code, hasHmac: !!hmac });

  if (!shop || !code || !hmac) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // --- HMAC Verification — proves this request is genuinely from Shopify ---
  const queryParams = Array.from(params.entries())
    .filter(([key]) => key !== 'hmac')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const encoder   = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', encoder.encode(SHOPIFY_API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature    = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(queryParams));
  const computedHmac = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  if (computedHmac !== hmac) {
    console.error('HMAC mismatch');
    return Response.json({ error: 'HMAC verification failed' }, { status: 403 });
  }

  // --- Exchange one-time code for permanent access token ---
  let tokenData: any;
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });
    tokenData = await tokenRes.json();
    console.log('Token exchange:', !!tokenData.access_token ? 'SUCCESS' : 'FAILED');
  } catch (e) {
    return Response.json({ error: 'Token exchange failed', detail: String(e) }, { status: 500 });
  }

  if (!tokenData.access_token) {
    return Response.json({ error: 'No access token returned', details: tokenData }, { status: 400 });
  }

  // --- Fetch store metadata from Shopify ---
  let shopInfo: any = {};
  try {
    const shopRes  = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': tokenData.access_token },
    });
    const shopData = await shopRes.json();
    shopInfo = shopData.shop || {};
    console.log('Store info fetched:', shopInfo.name);
  } catch (e) {
    console.warn('Store info fetch failed (non-fatal):', String(e));
  }

  // --- Save store record to database ---
  // NOTE: user_id is set to the shop domain as a stable identifier.
  // When the merchant logs into Dropforge, the Dashboard will update
  // this record with their real Base44 user ID.
  try {
    const base44 = createClientFromRequest(req);
    const db     = base44.asServiceRole.entities;

    const existing = await db.Store.filter({ shopify_domain: shop });

    const storeRecord = {
      user_id:              shopInfo?.id ? String(shopInfo.id) : shop,
      shopify_domain:       shop,
      shopify_access_token: tokenData.access_token,
      shopify_store_name:   shopInfo?.name  || shop,
      shopify_store_email:  shopInfo?.email || '',
      shopify_plan:         shopInfo?.plan_name || 'unknown',
      connection_status:    'connected',
      auto_publish:         false,
      digest_enabled:       true,
      digest_time:          '08:00',
      last_synced:          new Date().toISOString(),
    };

    if (existing.length > 0) {
      await db.Store.update(existing[0].id, storeRecord);
      console.log('Store UPDATED:', shop);
    } else {
      await db.Store.create(storeRecord);
      console.log('Store CREATED:', shop);
    }
  } catch (e) {
    console.error('DB save error:', String(e));
    return Response.json({ error: 'Database save failed', detail: String(e) }, { status: 500 });
  }

  // --- Redirect merchant to their Dropforge dashboard ---
  return new Response(null, {
    status: 302,
    headers: { 'Location': `https://dropforge.pro/Dashboard?shop=${shop}` },
  });
});
