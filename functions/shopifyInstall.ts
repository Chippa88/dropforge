/**
 * shopifyInstall.ts — Dropforge v2.1
 * Initiates the Shopify OAuth install flow.
 * Added: shop param sanitization to strip markdown/URL formatting artifacts.
 * #shopify #oauth #install #phase1
 */

const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY')!;

const SCOPES = [
  'write_products',
  'read_products',
  'read_orders',
  'read_inventory',
].join(',');

const REDIRECT_URI = 'https://dropforge.pro/functions/shopifyCallback';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  let shop  = url.searchParams.get('shop') || '';

  console.log('shopifyInstall raw shop param:', shop);

  // Sanitize: strip markdown link format [text](url) — extract just the domain
  // e.g. "[dropforge-dev.myshopify.com](https://dropforge-dev.myshopify.com)" → "dropforge-dev.myshopify.com"
  const markdownMatch = shop.match(/\[([^\]]+)\]/);
  if (markdownMatch) {
    shop = markdownMatch[1];
    console.log('Sanitized markdown shop param to:', shop);
  }

  // Also strip any leading https:// or http:// if someone passed a full URL
  shop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '').trim();

  console.log('shopifyInstall final shop:', shop);

  if (!shop) {
    return Response.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
    return Response.json({ error: 'Invalid shop domain', shop }, { status: 400 });
  }

  const installUrl = 'https://' + shop + '/admin/oauth/authorize?' + new URLSearchParams({
    client_id:    SHOPIFY_API_KEY,
    scope:        SCOPES,
    redirect_uri: REDIRECT_URI,
  }).toString();

  console.log('Redirecting to:', installUrl);

  return new Response(null, {
    status: 302,
    headers: { 'Location': installUrl },
  });
});
