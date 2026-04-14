import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, DropforgeSubscription } from "@/api/entities";

export default function Settings() {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [digestTime, setDigestTime] = useState("08:00");
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);

  useEffect(() => {
    async function load() {
      const [stores, subs] = await Promise.all([Store.list(), DropforgeSubscription.list()]);
      const s = stores[0] || null;
      setStore(s);
      setSubscription(subs[0] || null);
      if (s) {
        setDigestTime(s.digest_time || "08:00");
        setDigestEnabled(s.digest_enabled !== false);
        setAutoPublish(s.auto_publish || false);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveSettings() {
    if (!store) return;
    setSaving(true);
    try {
      await Store.update(store.id, {
        digest_time:    digestTime,
        digest_enabled: digestEnabled,
        auto_publish:   autoPublish,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  const planColor = { starter: "#4ade80", growth: "#6c63ff", pro: "#38bdf8" };
  const currentPlan = subscription?.plan || "free";

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff", display: "flex" }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, background: "#0d0e13", borderRight: "1px solid #1e2030", padding: "24px 0", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0 }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1e2030", marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span></div>
        </div>
        {[
          { icon: "⬛", label: "Dashboard",    path: "/Dashboard" },
          { icon: "🔍", label: "Find Products", path: "/Research" },
          { icon: "✅", label: "Queue",         path: "/Queue" },
          { icon: "📦", label: "Products",      path: "/Products" },
          { icon: "📧", label: "Digest Logs",   path: "/DigestLogs" },
          { icon: "⚙️", label: "Settings",      path: "/Settings" },
        ].map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 24px", background: item.path === "/Settings" ? "#13151c" : "transparent", border: "none", color: item.path === "/Settings" ? "#e2e8f0" : "#718096", cursor: "pointer", fontSize: 14, textAlign: "left", borderLeft: item.path === "/Settings" ? "2px solid #6c63ff" : "2px solid transparent" }}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: "40px", maxWidth: 800 }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Settings</h1>
          <p style={{ margin: 0, color: "#4a5568", fontSize: 14 }}>Manage your store connection, digest preferences, and billing.</p>
        </div>

        {loading ? (
          <div style={{ color: "#4a5568" }}>Loading...</div>
        ) : (
          <>
            {/* STORE CONNECTION */}
            <section style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "28px", marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Shopify Store</div>
              {store ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{store.shopify_store_name || store.shopify_domain}</div>
                      <div style={{ fontSize: 13, color: "#4a5568" }}>{store.shopify_domain}</div>
                      {store.shopify_store_email && <div style={{ fontSize: 13, color: "#4a5568" }}>{store.shopify_store_email}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, background: store.connection_status === "connected" ? "#4ade80" : "#f87171", borderRadius: "50%", display: "inline-block" }} />
                      <span style={{ fontSize: 13, color: store.connection_status === "connected" ? "#4ade80" : "#f87171", fontWeight: 600, textTransform: "capitalize" }}>
                        {store.connection_status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "#0A0B0F", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Plan</div>
                      <div style={{ fontSize: 14, color: "#a0aec0", textTransform: "capitalize" }}>{store.shopify_plan}</div>
                    </div>
                    <div style={{ background: "#0A0B0F", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Last Synced</div>
                      <div style={{ fontSize: 14, color: "#a0aec0" }}>{store.last_synced ? new Date(store.last_synced).toLocaleDateString() : "Never"}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 14, color: "#718096", marginBottom: 16 }}>No store connected yet.</div>
                  <a href="https://dropforge.pro/functions/shopifyInstall?shop=your-store.myshopify.com" style={{ background: "#6c63ff", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    Connect Shopify Store →
                  </a>
                </div>
              )}
            </section>

            {/* DIGEST SETTINGS */}
            <section style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "28px", marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Daily Digest Email</div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Enable Daily Digest</div>
                  <div style={{ fontSize: 13, color: "#718096" }}>Receive a morning summary of your store activity.</div>
                </div>
                <button
                  onClick={() => setDigestEnabled(!digestEnabled)}
                  style={{ width: 48, height: 26, background: digestEnabled ? "#6c63ff" : "#1e2030", border: "none", borderRadius: 13, cursor: "pointer", position: "relative", transition: "background 0.2s" }}
                >
                  <span style={{ position: "absolute", top: 3, left: digestEnabled ? 26 : 4, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#a0aec0", fontWeight: 600, marginBottom: 8 }}>Delivery Time (your local time)</div>
                <input
                  type="time"
                  value={digestTime}
                  onChange={e => setDigestTime(e.target.value)}
                  style={{ background: "#0A0B0F", border: "1px solid #1e2030", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none" }}
                />
              </div>
            </section>

            {/* AUTO-PUBLISH */}
            <section style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "28px", marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Publishing</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Auto-Publish Mode</div>
                  <div style={{ fontSize: 13, color: "#718096" }}>Skip the approval queue — approved products publish instantly. Use with caution.</div>
                </div>
                <button
                  onClick={() => setAutoPublish(!autoPublish)}
                  style={{ width: 48, height: 26, background: autoPublish ? "#f87171" : "#1e2030", border: "none", borderRadius: 13, cursor: "pointer", position: "relative", transition: "background 0.2s" }}
                >
                  <span style={{ position: "absolute", top: 3, left: autoPublish ? 26 : 4, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
                </button>
              </div>
            </section>

            {/* BILLING */}
            <section style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "28px", marginBottom: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Billing</div>
              {subscription ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: planColor[currentPlan] || "#a0aec0", textTransform: "capitalize" }}>{currentPlan} Plan</span>
                      <span style={{ background: subscription.status === "active" ? "#0d2e1a" : "#2a0a0a", color: subscription.status === "active" ? "#4ade80" : "#f87171", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{subscription.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#718096" }}>
                      {subscription.products_used || 0} / {subscription.products_limit} products used · Renews {subscription.period_end ? new Date(subscription.period_end).toLocaleDateString() : "—"}
                    </div>
                  </div>
                  <button onClick={() => navigate("/Pricing")} style={{ background: "transparent", border: "1px solid #2d3748", color: "#a0aec0", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                    Manage Plan
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 14, color: "#718096" }}>No active subscription.</div>
                  <button onClick={() => navigate("/Pricing")} style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Choose a Plan →
                  </button>
                </div>
              )}
            </section>

            {/* SAVE */}
            <button
              onClick={saveSettings}
              disabled={saving || !store}
              style={{ background: saved ? "#4ade80" : "#6c63ff", border: "none", color: saved ? "#0A0B0F" : "#fff", padding: "14px 36px", borderRadius: 12, cursor: saving ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700, opacity: !store ? 0.5 : 1 }}
            >
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
