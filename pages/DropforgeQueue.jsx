import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/api/entities";

export default function Queue() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState({});
  const [filter, setFilter] = useState("pending");

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      const all = await Product.list();
      setProducts(all || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function approveProduct(id) {
    await Product.update(id, { status: "approved" });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
  }

  async function rejectProduct(id) {
    await Product.update(id, { status: "rejected" });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" } : p));
  }

  async function publishProduct(id) {
    setPublishing(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/functions/publishProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "published" } : p));
      } else {
        alert("Publish failed: " + (data.error || "Unknown error"));
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "failed" } : p));
      }
    } catch (e) {
      alert("Publish error: " + e.message);
    } finally {
      setPublishing(prev => ({ ...prev, [id]: false }));
    }
  }

  const filtered = products.filter(p => p.status === filter);

  const tabs = [
    { key: "pending",   label: "Pending",   color: "#fbbf24" },
    { key: "approved",  label: "Approved",  color: "#38bdf8" },
    { key: "published", label: "Published", color: "#4ade80" },
    { key: "rejected",  label: "Rejected",  color: "#f87171" },
  ];

  const statusColor = {
    pending:   { bg: "#2a1f0a", text: "#fbbf24" },
    approved:  { bg: "#0d1f2a", text: "#38bdf8" },
    published: { bg: "#0d2e1a", text: "#4ade80" },
    rejected:  { bg: "#2a0a0a", text: "#f87171" },
    failed:    { bg: "#2a0a0a", text: "#f87171" },
  };

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
          <button key={item.label} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 24px", background: item.path === "/Queue" ? "#13151c" : "transparent", border: "none", color: item.path === "/Queue" ? "#e2e8f0" : "#718096", cursor: "pointer", fontSize: 14, textAlign: "left", borderLeft: item.path === "/Queue" ? "2px solid #6c63ff" : "2px solid transparent" }}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: "40px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Product Queue</h1>
          <p style={{ margin: 0, color: "#4a5568", fontSize: 14 }}>Review, approve, or reject AI-generated products before they go live.</p>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "#13151c", borderRadius: 12, padding: 6, width: "fit-content", border: "1px solid #1e2030" }}>
          {tabs.map(tab => {
            const count = products.filter(p => p.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: filter === tab.key ? "#1e2030" : "transparent", color: filter === tab.key ? tab.color : "#718096", cursor: "pointer", fontSize: 13, fontWeight: filter === tab.key ? 600 : 400, display: "flex", alignItems: "center", gap: 6 }}
              >
                {tab.label}
                <span style={{ background: filter === tab.key ? tab.color + "22" : "#1e2030", color: filter === tab.key ? tab.color : "#4a5568", padding: "1px 7px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* PRODUCT CARDS */}
        {loading ? (
          <div style={{ color: "#4a5568", textAlign: "center", padding: 60 }}>Loading products...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#4a5568" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 16, color: "#718096" }}>No {filter} products</div>
            {filter === "pending" && (
              <button onClick={() => navigate("/Research")} style={{ marginTop: 16, background: "#6c63ff", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Find Products →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((product) => {
              const s = statusColor[product.status] || { bg: "#1e2030", text: "#a0aec0" };
              return (
                <div key={product.id} style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "24px", display: "flex", gap: 20, alignItems: "flex-start" }}>

                  {/* IMAGE */}
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1px solid #1e2030" }} />
                  ) : (
                    <div style={{ width: 80, height: 80, background: "#1e2030", borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📦</div>
                  )}

                  {/* INFO */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{product.title}</div>
                      <span style={{ background: s.bg, color: s.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase", flexShrink: 0 }}>
                        {product.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "#718096", lineHeight: 1.6, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {product.description}
                    </div>
                    <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
                      <div><span style={{ color: "#4a5568" }}>Retail: </span><span style={{ color: "#4ade80", fontWeight: 700 }}>${product.price?.toFixed(2)}</span></div>
                      <div><span style={{ color: "#4a5568" }}>Compare: </span><span style={{ color: "#718096", textDecoration: "line-through" }}>${product.compare_at_price?.toFixed(2)}</span></div>
                      <div><span style={{ color: "#4a5568" }}>Cost: </span><span style={{ color: "#718096" }}>${product.cost_price?.toFixed(2)}</span></div>
                      <div><span style={{ color: "#4a5568" }}>Niche: </span><span style={{ color: "#6c63ff" }}>{product.niche_key}</span></div>
                    </div>
                    {Array.isArray(product.tags) && product.tags.length > 0 && (
                      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {product.tags.map(tag => (
                          <span key={tag} style={{ background: "#1e2030", color: "#718096", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                    {product.status === "pending" && (
                      <>
                        <button onClick={() => approveProduct(product.id)} style={{ background: "#0d2e1a", border: "1px solid #4ade8044", color: "#4ade80", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                          ✓ Approve
                        </button>
                        <button onClick={() => rejectProduct(product.id)} style={{ background: "#2a0a0a", border: "1px solid #f8717144", color: "#f87171", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                          ✕ Reject
                        </button>
                      </>
                    )}
                    {product.status === "approved" && (
                      <button
                        onClick={() => publishProduct(product.id)}
                        disabled={publishing[product.id]}
                        style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: publishing[product.id] ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, opacity: publishing[product.id] ? 0.7 : 1 }}
                      >
                        {publishing[product.id] ? "Publishing..." : "🚀 Publish"}
                      </button>
                    )}
                    {product.supplier_url && (
                      <a href={product.supplier_url} target="_blank" rel="noreferrer" style={{ background: "transparent", border: "1px solid #1e2030", color: "#718096", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, textAlign: "center", textDecoration: "none" }}>
                        View Source
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
