/**
 * sendPerformanceDigest.ts — Dropforge Phase 6 v1.0
 * Sends the 9AM "Yesterday's Numbers" performance digest email.
 * Pro-tier exclusive. Runs daily at 9:00 AM CT via automation.
 *
 * WHAT THIS IS:
 *   The standard 8AM digest tells users what's pending/published.
 *   This 9AM digest tells users what SOLD yesterday — revenue,
 *   orders, top product, weak performers — formatted cleanly
 *   so they can copy-paste it into any AI tool for analysis.
 *
 * FOR MULTI-STORE PRO USERS:
 *   Each store gets its own section in the email. One email,
 *   all stores, all data. Total revenue across all stores
 *   is shown at the top as a summary line.
 *
 * EMAIL STRUCTURE:
 *   ─ Summary bar (total revenue, total orders, all stores)
 *   ─ Per-store section (store name, domain, yesterday's metrics)
 *     ─ Top performer
 *     ─ Revenue breakdown per product
 *     ─ Weak product alerts
 *   ─ Copy-paste block (raw text format for AI ingestion)
 *
 * #digest #email #analytics #multistore #pro #phase6
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL     = 'digest@dropforge.pro';

Deno.serve(async (req) => {
  console.log('=== sendPerformanceDigest START ===');

  try {
    const base44 = createClientFromRequest(req);
    const db     = base44.asServiceRole.entities;

    // Get all active Pro subscriptions
    const allSubs = await db.DropforgeSubscription.filter({ plan: 'pro', status: 'active' });
    console.log(`Found ${(allSubs || []).length} Pro subscribers`);

    let emailsSent = 0;
    let errors     = 0;

    for (const sub of (allSubs || [])) {
      try {
        // Get all stores for this user
        const stores = await db.Store.filter({ user_id: sub.user_id });
        if (!stores || stores.length === 0) continue;

        // For each store, fetch yesterday's Shopify orders
        const yesterday    = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dayStart     = new Date(yesterday);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd       = new Date(yesterday);
        dayEnd.setHours(23, 59, 59, 999);

        const storeReports: any[] = [];
        let grandTotalRevenue = 0;
        let grandTotalOrders  = 0;

        for (const store of stores) {
          if (!store.shopify_access_token || store.connection_status !== 'connected') continue;

          // Fetch yesterday's orders from Shopify
          let orders: any[] = [];
          try {
            const res  = await fetch(
              `https://${store.shopify_domain}/admin/api/2024-01/orders.json?` + new URLSearchParams({
                status:          'any',
                created_at_min:  dayStart.toISOString(),
                created_at_max:  dayEnd.toISOString(),
                limit:           '250',
                fields:          'id,line_items,financial_status,total_price,created_at',
              }),
              { headers: { 'X-Shopify-Access-Token': store.shopify_access_token } }
            );
            const data = await res.json();
            orders     = data.orders || [];
          } catch (e) {
            console.error(`Failed to fetch orders for ${store.shopify_domain}:`, e);
            continue;
          }

          // Aggregate by product
          const productMap: Record<string, { title: string; revenue: number; orders: number; units: number }> = {};
          let storeRevenue = 0;
          let storeOrders  = 0;

          for (const order of orders) {
            if (!['paid', 'partially_paid'].includes(order.financial_status)) continue;
            storeRevenue += parseFloat(order.total_price || '0');
            storeOrders++;
            for (const item of (order.line_items || [])) {
              const pid = String(item.product_id);
              if (!productMap[pid]) productMap[pid] = { title: item.title, revenue: 0, orders: 0, units: 0 };
              productMap[pid].revenue += parseFloat(item.price) * item.quantity;
              productMap[pid].orders++;
              productMap[pid].units += item.quantity;
            }
          }

          const products  = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
          const topProd   = products[0] || null;
          const weakProds = products.filter(p => p.orders === 0);

          grandTotalRevenue += storeRevenue;
          grandTotalOrders  += storeOrders;

          storeReports.push({
            store_name:   store.shopify_store_name || store.shopify_domain,
            domain:       store.shopify_domain,
            revenue:      storeRevenue,
            orders:       storeOrders,
            products,
            top_product:  topProd,
            weak_count:   weakProds.length,
          });
        }

        if (storeReports.length === 0) continue;

        // Build email HTML
        const dateLabel = yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const html      = buildPerformanceEmailHtml(sub.user_email, dateLabel, storeReports, grandTotalRevenue, grandTotalOrders);
        const text      = buildPerformanceEmailText(dateLabel, storeReports, grandTotalRevenue, grandTotalOrders);

        // Send via Resend
        const emailRes  = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from:    FROM_EMAIL,
            to:      sub.user_email,
            subject: `📊 Yesterday's Numbers — ${dateLabel}`,
            html,
            text,
          }),
        });

        const emailData = await emailRes.json();
        if (emailData.id) {
          console.log(`✅ Performance digest sent to ${sub.user_email}`);
          emailsSent++;
        } else {
          console.error(`Failed for ${sub.user_email}:`, emailData);
          errors++;
        }

      } catch (e) {
        console.error(`Error processing ${sub.user_email}:`, e);
        errors++;
      }
    }

    console.log(`=== DONE: ${emailsSent} sent, ${errors} errors ===`);
    return Response.json({ success: true, sent: emailsSent, errors });

  } catch (e) {
    console.error('sendPerformanceDigest fatal error:', String(e));
    return Response.json({ error: String(e) }, { status: 500 });
  }
});

// ── HTML EMAIL BUILDER ────────────────────────────────────────
function buildPerformanceEmailHtml(userEmail: string, dateLabel: string, stores: any[], totalRevenue: number, totalOrders: number): string {
  const storeBlocks = stores.map(s => `
    <div style="background:#1a1c26;border:1px solid #2d3748;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:4px;">🏪 ${s.store_name}</div>
      <div style="font-size:12px;color:#4a5568;margin-bottom:16px;">${s.domain}</div>
      <div style="display:flex;gap:24px;margin-bottom:16px;">
        <div><div style="font-size:24px;font-weight:800;color:#4ade80;">$${s.revenue.toFixed(2)}</div><div style="font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:1px;">Revenue</div></div>
        <div><div style="font-size:24px;font-weight:800;color:#6c63ff;">${s.orders}</div><div style="font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:1px;">Orders</div></div>
      </div>
      ${s.top_product ? `<div style="background:#0d2e1a;border:1px solid #4ade8033;border-radius:8px;padding:12px;margin-bottom:12px;"><span style="color:#4ade80;font-weight:700;">🏆 Top:</span> <span style="color:#e2e8f0;">${s.top_product.title}</span> — $${s.top_product.revenue.toFixed(2)} · ${s.top_product.orders} orders</div>` : ''}
      ${s.products.slice(0, 8).map((p: any) => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e2030;font-size:13px;">
          <span style="color:#a0aec0;">${p.title.slice(0, 48)}${p.title.length > 48 ? '…' : ''}</span>
          <span style="color:${p.revenue > 0 ? '#4ade80' : '#4a5568'};font-weight:600;">$${p.revenue.toFixed(2)}</span>
        </div>
      `).join('')}
      ${s.weak_count > 0 ? `<div style="margin-top:12px;color:#f59e0b;font-size:12px;">⚠️ ${s.weak_count} product${s.weak_count !== 1 ? 's' : ''} with 0 sales — review in Analytics</div>` : ''}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0A0B0F;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:32px 16px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:24px;font-weight:700;color:#fff;margin-bottom:8px;">⚡ Drop<span style="color:#6c63ff;">forge</span></div>
      <div style="font-size:14px;color:#4a5568;">Performance Report · ${dateLabel}</div>
    </div>

    <!-- GRAND TOTAL -->
    <div style="background:linear-gradient(135deg,#1a1433,#0d1f2a);border:1px solid #6c63ff44;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
      <div style="font-size:13px;color:#6c63ff;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">All Stores · Yesterday</div>
      <div style="font-size:48px;font-weight:800;color:#4ade80;letter-spacing:-2px;margin-bottom:4px;">$${totalRevenue.toFixed(2)}</div>
      <div style="font-size:14px;color:#718096;">${totalOrders} orders across ${stores.length} store${stores.length !== 1 ? 's' : ''}</div>
    </div>

    <!-- STORE REPORTS -->
    ${storeBlocks}

    <!-- COPY-PASTE BLOCK -->
    <div style="background:#13151c;border:1px solid #1e2030;border-radius:12px;padding:20px;margin-top:8px;">
      <div style="font-size:12px;color:#6c63ff;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">📋 Raw Data — Copy & Paste into your AI tool</div>
      <pre style="color:#718096;font-size:12px;line-height:1.8;margin:0;white-space:pre-wrap;font-family:monospace;">DATE: ${dateLabel}
TOTAL REVENUE: $${totalRevenue.toFixed(2)}
TOTAL ORDERS: ${totalOrders}
STORES: ${stores.length}

${stores.map(s => `STORE: ${s.store_name} (${s.domain})
  Revenue: $${s.revenue.toFixed(2)}
  Orders: ${s.orders}
  Top Product: ${s.top_product?.title || 'N/A'} ($${s.top_product?.revenue?.toFixed(2) || '0.00'})
  Products with 0 sales: ${s.weak_count}
${s.products.slice(0, 10).map((p: any) => `  - ${p.title}: $${p.revenue.toFixed(2)} (${p.orders} orders, ${p.units} units)`).join('\n')}`).join('\n\n')}</pre>
    </div>

    <div style="text-align:center;margin-top:32px;font-size:12px;color:#2d3748;">
      Dropforge Pro · Performance Digest · dropforge.pro<br>
      <a href="https://dropforge.pro/DropforgeSettings" style="color:#4a5568;">Manage digest settings</a>
    </div>
  </div>
</body>
</html>`;
}

// ── PLAIN TEXT BUILDER (fallback + copy-paste) ───────────────
function buildPerformanceEmailText(dateLabel: string, stores: any[], totalRevenue: number, totalOrders: number): string {
  return `DROPFORGE PERFORMANCE REPORT — ${dateLabel}

GRAND TOTAL
Revenue: $${totalRevenue.toFixed(2)}
Orders:  ${totalOrders}
Stores:  ${stores.length}

${stores.map(s => `
═══════════════════════════════════
STORE: ${s.store_name}
Domain: ${s.domain}
Revenue: $${s.revenue.toFixed(2)}
Orders: ${s.orders}
Top Product: ${s.top_product?.title || 'N/A'} ($${s.top_product?.revenue?.toFixed(2) || '0.00'})
Weak products (0 sales): ${s.weak_count}

PRODUCT BREAKDOWN:
${s.products.slice(0, 10).map((p: any) => `  ${p.title}: $${p.revenue.toFixed(2)} | ${p.orders} orders | ${p.units} units`).join('\n')}
`).join('\n')}

---
Dropforge Pro · dropforge.pro
`;
}
