import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, DropforgeSubscription, Product, DigestLog } from "@/api/entities";
import { User } from "@/api/entities";

const MAX_STORES = 5;

function Sidebar({ navigate, active }) {
  const items = [
    { icon: "⬛", label: "Dashboard",     path: "/DropforgeDashboard"  },
    { icon: "🔍", label: "Find Products", path: "/DropforgeResearch"   },
    { icon: "✅", label: "Queue",          path: "/DropforgeQueue"      },
    { icon: "📊", label: "Analytics",     path: "/DropforgeAnalytics"  },
    { icon: "🏪", label: "My Stores",     path: "/DropforgeMultiStore" },
    { icon: "🌐", label: "Community",     path: "/DropforgeCommunity"  },
    { icon: "⚙️", label: "Settings",      path: "/DropforgeSettings"   },
  ];
  return (
    <aside style={{ width: 220, background: "#0d0e13", borderRight: "1px solid #1e2030", padding: "24px 0", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50 }}>
      <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1e2030", marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span></div>
      </div>
      {items.map(item => (
        <button key={item.label} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 24px", background: item.path === active ? "#13151c" : "transparent", border: "none", color: item.path === active ? "#e2e8f0" : "#718096", cursor: "pointer", fontSize: 14, textAlign: "left", borderLeft: item.path === active ? "2px solid #6c63ff" : "2px solid transparent", transition: "all 0.15s" }}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
    </aside>
  );
}

function StoreCard({ store, isActive, onSelect, onDisconnect, metrics }) {
  const statusColor = store.connection_status === "connected" ? "#4ade80" : "#f87171";
  return (
    <div
      onClick={() => onSelect(store.id)}
      style={{ background: isActive ? "#1a1c2e" : "#13151c", border: `1px solid ${isActive ? "#6c63ff" : "#1e2030"}`, borderRadius: 16, padding: "24px", cursor: "pointer", transition: "all 0.2s", position: "relative" }}
    >
      {isActive && (
        <div style={{ position: "absolute", top: 12, right: 12, background: "#6c63ff", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>Active</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, background: "#1e2030", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏪</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{store.shopify_store_name || store.shopify_domain}</div>
          <div style={{ fontSize: 12, color: "#4a5568" }}>{store.shopify_domain}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 16 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />
        <span style={{ fontSize: 12, color: statusColor, textTransform: "capitalize" }}>{store.connection_status || "unknown"}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Products", value: metrics?.products ?? "—" },
          { label: "Revenue",  value: metrics?.revenue != null ? `$${metrics.revenue.toFixed(0)}` : "—" },
          { label: "Orders",   value: metrics?.orders ?? "—" },
        ].map(s => (
          <div key={s.label} style={{ background: "#0A0B0F", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={e => { e.stopPropagation(); onSelect(store.id); }}
          style={{ flex: 1, background: isActive ? "#6c63ff" : "transparent", border: `1px solid ${isActive ? "#6c63ff" : "#2d3748"}`, color: isActive ? "#fff" : "#718096", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
        >
          {isActive ? "✓ Selected" : "Select Store"}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDisconnect(store.id, store.shopify_store_name || store.shopify_domain); }}
          style={{ background: "transparent", border: "1px solid #2d2030", color: "#718096", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
          title="Disconnect store"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function MultiStore() {
  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [stores, setStores]           = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [storeMetrics, setStoreMetrics] = useState({});
  const [loading, setLoading]         = useState(true);
  const [addingStore, setAddingStore] = useState(false);
  const [newDomain, setNewDomain]     = useState("");
  const [domainError, setDomainError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [disconnecting, setDisconnecting] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [u, subs, allStores] = await Promise.all([
        User.me?.(),
        DropforgeSubscription.list(),
        Store.list(),
      ]);
      setUser(u);
      setSubscription(subs?.[0] || null);
      setStores(allStores || []);

      // Set first connected store as active by default
      const firstConnected = (allStores || []).find(s => s.connection_status === "connected");
      if (firstConnected) setActiveStoreId(firstConnected.id);

      // Load quick metrics for each store
      await loadMetrics(allStores || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function loadMetrics(storeList) {
    const metrics = {};
    for (const store of storeList) {
      try {
        const products = await Product.filter({ store_id: store.id, status: "published" });
        metrics[store.id] = {
          products: (products || []).length,
          revenue:  null, // populated by analytics function
          orders:   null,
        };
      } catch (e) {
        metrics[store.id] = { products: 0, revenue: null, orders: null };
      }
    }
    setStoreMetrics(metrics);
  }

  async function connectNewStore() {
    setDomainError("");
    const raw    = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const domain = raw.includes(".myshopify.com") ? raw : raw + ".myshopify.com";

    if (!domain.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      setDomainError("Please enter a valid Shopify domain (e.g. my-store.myshopify.com)");
      return;
    }
    if (stores.find(s => s.shopify_domain === domain)) {
      setDomainError("This store is already connected to your account.");
      return;
    }

    setAddingStore(true);
    window.location.href = `https://dropforge.pro/functions/addStore?shop=${domain}`;
  }

  async function disconnectStore(storeId, storeName) {
    if (!confirm(`Disconnect "${storeName}"? This will remove it from your account. Products already published to Shopify will remain live.`)) return;
    setDisconnecting(storeId);
    try {
      await Store.update(storeId, { connection_status: "disconnected", shopify_access_token: "" });
      setStores(prev => prev.filter(s => s.id !== storeId));
      if (activeStoreId === storeId) {
        const remaining = stores.filter(s => s.id !== storeId && s.connection_status === "connected");
        setActiveStoreId(remaining[0]?.id || null);
      }
    } catch (e) { alert("Failed to disconnect: " + e.message); }
    finally { setDisconnecting(null); }
  }

  const isPro        = subscription?.plan === "pro" && subscription?.status === "active";
  const connectedCount = stores.filter(s => s.connection_status === "connected").length;
  const canAddMore   = isPro && connectedCount < MAX_STORES;
  const activeStore  = stores.find(s => s.id === activeStoreId);

  if (loading) return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif" }}>
      <div style={{ color: "#6c63ff" }}>Loading your stores...</div>
    </div>
  );

  // PAYWALL for non-Pro
  if (!isPro) return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: "#fff", display: "flex" }}>
      <Sidebar navigate={navigate} active="/DropforgeMultiStore" />
      <main style={{ marginLeft: 220, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 500 }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>🏪</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 12px" }}>Multi-Store Hub</h1>
          <p style={{ fontSize: 15, color: "#718096", lineHeight: 1.7, marginBottom: 32 }}>
            Connect up to 5 Shopify stores and manage them all from one dashboard. Route products to the right store, track metrics across your entire portfolio, and get a unified performance digest every morning.
          </p>
          <div style={{ background: "#13151c", border: "1px solid #38bdf844", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
            {["Up to 5 connected Shopify stores", "Route products per store", "Unified metrics dashboard", "Cross-store performance digest", "One login, every store"].map(f => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, fontSize: 14, color: "#a0aec0" }}>
                <span style={{ color: "#38bdf8" }}>✓</span> {f}
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/DropforgePricing")} style={{ background: "#38bdf8", border: "none", color: "#0A0B0F", padding: "14px 32px", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 800 }}>
            Upgrade to Pro →
          </button>
          <div style={{ marginTop: 12, fontSize: 13, color: "#4a5568" }}>$99/mo · 7-day free trial</div>
        </div>
      </main>
    </div>
  );

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: "#fff", display: "flex" }}>
      <Sidebar navigate={navigate} active="/DropforgeMultiStore" />
      <main style={{ marginLeft: 220, flex: 1, padding: "40px", overflowY: "auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 4px" }}>🏪 Multi-Store Hub</h1>
            <p style={{ margin: 0, color: "#4a5568", fontSize: 14 }}>
              {connectedCount} of {MAX_STORES} stores connected · Pro plan
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {canAddMore && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}
              >
                + Add Store
              </button>
            )}
            {!canAddMore && connectedCount >= MAX_STORES && (
              <div style={{ background: "#1e2030", border: "1px solid #2d3748", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#718096" }}>
                {MAX_STORES}/{MAX_STORES} stores connected
              </div>
            )}
          </div>
        </div>

        {/* ADD STORE FORM */}
        {showAddForm && (
          <div style={{ background: "#13151c", border: "1px solid #6c63ff44", borderRadius: 16, padding: "24px", marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Connect a New Store</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={newDomain}
                  onChange={e => { setNewDomain(e.target.value); setDomainError(""); }}
                  placeholder="my-store.myshopify.com"
                  style={{ width: "100%", background: "#0A0B0F", border: `1px solid ${domainError ? "#f87171" : "#1e2030"}`, borderRadius: 10, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
                {domainError && <div style={{ fontSize: 12, color: "#f87171", marginTop: 6 }}>{domainError}</div>}
                <div style={{ fontSize: 12, color: "#4a5568", marginTop: 6 }}>Find this in your Shopify admin settings — it always ends in .myshopify.com</div>
              </div>
              <button
                onClick={connectNewStore}
                disabled={!newDomain.trim() || addingStore}
                style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "12px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", opacity: !newDomain.trim() ? 0.5 : 1 }}
              >
                {addingStore ? "Connecting..." : "Connect →"}
              </button>
              <button onClick={() => setShowAddForm(false)} style={{ background: "transparent", border: "1px solid #2d3748", color: "#718096", padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STORE GRID */}
        {stores.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>No stores connected yet</div>
            <div style={{ fontSize: 14, color: "#4a5568", marginBottom: 24 }}>Add your first store to get started</div>
            <button onClick={() => setShowAddForm(true)} style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+ Add Your First Store</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {stores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                isActive={activeStoreId === store.id}
                onSelect={setActiveStoreId}
                onDisconnect={disconnectStore}
                metrics={storeMetrics[store.id]}
              />
            ))}

            {/* ADD STORE SLOT */}
            {canAddMore && !showAddForm && (
              <div
                onClick={() => setShowAddForm(true)}
                style={{ background: "transparent", border: "2px dashed #1e2030", borderRadius: 16, padding: "24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12, transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#6c63ff"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2030"}
              >
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#13151c", border: "1px solid #1e2030", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>+</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#4a5568" }}>Connect Another Store</div>
                <div style={{ fontSize: 12, color: "#2d3748" }}>{MAX_STORES - connectedCount} slot{MAX_STORES - connectedCount !== 1 ? "s" : ""} remaining</div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE STORE QUICK ACTIONS */}
        {activeStore && (
          <div style={{ marginTop: 40, background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
              Quick Actions · {activeStore.shopify_store_name || activeStore.shopify_domain}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/DropforgeResearch")} style={{ background: "#1e2030", border: "none", color: "#a0aec0", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>🔍 Find Products for this Store</button>
              <button onClick={() => navigate("/DropforgeQueue")}    style={{ background: "#1e2030", border: "none", color: "#a0aec0", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>✅ Review Queue</button>
              <button onClick={() => navigate("/DropforgeAnalytics")} style={{ background: "#1e2030", border: "none", color: "#a0aec0", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>📊 View Analytics</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
