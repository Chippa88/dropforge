/**
 * searchProducts.ts — Dropforge v2
 * Calls CJ Dropshipping API, runs each product through OpenAI GPT-4o,
 * saves polished listings to Product entity with status = "pending".
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CJ_API_KEY = Deno.env.get('CJ_API_KEY')!;
const CJ_EMAIL   = Deno.env.get('CJ_EMAIL')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

async function getCJToken(): Promise<string> {
  const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CJ_EMAIL, password: CJ_API_KEY }),
  });
  const data = await res.json();
  if (!data.data?.accessToken) throw new Error('CJ auth failed: ' + JSON.stringify(data));
  return data.data.accessToken;
}

async function searchCJProducts(token: string, keyword: string): Promise<any[]> {
  const url = 'https://developers.cjdropshipping.com/api2.0/v1/product/listV2?' + new URLSearchParams({
    keyWord: keyword,
    page: '1',
    size: '5',
    productFlag: '0',
    zonePlatform: 'shopify',
  }).toString();

  const res = await fetch(url, { headers: { 'CJ-Access-Token': token } });
  const data = await res.json();
  console.log('CJ response code:', data.code);
  return data.data?.content?.[0]?.productList || [];
}

async function generateProductListing(raw: any): Promise<any> {
  const prompt = `You are an expert Shopify dropshipping product copywriter.

Given this raw supplier product, generate a polished Shopify listing.

Raw product:
- Name: ${raw.nameEn}
- Category: ${raw.threeCategoryName || raw.oneCategoryName || 'General'}
- Supplier price: $${raw.sellPrice}

Return a JSON object with exactly these fields:
{
  "title": "compelling SEO-friendly product title (max 80 chars)",
  "description": "3-4 sentence marketing description, benefits-focused, no jargon",
  "price": number (retail price with healthy markup, 2.5x-4x supplier cost),
  "compare_at_price": number (20% above retail price),
  "tags": ["array", "of", "5", "relevant", "tags"]
}

Return ONLY valid JSON, no markdown, no explanation.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no content');

  // Strip markdown code fences if present
  content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  return JSON.parse(content);
}

Deno.serve(async (req) => {
  const { store_id, niche_key, keyword } = await req.json();

  if (!keyword) {
    return Response.json({ error: 'Missing keyword' }, { status: 400 });
  }

  console.log(`=== searchProducts START — keyword: ${keyword} ===`);

  try {
    const token = await getCJToken();
    const rawProducts = await searchCJProducts(token, keyword);
    console.log(`CJ found ${rawProducts.length} products`);

    if (rawProducts.length === 0) {
      return Response.json({ success: true, saved: 0, message: 'No products found for that keyword' });
    }

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const saved = [];
    for (const raw of rawProducts) {
      try {
        const generated = await generateProductListing(raw);
        console.log(`Generated: ${generated.title}`);

        const product = await db.Product.create({
          store_id: store_id || '',
          niche_key: niche_key || 'general',
          title: generated.title,
          description: generated.description,
          price: generated.price,
          compare_at_price: generated.compare_at_price,
          cost_price: parseFloat(raw.sellPrice) || 0,
          tags: generated.tags,
          images: raw.bigImage ? [raw.bigImage] : [],
          supplier_url: `https://cjdropshipping.com/product/${raw.id}.html`,
          supplier_name: 'CJ Dropshipping',
          status: 'pending',
          ai_generated: true,
          trend_score: raw.listedNum || 0,
        });

        saved.push(product.id);
        console.log(`Saved: ${generated.title}`);
      } catch (e) {
        console.error(`Failed on ${raw.nameEn}: ${String(e)}`);
      }
    }

    console.log(`=== DONE — saved ${saved.length} products ===`);
    return Response.json({ success: true, saved: saved.length, product_ids: saved });

  } catch (e) {
    console.error('Pipeline error:', String(e));
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
