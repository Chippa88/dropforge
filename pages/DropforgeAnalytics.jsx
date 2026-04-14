import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Product, DropforgeSubscription } from "@/api/entities";

export default function Analytics() {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(false);
  const [replacing, setReplacing] = useState({});
  const [sortBy, setSortBy] = useState("revenue");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [stores, prods, subs] = await Promise.all([
        Store.list(), Product.list(), DropforgeSubscription.list()
      ]);
      const s = stores[0] || null;
      setStore(s);
      setSubscription(subs[0] || null);
      const published = (prods || []).filter(p => p.status === "published");
      setProducts(published);
      if (s?.shopify_access_token) await fetchSalesData(s, published);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSalesData(store, publishedProducts) {
    setLoadingSales(true);
    try {
      // Fetch orders from Shopify via our backend
      const res = await fetch("/functions/getStoreAnalytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: store.id }),
      });
      const data = await res.json();
      if (data.products) {
        setSalesData(data.products);
      } else {
        // Fallback: show published products with 0 sales (analytics function not yet hit)
        setSalesData(publishedProducts.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          niche_key: p.niche_key,
          shopify_product_id: p.shopify_product_id,
          images: p.images,
          cost_price: p.cost_price,
          orders: 0,
          revenue: 0,
          units_sold: 0,
          days_live: p.published_at ? Math.floor((Date.now() - new Date(p.published_at)) / 86400000) : 0,
          is_weak: true,
        })));
      }
    } catch (e) {
      // Fallback display if analytics function not deployed yet
      setSalesData(publishedProducts.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        niche_key: p.niche_key,
        shopify_product_id: p.shopify_product_id,
        images: p.images,
        cost_price: p.cost_price,
        orders: 0,
        revenue: 0,
        units_sold: 0,
        days_live: p.published_at ? Math.floor((Date.now() - new Date(p.published_at)) / 86400000) : 0,
        is_weak: false,
      })));
    } finally {
      setLoadingSales(false);
    }
  }

  async function replaceProduct(productId, nicheKey) {
    setReplacing(prev => ({ ...prev, [productId]: true }));
    try {
      // Mark old product as rejected
      await Product.update(productId, { status: "rejected", rejection_reason: "Replaced — low sales performance" });
      // Queue new product search for same niche
      const res = await fetch("/functions/searchProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: store?.id || "", niche_key: nicheKey, keyword: nicheKey.replace("_", " ") }),
      });
      const data = await res.json();
      if (data.saved > 0) {
        alert(`✅ Replaced! ${data.saved} new product${data.saved !== 1 ? "s" : ""} added to your queue.`);
        setSalesData(prev => prev.filter(p => p.id !== productId));
      }
    } catch (e) {
      alert("Replace failed: " + e.message);
    } finally {
      setReplacing(prev => ({ ...prev, [productId]: false }));
    }
  }

  const plan = subscription?.plan || "free";
  const hasAnalytics = plan === "growth" || plan === "pro";

  const sorted = [...salesData].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "orders") return b.orders - a.orders;
    if (sortBy === "days") return b.days_live - a.days_live;
    if (sortBy === "weak") return (b.is_weak ? 1 : 0) - (a.is_weak ? 1 : 0);
    return 0;
  });

  const totalRevenue = salesData.reduce((s, p) => s + (p.revenue || 0), 0);
  const totalOrders  = salesData.reduce((s, p) => s + (p.orders || 0), 0);
  const weakProducts = salesData.filter(p => p.is_weak || (p.days_live >= 7 && p.orders === 0));
  const topProduct   = salesData.reduce((best, p) => (!best || p.revenue > best.revenue) ? p : best, null);

  const Sidebar = () => (
    <aside style={{ width: 220, background: "#0d0e13", borderRight: "1px solid #1e2030", padding: "24px 0", position: "fixed", top: 0, bottom: 0, left: 0 }}>
      <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1e2030", marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span></div>
      </div>
      {[
        { icon: "⬛", label: "Dashboard",    path: "/Dashboard" },
        { icon: "🔍", label: "Find Products", path: "/Research" },
        { icon: "✅", label: "Queue",         path: "/Queue" },
        { icon: "📊", label: "Analytics",     path: "/Analytics" },
        { icon: "📧", label: "Digest Logs",   path: "/DigestLogs" },
        { icon: "⚙️", label: "Settings",      path: "/Settings" },
      ].map((item) => (
        <button key={item.label} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 24px", background: item.path === "/Analytics" ? "#13151c" : "transparent", border: "none", color: item.path === "/Analytics" ? "#e2e8f0" : "#718096", cursor: "pointer", fontSize: 14, textAlign: "left", borderLeft: item.path === "/Analytics" ? "2px solid #6c63ff" : "2px solid transparent" }}>
          <span>{item.icon}</span> {item.label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      {subscription && (
        <div style={{ margin: "16px 16px 16px", background: "#13151c", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Plan</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#6c63ff", textTransform: "capitalize" }}>{plan}</div>
        </div>
      )}
    </aside>
  );

  if (loading) return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6c63ff" }}>Loading analytics...</div>
    </div>
  );

  // PAYWALL for Starter/Free users
  if (!hasAnalytics) return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff", display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>📊</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 12px" }}>Sales Analytics</h1>
          <p style={{ fontSize: 15, color: "#718096", lineHeight: 1.7, marginBottom: 32 }}>
            See exactly which products are making money and which are wasting shelf space. Auto-replace weak performers with one click. Available on Growth and Pro plans.
          </p>
          <div style={{ background: "#13151c", border: "1px solid #6c63ff44", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
            {["Revenue per product", "Orders & units sold", "Days live vs. sales ratio", "Weak product alerts", "Auto-replace with better products"].map(f => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, fontSize: 14, color: "#a0aec0" }}>
                <span style={{ color: "#6c63ff" }}>✓</span> {f}
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/Pricing")} style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "14px 32px", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
            Upgrade to Growth →
          </button>
          <div style={{ marginTop: 12, fontSize: 13, color: "#4a5568" }}>Starting at $59/mo · 7-day free trial</div>
        </div>
      </main>
    </div>
  );

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff", display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: "40px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Sales Analytics</h1>
            <p style={{ margin: 0, color: "#4a5568", fontSize: 14 }}>
              {loadingSales ? "Fetching live data from Shopify..." : `${salesData.length} published products · ${weakProducts.length} need attention`}
            </p>
          </div>
          {weakProducts.length > 0 && (
            <div style={{ background: "#2a1a0a", border: "1px solid #f59e0b44", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>
              ⚠️ {weakProducts.length} weak product{weakProducts.length !== 1 ? "s" : ""} detected
            </div>
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
          {[
            { label: "Total Revenue",    value: `$${totalRevenue.toFixed(2)}`,  color: "#4ade80", icon: "💰" },
            { label: "Total Orders",     value: totalOrders,                    color: "#6c63ff", icon: "🛒" },
            { label: "Products Live",    value: salesData.length,               color: "#38bdf8", icon: "📦" },
            { label: "Need Attention",   value: weakProducts.length,            color: "#f87171", icon: "⚠️" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 14, padding: "24px 20px" }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, letterSpacing: "-1px" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#4a5568", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* TOP PERFORMER BANNER */}
        {topProduct && topProduct.revenue > 0 && (
          <div style={{ background: "#0d2e1a", border: "1px solid #4ade8044", borderRadius: 14, padding: "20px 24px", marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 32 }}>🏆</div>
            <div>
              <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Top Performer</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{topProduct.title}</div>
              <div style={{ fontSize: 13, color: "#718096" }}>${topProduct.revenue.toFixed(2)} revenue · {topProduct.orders} orders</div>
            </div>
          </div>
        )}

        {/* PRODUCT TABLE */}
        <div style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #1e2030" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 0.5 }}>Product Performance</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["revenue", "Revenue"], ["orders", "Orders"], ["days", "Days Live"], ["weak", "Weakest First"]].map(([key, label]) => (
                <button key={key} onClick={() => setSortBy(key)} style={{ background: sortBy === key ? "#1e2030" : "transparent", border: "1px solid #1e2030", color: sortBy === key ? "#e2e8f0" : "#718096", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {sorted.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#4a5568" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
              <div style={{ fontSize: 15, color: "#718096" }}>No published products yet</div>
              <button onClick={() => navigate("/Research")} style={{ marginTop: 16, background: "#6c63ff", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Find Products →
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f1117" }}>
                  <th style={{ padding: "10px 24px", textAlign: "left",  fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Product</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Revenue</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Orders</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Days Live</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</th>
                  <th style={{ padding: "10px 24px", textAlign: "right", fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((product) => {
                  const isWeak = product.is_weak || (product.days_live >= 7 && product.orders === 0);
                  const isTop  = topProduct && product.id === topProduct.id && product.revenue > 0;
                  return (
                    <tr key={product.id} style={{ borderBottom: "1px solid #1e2030", background: isWeak ? "#1a0f0f" : "transparent" }}>
                      <td style={{ padding: "14px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {product.images?.[0]
                            ? <img src={product.images[0]} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid #1e2030" }} />
                            : <div style={{ width: 40, height: 40, background: "#1e2030", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                          }
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.title}</div>
                            <div style={{ fontSize: 12, color: "#4a5568" }}>{product.niche_key} · ${product.price?.toFixed(2)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, color: product.revenue > 0 ? "#4ade80" : "#4a5568", fontWeight: product.revenue > 0 ? 700 : 400 }}>
                        ${(product.revenue || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, color: product.orders > 0 ? "#e2e8f0" : "#4a5568" }}>
                        {product.orders || 0}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, color: "#718096" }}>
                        {product.days_live || 0}d
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        {isTop
                          ? <span style={{ background: "#0d2e1a", color: "#4ade80", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>🏆 Top</span>
                          : isWeak
                            ? <span style={{ background: "#2a0a0a", color: "#f87171", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>⚠️ Weak</span>
                            : <span style={{ background: "#0d1f2a", color: "#38bdf8", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ Active</span>
                        }
                      </td>
                      <td style={{ padding: "14px 24px", textAlign: "right" }}>
                        {isWeak && (
                          <button
                            onClick={() => replaceProduct(product.id, product.niche_key)}
                            disabled={replacing[product.id]}
                            style={{ background: "#2a1a0a", border: "1px solid #f59e0b44", color: "#f59e0b", padding: "6px 14px", borderRadius: 8, cursor: replacing[product.id] ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, opacity: replacing[product.id] ? 0.6 : 1 }}
                          >
                            {replacing[product.id] ? "Replacing..." : "🔄 Replace"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
