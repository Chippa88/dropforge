/**
 * shopifyInstall.ts
 * v1.2 — Updated REDIRECT_URI to match v1.4 Shopify Partner config.
 * Was: api.base44.com/api/apps/.../functions/shopifyCallback
 * Now: bay-9782871f.base44.app/functions/shopifyCallback
 * #shopify #oauth #install #fix #phase2
 */

const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY')!;

const SCOPES = [
  'write_products',
  'read_products',
  'read_orders',
  'read_inventory',
].join(',');

const REDIRECT_URI = `https://bay-9782871f.base44.app/functions/shopifyCallback`;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');

  console.log('shopifyInstall called for shop:', shop);

  if (!shop) {
    return Response.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
    return Response.json({ error: 'Invalid shop domain', shop }, { status: 400 });
  }

  const state = crypto.randomUUID();

  const installUrl = `https://${shop}/admin/oauth/authorize?` + new URLSearchParams({
    client_id: SHOPIFY_API_KEY,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
  }).toString();

  console.log('Redirecting to Shopify install URL:', installUrl);

  return new Response(null, {
    status: 302,
    headers: { 'Location': installUrl },
  });
});
