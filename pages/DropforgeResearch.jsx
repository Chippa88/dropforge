import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, StoreNiche } from "@/api/entities";

const NICHES = [
  { key: "fitness",      label: "Fitness & Gym",      icon: "💪", keywords: ["resistance bands", "gym equipment", "fitness tracker"] },
  { key: "pets",         label: "Pet Supplies",        icon: "🐾", keywords: ["dog toys", "cat accessories", "pet grooming"] },
  { key: "home_decor",   label: "Home Decor",          icon: "🏠", keywords: ["wall art", "LED lights", "home organization"] },
  { key: "kitchen",      label: "Kitchen Gadgets",     icon: "🍳", keywords: ["kitchen tools", "cooking gadgets", "food storage"] },
  { key: "beauty",       label: "Beauty & Skincare",   icon: "✨", keywords: ["face roller", "skincare tools", "makeup organizer"] },
  { key: "tech",         label: "Tech Accessories",    icon: "💻", keywords: ["phone accessories", "wireless charger", "cable organizer"] },
  { key: "outdoor",      label: "Outdoor & Camping",   icon: "⛺", keywords: ["camping gear", "hiking accessories", "outdoor tools"] },
  { key: "baby",         label: "Baby & Kids",         icon: "👶", keywords: ["baby toys", "kids accessories", "nursery decor"] },
  { key: "jewelry",      label: "Jewelry & Accessories",icon: "💍", keywords: ["minimalist jewelry", "bracelet", "necklace"] },
  { key: "car",          label: "Car Accessories",     icon: "🚗", keywords: ["car organizer", "phone mount", "seat cushion"] },
];

export default function Research() {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [customKeyword, setCustomKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Store.list().then(stores => setStore(stores[0] || null));
  }, []);

  async function runSearch() {
    if (!selectedNiche && !customKeyword.trim()) return;
    setSearching(true);
    setError(null);
    setResults(null);

    const niche = selectedNiche || { key: "general", keywords: [customKeyword] };
    const keyword = customKeyword.trim() || niche.keywords[Math.floor(Math.random() * niche.keywords.length)];

    try {
      const res = await fetch("/functions/searchProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: store?.id || "",
          niche_key: niche.key,
          keyword,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSearching(false);
    }
  }

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
          <button key={item.label} onClick={() => navigate(item.path)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 24px", background: item.path === "/Research" ? "#13151c" : "transparent", border: "none", color: item.path === "/Research" ? "#e2e8f0" : "#718096", cursor: "pointer", fontSize: 14, textAlign: "left", borderLeft: item.path === "/Research" ? "2px solid #6c63ff" : "2px solid transparent" }}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, flex: 1, padding: "40px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Find Products</h1>
          <p style={{ margin: 0, color: "#4a5568", fontSize: 14 }}>Pick a niche, run the AI engine, and products appear in your queue.</p>
        </div>

        {/* NICHE GRID */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: "#718096", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Select a Niche</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {NICHES.map(niche => (
              <button
                key={niche.key}
                onClick={() => setSelectedNiche(selectedNiche?.key === niche.key ? null : niche)}
                style={{
                  background: selectedNiche?.key === niche.key ? "#1e1d3a" : "#13151c",
                  border: `1px solid ${selectedNiche?.key === niche.key ? "#6c63ff" : "#1e2030"}`,
                  borderRadius: 12, padding: "16px 12px", cursor: "pointer",
                  textAlign: "center", transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{niche.icon}</div>
                <div style={{ fontSize: 12, color: selectedNiche?.key === niche.key ? "#e2e8f0" : "#718096", fontWeight: 600, lineHeight: 1.3 }}>{niche.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOM KEYWORD */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: "#718096", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Or Enter a Custom Keyword</div>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              value={customKeyword}
              onChange={e => setCustomKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runSearch()}
              placeholder="e.g. posture corrector, beard kit, yoga mat..."
              style={{ flex: 1, background: "#13151c", border: "1px solid #1e2030", borderRadius: 10, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none" }}
            />
          </div>
        </div>

        {/* SELECTED STATE */}
        {selectedNiche && (
          <div style={{ background: "#1e1d3a", border: "1px solid #6c63ff44", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{selectedNiche.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{selectedNiche.label} selected</div>
              <div style={{ fontSize: 12, color: "#718096" }}>Will search for: {selectedNiche.keywords.join(", ")}</div>
            </div>
          </div>
        )}

        {/* RUN BUTTON */}
        <button
          onClick={runSearch}
          disabled={searching || (!selectedNiche && !customKeyword.trim())}
          style={{
            background: searching ? "#1e1d3a" : "#6c63ff",
            border: "none", color: "#fff",
            padding: "14px 36px", borderRadius: 12,
            cursor: searching || (!selectedNiche && !customKeyword.trim()) ? "not-allowed" : "pointer",
            fontSize: 15, fontWeight: 700, width: "100%", maxWidth: 400,
            opacity: (!selectedNiche && !customKeyword.trim()) ? 0.5 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          {searching ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚡</span>
              AI is finding products...
            </>
          ) : "⚡ Find Products with AI"}
        </button>

        {/* RESULTS */}
        {error && (
          <div style={{ marginTop: 24, background: "#2a0a0a", border: "1px solid #f8717144", borderRadius: 12, padding: "16px 20px", color: "#f87171", fontSize: 14 }}>
            ❌ {error}
          </div>
        )}

        {results && (
          <div style={{ marginTop: 24, background: "#0d2e1a", border: "1px solid #4ade8044", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>
              ✅ {results.saved} product{results.saved !== 1 ? "s" : ""} generated and added to your queue!
            </div>
            <div style={{ fontSize: 13, color: "#718096", marginBottom: 16 }}>
              {results.message || "Head to the Queue to review and approve them."}
            </div>
            <button
              onClick={() => navigate("/Queue")}
              style={{ background: "#4ade80", border: "none", color: "#0A0B0F", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
            >
              Review in Queue →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
