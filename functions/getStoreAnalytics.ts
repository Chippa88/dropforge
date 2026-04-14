/**
 * getStoreAnalytics.ts — Dropforge v1.0
 * Pulls order data from Shopify and cross-references with published
 * Product records to calculate per-product sales performance.
 *
 * Flow:
 *   1. Load store record (access token + domain)
 *   2. Fetch all orders from Shopify Admin API (last 90 days)
 *   3. Load all published Product records from DB
 *   4. Match Shopify line items to our product records by shopify_product_id
 *   5. Calculate revenue, order count, units sold per product
 *   6. Flag "weak" products: 7+ days live with 0 orders
 *   7. Return enriched product list sorted by revenue desc
 *
 * Available on: Growth, Pro plans
 * #analytics #shopify #sales #phase5
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const { store_id } = await req.json();

  if (!store_id) {
    return Response.json({ error: 'Missing store_id' }, { status: 400 });
  }

  console.log(`=== getStoreAnalytics START — store: ${store_id} ===`);

  try {
    const base44 = createClientFromRequest(req);
    const db     = base44.asServiceRole.entities;

    // --- Load store ---
    const stores = await db.Store.filter({ id: store_id });
    const store  = stores?.[0];

    if (!store?.shopify_access_token) {
      return Response.json({ error: 'Store not connected' }, { status: 400 });
    }

    // --- Load published products from our DB ---
    const allProducts = await db.Product.filter({ store_id, status: 'published' });
    console.log(`Found ${allProducts.length} published products`);

    // Build a lookup map: shopify_product_id → our product record
    const productMap: Record<string, any> = {};
    for (const p of allProducts) {
      if (p.shopify_product_id) {
        productMap[String(p.shopify_product_id)] = p;
      }
    }

    // --- Fetch orders from Shopify (last 90 days) ---
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    let allOrders: any[] = [];
    let pageUrl = `https://${store.shopify_domain}/admin/api/2024-01/orders.json?` + new URLSearchParams({
      status:        'any',
      created_at_min: since,
      limit:         '250',
      fields:        'id,line_items,created_at,financial_status',
    }).toString();

    // Paginate through all orders
    while (pageUrl) {
      const res = await fetch(pageUrl, {
        headers: { 'X-Shopify-Access-Token': store.shopify_access_token },
      });
      const data = await res.json();
      allOrders = allOrders.concat(data.orders || []);
      console.log(`Fetched ${allOrders.length} orders so far`);

      // Check for next page via Link header
      const linkHeader = res.headers.get('Link') || '';
      const nextMatch  = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      pageUrl = nextMatch ? nextMatch[1] : '';
    }

    console.log(`Total orders fetched: ${allOrders.length}`);

    // --- Aggregate sales per product ---
    const salesMap: Record<string, { revenue: number; orders: number; units: number }> = {};

    for (const order of allOrders) {
      // Only count paid orders
      if (!['paid', 'partially_paid'].includes(order.financial_status)) continue;

      for (const item of (order.line_items || [])) {
        const pid = String(item.product_id);
        if (!salesMap[pid]) salesMap[pid] = { revenue: 0, orders: 0, units: 0 };
        salesMap[pid].revenue += parseFloat(item.price) * item.quantity;
        salesMap[pid].orders  += 1;
        salesMap[pid].units   += item.quantity;
      }
    }

    // --- Build enriched product list ---
    const now = Date.now();
    const enriched = allProducts.map((p: any) => {
      const sid      = String(p.shopify_product_id || '');
      const sales    = salesMap[sid] || { revenue: 0, orders: 0, units: 0 };
      const daysLive = p.published_at
        ? Math.floor((now - new Date(p.published_at).getTime()) / 86400000)
        : 0;

      // Flag as weak: 7+ days live, 0 paid orders
      const isWeak = daysLive >= 7 && sales.orders === 0;

      return {
        id:                 p.id,
        title:              p.title,
        price:              p.price,
        cost_price:         p.cost_price,
        niche_key:          p.niche_key,
        shopify_product_id: p.shopify_product_id,
        images:             p.images,
        published_at:       p.published_at,
        days_live:          daysLive,
        revenue:            Math.round(sales.revenue * 100) / 100,
        orders:             sales.orders,
        units_sold:         sales.units,
        is_weak:            isWeak,
        profit_estimate:    Math.round((sales.revenue - (p.cost_price || 0) * sales.units) * 100) / 100,
      };
    });

    // Sort by revenue descending
    enriched.sort((a: any, b: any) => b.revenue - a.revenue);

    const weakCount = enriched.filter((p: any) => p.is_weak).length;
    console.log(`=== DONE — ${enriched.length} products, ${weakCount} weak ===`);

    return Response.json({
      success:       true,
      products:      enriched,
      total_revenue: enriched.reduce((s: number, p: any) => s + p.revenue, 0),
      total_orders:  allOrders.length,
      weak_count:    weakCount,
    });

  } catch (e) {
    console.error('getStoreAnalytics error:', String(e));
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
