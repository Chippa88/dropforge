/**
 * sendDigest.ts — Dropforge v2
 * Generates and sends the daily digest email to a store owner.
 *
 * Flow:
 *   1. Accept store_id (or run for all stores if omitted)
 *   2. Pull pending/approved/published product counts for the last 24h
 *   3. Build a clean HTML email digest
 *   4. Send via Resend API
 *   5. Log the send to DigestLog entity
 *
 * Called by: scheduled automation (daily) or manually
 * #email #digest #phase4 #resend #automation
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL    = 'digest@dropforge.pro';

// -------------------------------------------------------------------
// HTML EMAIL TEMPLATE
// -------------------------------------------------------------------
function buildDigestHTML(opts: {
  storeName:        string;
  pending:          number;
  published:        number;
  rejected:         number;
  recentProducts:   { title: string; price: number; status: string }[];
  digestTime:       string;
  appUrl:           string;
}): string {
  const { storeName, pending, published, rejected, recentProducts, appUrl } = opts;

  const productRows = recentProducts.length > 0
    ? recentProducts.map(p => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #1e2030;font-size:14px;color:#e2e8f0;">${p.title}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1e2030;font-size:14px;color:#a0aec0;text-align:right;">$${p.price.toFixed(2)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1e2030;font-size:14px;text-align:right;">
            <span style="
              background:${p.status === 'published' ? '#0d2e1a' : p.status === 'pending' ? '#2a1f0a' : '#2a0a0a'};
              color:${p.status === 'published' ? '#4ade80' : p.status === 'pending' ? '#fbbf24' : '#f87171'};
              padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;
            ">${p.status}</span>
          </td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:20px;text-align:center;color:#4a5568;font-size:14px;">No recent product activity</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Your Dropforge Daily Digest</title>
</head>
<body style="margin:0;padding:0;background:#0a0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0b0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="padding-bottom:32px;text-align:center;">
            <div style="display:inline-block;background:#13151c;border:1px solid #1e2030;border-radius:12px;padding:12px 24px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                ⚡ Drop<span style="color:#6c63ff;">forge</span>
              </span>
            </div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="padding-bottom:28px;text-align:center;">
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
              Your Daily Digest
            </h1>
            <p style="margin:0;font-size:15px;color:#718096;">
              ${storeName} · ${new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
          </td>
        </tr>

        <!-- STAT CARDS -->
        <tr>
          <td style="padding-bottom:28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="padding:4px;">
                  <div style="background:#13151c;border:1px solid #1e2030;border-radius:12px;padding:20px;text-align:center;">
                    <div style="font-size:32px;font-weight:700;color:#fbbf24;">${pending}</div>
                    <div style="font-size:12px;color:#718096;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Awaiting Review</div>
                  </div>
                </td>
                <td width="33%" style="padding:4px;">
                  <div style="background:#13151c;border:1px solid #1e2030;border-radius:12px;padding:20px;text-align:center;">
                    <div style="font-size:32px;font-weight:700;color:#4ade80;">${published}</div>
                    <div style="font-size:12px;color:#718096;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Published</div>
                  </div>
                </td>
                <td width="33%" style="padding:4px;">
                  <div style="background:#13151c;border:1px solid #1e2030;border-radius:12px;padding:20px;text-align:center;">
                    <div style="font-size:32px;font-weight:700;color:#f87171;">${rejected}</div>
                    <div style="font-size:12px;color:#718096;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Rejected</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- RECENT PRODUCTS TABLE -->
        <tr>
          <td style="padding-bottom:28px;">
            <div style="background:#13151c;border:1px solid #1e2030;border-radius:12px;overflow:hidden;">
              <div style="padding:16px 20px;border-bottom:1px solid #1e2030;">
                <span style="font-size:14px;font-weight:600;color:#a0aec0;text-transform:uppercase;letter-spacing:0.5px;">Recent Products</span>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="background:#0f1117;">
                  <th style="padding:8px 12px;text-align:left;font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
                  <th style="padding:8px 12px;text-align:right;font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
                  <th style="padding:8px 12px;text-align:right;font-size:11px;color:#4a5568;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
                </tr>
                ${productRows}
              </table>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        ${pending > 0 ? `
        <tr>
          <td style="padding-bottom:28px;text-align:center;">
            <div style="background:#13151c;border:1px solid #6c63ff;border-radius:12px;padding:24px;">
              <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;font-weight:600;">
                You have ${pending} product${pending !== 1 ? 's' : ''} waiting for your review
              </p>
              <a href="${appUrl}/Queue" style="
                display:inline-block;background:#6c63ff;color:#ffffff;
                text-decoration:none;padding:12px 28px;border-radius:8px;
                font-size:14px;font-weight:600;letter-spacing:0.3px;
              ">Review Now →</a>
            </div>
          </td>
        </tr>` : ''}

        <!-- FOOTER -->
        <tr>
          <td style="text-align:center;padding-top:8px;">
            <p style="margin:0 0 8px;font-size:12px;color:#2d3748;">
              Sent by Dropforge · <a href="${appUrl}/Settings" style="color:#6c63ff;text-decoration:none;">Manage digest settings</a>
            </p>
            <p style="margin:0;font-size:11px;color:#1e2030;">dropforge.pro</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// -------------------------------------------------------------------
// SEND VIA RESEND
// -------------------------------------------------------------------
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(data)}`);
  console.log(`Email sent to ${to} — Resend ID: ${data.id}`);
}

// -------------------------------------------------------------------
// MAIN HANDLER
// -------------------------------------------------------------------
Deno.serve(async (req) => {
  console.log('=== sendDigest START ===');

  try {
    const body = await req.json().catch(() => ({}));
    const targetStoreId = body.store_id || null;

    const base44 = createClientFromRequest(req);
    const db     = base44.asServiceRole.entities;

    // Load stores — all digest-enabled stores, or just the one requested
    const allStores = await db.Store.filter({ connection_status: 'connected' });
    const stores = targetStoreId
      ? allStores.filter((s: any) => s.id === targetStoreId)
      : allStores.filter((s: any) => s.digest_enabled !== false);

    console.log(`Processing ${stores.length} store(s)`);

    const results = [];

    for (const store of stores) {
      try {
        // Get product counts for this store
        const allProducts = await db.Product.filter({ store_id: store.id });

        const pending   = allProducts.filter((p: any) => p.status === 'pending').length;
        const published = allProducts.filter((p: any) => p.status === 'published').length;
        const rejected  = allProducts.filter((p: any) => p.status === 'rejected').length;

        // Get 5 most recent products for the table
        const recentProducts = [...allProducts]
          .sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
          .slice(0, 5)
          .map((p: any) => ({ title: p.title, price: p.price || 0, status: p.status }));

        // Build email
        const html = buildDigestHTML({
          storeName:      store.shopify_store_name || store.shopify_domain,
          pending,
          published,
          rejected,
          recentProducts,
          digestTime:     store.digest_time || '08:00',
          appUrl:         'https://dropforge.pro',
        });

        const subject = pending > 0
          ? `⚡ Dropforge Digest — ${pending} product${pending !== 1 ? 's' : ''} need your review`
          : `⚡ Dropforge Digest — ${published} products live in your store`;

        // Send email to store owner
        const toEmail = store.shopify_store_email || store.user_id;
        if (!toEmail || !toEmail.includes('@')) {
          console.warn(`No valid email for store ${store.id}, skipping`);
          continue;
        }

        await sendEmail(toEmail, subject, html);

        // Log the send
        await db.DigestLog.create({
          store_id:          store.id,
          user_id:           store.user_id,
          sent_at:           new Date().toISOString(),
          products_published: published,
          products_pending:   pending,
          products_rejected:  rejected,
          digest_html:        html,
          delivery_status:    'sent',
          error_message:      null,
        });

        results.push({ store_id: store.id, status: 'sent', to: toEmail });

      } catch (storeErr) {
        console.error(`Failed for store ${store.id}:`, String(storeErr));

        // Log the failure
        await db.DigestLog.create({
          store_id:        store.id,
          user_id:         store.user_id,
          sent_at:         new Date().toISOString(),
          delivery_status: 'failed',
          error_message:   String(storeErr),
        });

        results.push({ store_id: store.id, status: 'failed', error: String(storeErr) });
      }
    }

    console.log('=== sendDigest DONE ===', results);
    return Response.json({ success: true, results });

  } catch (e) {
    console.error('sendDigest fatal error:', String(e));
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
