/**
 * publishProduct.ts — Dropforge v2
 * Pushes an approved Product record to the user's Shopify store
 * via the Shopify Admin REST API (2024-01).
 *
 * Flow:
 *   1. Receive product_id from request body
 *   2. Load Product record from DB (must be status = "approved")
 *   3. Load Store record to get shopify_domain + shopify_access_token
 *   4. POST to Shopify Admin API to create the product listing
 *   5. Update Product record: status = "published", shopify_product_id = Shopify's ID
 *
 * #shopify #publish #products #phase3 #autopublish
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const { product_id } = await req.json();

  if (!product_id) {
    return Response.json({ error: 'Missing product_id' }, { status: 400 });
  }

  console.log(`=== publishProduct START — product_id: ${product_id} ===`);

  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    // --- STEP 1: Load the product ---
    const products = await db.Product.filter({ id: product_id });
    const product = products?.[0];

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'approved') {
      return Response.json({
        error: `Product status is "${product.status}" — only approved products can be published`
      }, { status: 400 });
    }

    console.log(`Product loaded: ${product.title}`);

    // --- STEP 2: Load the store ---
    const stores = await db.Store.filter({ id: product.store_id });
    const store = stores?.[0];

    if (!store) {
      return Response.json({ error: 'Store not found for this product' }, { status: 404 });
    }

    if (store.connection_status !== 'connected' || !store.shopify_access_token) {
      return Response.json({ error: 'Store is not connected to Shopify' }, { status: 400 });
    }

    console.log(`Store loaded: ${store.shopify_store_name} (${store.shopify_domain})`);

    // --- STEP 3: Build the Shopify product payload ---
    const shopifyPayload = {
      product: {
        title: product.title,
        body_html: `<p>${product.description}</p>`,
        vendor: store.shopify_store_name || 'Dropforge',
        product_type: product.niche_key || 'General',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        status: 'active',
        variants: [
          {
            price: String(product.price),
            compare_at_price: String(product.compare_at_price),
            inventory_management: null,
            fulfillment_service: 'manual',
            requires_shipping: true,
            taxable: true,
          }
        ],
        images: Array.isArray(product.images)
          ? product.images.slice(0, 5).map((src: string) => ({ src }))
          : [],
      }
    };

    // --- STEP 4: POST to Shopify Admin API ---
    const shopifyUrl = `https://${store.shopify_domain}/admin/api/2024-01/products.json`;

    console.log(`Posting to Shopify: ${shopifyUrl}`);

    const shopifyRes = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': store.shopify_access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopifyPayload),
    });

    const shopifyData = await shopifyRes.json();

    if (!shopifyRes.ok || shopifyData.errors) {
      const errMsg = JSON.stringify(shopifyData.errors || shopifyData);
      console.error('Shopify API error:', errMsg);

      // Mark product as failed so user can retry
      await db.Product.update(product_id, {
        status: 'failed',
        rejection_reason: `Shopify error: ${errMsg}`,
      });

      return Response.json({
        error: 'Shopify rejected the product',
        details: shopifyData.errors || shopifyData
      }, { status: 400 });
    }

    const shopifyProduct = shopifyData.product;
    console.log(`Shopify product created: ID ${shopifyProduct.id} — ${shopifyProduct.title}`);

    // --- STEP 5: Update product record ---
    await db.Product.update(product_id, {
      status: 'published',
      shopify_product_id: String(shopifyProduct.id),
      published_at: new Date().toISOString(),
    });

    console.log(`=== DONE — published to Shopify as product ID ${shopifyProduct.id} ===`);

    return Response.json({
      success: true,
      shopify_product_id: shopifyProduct.id,
      shopify_product_url: `https://${store.shopify_domain}/admin/products/${shopifyProduct.id}`,
      title: shopifyProduct.title,
    });

  } catch (e) {
    console.error('publishProduct error:', String(e));
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
