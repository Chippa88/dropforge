import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Product, DropforgeSubscription } from "@/api/entities";
import { User } from "@/api/entities";

export default function Dashboard() {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [stores, prods, subs] = await Promise.all([
        Store.list(),
        Product.list(),
        DropforgeSubscription.list(),
      ]);
      setStore(stores[0] || null);
      setProducts(prods || []);
      setSubscription(subs[0] || null);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }

  const pending   = products.filter(p => p.status === "pending").length;
  const published = products.filter(p => p.status === "published").length;
  const rejected  = products.filter(p => p.status === "rejected").length;
  const approved  = products.filter(p => p.status === "approved").length;

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  const statusColor = {
    pending:   { bg: "#2a1f0a", text: "#fbbf24" },
    approved:  { bg: "#0d1f2a", text: "#38bdf8" },
    published: { bg: "#0d2e1a", text: "#4ade80" },
    rejected:  { bg: "#2a0a0a", text: "#f87171" },
    failed:    { bg: "#2a0a0a", text: "#f87171" },
  };

  if (loading) return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6c63ff", fontSize: 16 }}>Loading your store...</div>
    </div>
  );

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff", display: "flex" }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, background: "#0d0e13", borderRight: "1px solid #1e2030", padding: "24px 0", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0 }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1e2030", marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span></div>
        </div>
        {[
          { icon: "⬛", label: "Dashboard",  path: "/Dashboard" },
          { icon: "🔍", label: "Find Products", path: "/Research" },
          { icon: "✅", label: "Queue",       path: "/Queue" },
          { icon: "📦", label: "Products",    path: "/Products" },
          { icon: "📧", label: "Digest Logs", path: "/DigestLogs" },
          { icon: "⚙️", label: "Settings",    path: "/Settings" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "12px 24px", background: item.path === "/Dashboard" ? "#13151c" : "transparent",
              border: "none", color: item.path === "/Dashboard" ? "#e2e8f0" : "#718096",
              cursor: "pointer", fontSize: 14, textAlign: "left",
              borderLeft: item.path === "/Dashboard" ? "2px solid #6c63ff" : "2px solid transparent",
            }}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {subscription && (
          <div style={{ margin: "0 16px 16px", background: "#13151c", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Plan</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6c63ff", textTransform: "capitalize" }}>{subscription.plan}</div>
            <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>{subscription.products_used || 0}/{subscription.products_limit} products</div>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: "40px 40px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Dashboard</h1>
            <p style={{ margin: 0, color: "#4a5568", fontSize: 14 }}>
              {store ? `Connected: ${store.shopify_store_name || store.shopify_domain}` : "No store connected"}
            </p>
          </div>
          <button
            onClick={() => navigate("/Research")}
            style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            + Find Products
          </button>
        </div>

        {/* STORE STATUS BANNER */}
        {!store && (
          <div style={{ background: "#13151c", border: "1px solid #fbbf2444", borderRadius: 14, padding: "20px 24px", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fbbf24", marginBottom: 4 }}>No Shopify store connected</div>
              <div style={{ fontSize: 13, color: "#718096" }}>Connect your store to start generating products automatically.</div>
            </div>
            <a href={`https://dropforge.pro/functions/shopifyInstall?shop=your-store.myshopify.com`} style={{ background: "#fbbf24", color: "#0A0B0F", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Connect Store →
            </a>
          </div>
        )}

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
          {[
            { label: "Awaiting Review", value: pending,   color: "#fbbf24", icon: "⏳" },
            { label: "Approved",        value: approved,  color: "#38bdf8", icon: "✅" },
            { label: "Published",       value: published, color: "#4ade80", icon: "🚀" },
            { label: "Rejected",        value: rejected,  color: "#f87171", icon: "❌" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 14, padding: "24px 20px" }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: stat.color, letterSpacing: "-1px" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#4a5568", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* RECENT PRODUCTS */}
        <div style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #1e2030" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 0.5 }}>Recent Products</div>
            <button onClick={() => navigate("/Products")} style={{ background: "transparent", border: "none", color: "#6c63ff", fontSize: 13, cursor: "pointer" }}>View all →</button>
          </div>
          {recentProducts.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#4a5568" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 15, marginBottom: 8, color: "#718096" }}>No products yet</div>
              <button onClick={() => navigate("/Research")} style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Find your first products →
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f1117" }}>
                  <th style={{ padding: "10px 24px", textAlign: "left", fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Product</th>
                  <th style={{ padding: "10px 24px", textAlign: "right", fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Price</th>
                  <th style={{ padding: "10px 24px", textAlign: "right", fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((p) => {
                  const s = statusColor[p.status] || { bg: "#1e2030", text: "#a0aec0" };
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #1e2030" }}>
                      <td style={{ padding: "14px 24px", fontSize: 14, color: "#e2e8f0", maxWidth: 400 }}>
                        <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                        <div style={{ fontSize: 12, color: "#4a5568", marginTop: 2 }}>{p.niche_key}</div>
                      </td>
                      <td style={{ padding: "14px 24px", textAlign: "right", fontSize: 14, color: "#a0aec0" }}>${p.price?.toFixed(2)}</td>
                      <td style={{ padding: "14px 24px", textAlign: "right" }}>
                        <span style={{ background: s.bg, color: s.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* QUICK ACTIONS */}
        {pending > 0 && (
          <div style={{ background: "#13151c", border: "1px solid #6c63ff44", borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                {pending} product{pending !== 1 ? "s" : ""} waiting for your review
              </div>
              <div style={{ fontSize: 13, color: "#718096" }}>Approve or reject them before they can be published.</div>
            </div>
            <button onClick={() => navigate("/Queue")} style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
              Review Now →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
