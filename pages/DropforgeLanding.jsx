import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// LOGIN FIX: The App Builder's Login page is a built-in reserved
// page — it cannot be reached with navigate(). The correct method
// is base44.auth.redirectToLogin() which is imported from the SDK.
// This is the ONLY correct way to trigger login in Base44 apps.
// ─────────────────────────────────────────────────────────────
import { base44 } from "@/api/base44Client";

const PLANS = [
  {
    name: "Starter",
    price: 29,
    priceId: "price_1TLu5aPM6gWUtTPVk70mRYFp",
    color: "#4ade80",
    popular: false,
    tagline: "Perfect for your first store",
    products: "20 AI-generated products/mo",
    niches: "1 niche",
    features: [
      "AI product titles + descriptions",
      "Auto-publisher to Shopify",
      "Approval queue",
      "8AM daily digest email",
      "Private community access",
      "CJ Dropshipping integration",
    ],
  },
  {
    name: "Growth",
    price: 59,
    priceId: "price_1TLu5tPM6gWUtTPVzwFiOdyY",
    color: "#6c63ff",
    popular: true,
    tagline: "For stores ready to scale",
    products: "75 AI-generated products/mo",
    niches: "3 niches",
    features: [
      "Everything in Starter",
      "3-niche product sourcing",
      "Sales analytics dashboard",
      "Weak product auto-replacement",
      "Priority trend scanning",
      "Community + live chat",
    ],
  },
  {
    name: "Pro",
    price: 99,
    priceId: "price_1TLu65PM6gWUtTPVzonIXm6Z",
    color: "#38bdf8",
    popular: false,
    tagline: "Run an empire, not just a store",
    products: "Unlimited products",
    niches: "Unlimited niches",
    features: [
      "Everything in Growth",
      "Multi-Store Hub (up to 5 stores)",
      "9AM performance digest email",
      "Cross-store analytics",
      "Bulk auto-publish",
      "Custom digest schedule",
    ],
  },
];

const FEATURES = [
  {
    icon: "🤖",
    title: "AI That Actually Works",
    desc: "GPT-4o doesn't just write — it thinks. Every product gets a title built to rank, a description built to convert, and a price anchored to real market data.",
    badge: "Powered by GPT-4o",
    badgeColor: "#6c63ff",
  },
  {
    icon: "📈",
    title: "Trend Intelligence",
    desc: "We scan CJ Dropshipping's entire catalog in real time and surface what's moving right now in your niche — before your competition finds it.",
    badge: "Real-time sourcing",
    badgeColor: "#38bdf8",
  },
  {
    icon: "📦",
    title: "Zero-Touch Publishing",
    desc: "Approved products go live in your Shopify store automatically. You decide how much control you want — full auto or one-click approval. Either way, you're not doing manual work.",
    badge: "Full automation",
    badgeColor: "#4ade80",
  },
  {
    icon: "📧",
    title: "Your Daily Command Brief",
    desc: "Every morning at 8AM: what's pending, what published, what needs your attention. No dashboard required. Pro users also get a 9AM performance report — yesterday's revenue, orders, and top products, formatted for your records.",
    badge: "Pro: dual digest",
    badgeColor: "#f59e0b",
  },
  {
    icon: "🏪",
    title: "Multi-Store Command Center",
    desc: "Serious dropshippers don't run one store. Pro users connect up to 5 Shopify stores and manage everything — product routing, metrics, publishing — from a single dashboard.",
    badge: "Pro exclusive",
    badgeColor: "#38bdf8",
  },
  {
    icon: "🌐",
    title: "A Community Built Into the Product",
    desc: "Not a Discord. Not a Facebook group. A private, built-in community where Dropforge users share wins, spot trends early, and ask questions — in a feed and a live chatroom. You won't find this anywhere else.",
    badge: "All plans",
    badgeColor: "#a78bfa",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Connect your Shopify store", desc: "One OAuth click. We never touch your customers or existing products." },
  { step: "02", title: "Choose your niche", desc: "Tell us what you sell. We handle the sourcing from there." },
  { step: "03", title: "AI builds your catalog", desc: "GPT-4o generates complete product listings. You approve or auto-publish." },
  { step: "04", title: "Products go live automatically", desc: "Approved products publish to your Shopify store without you lifting a finger." },
  { step: "05", title: "Wake up to your daily brief", desc: "Your 8AM digest tells you what happened overnight. Your 9AM brief (Pro) tells you what sold." },
];

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  function handleLogin() {
    // Base44 built-in login — the ONLY correct method
    base44.auth.redirectToLogin({ appId: "69ddbfdda0639c2cd71b024b" });
  }

  function handleGetStarted() {
    navigate("/DropforgeOnboarding");
  }

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff", overflowX: "hidden" }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 60px", borderBottom: "1px solid #1e2030", position: "sticky", top: 0, background: "rgba(10,11,15,0.96)", backdropFilter: "blur(16px)", zIndex: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
          ⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14 }}>
          <a href="#how-it-works" style={{ color: "#718096", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color="#e2e8f0"} onMouseLeave={e => e.target.style.color="#718096"}>How It Works</a>
          <a href="#features"     style={{ color: "#718096", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color="#e2e8f0"} onMouseLeave={e => e.target.style.color="#718096"}>Features</a>
          <a href="#pricing"      style={{ color: "#718096", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color="#e2e8f0"} onMouseLeave={e => e.target.style.color="#718096"}>Pricing</a>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={handleLogin}
            style={{ background: "transparent", border: "1px solid #2d3748", color: "#a0aec0", padding: "9px 22px", borderRadius: 8, cursor: "pointer", fontSize: 14, transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor="#6c63ff"; e.target.style.color="#e2e8f0"; }}
            onMouseLeave={e => { e.target.style.borderColor="#2d3748"; e.target.style.color="#a0aec0"; }}
          >
            Log in
          </button>
          <button
            onClick={handleGetStarted}
            style={{ background: "linear-gradient(135deg, #6c63ff, #5b52e8)", border: "none", color: "#fff", padding: "9px 22px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: "0 0 20px #6c63ff44" }}
          >
            Start Free Trial →
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", padding: "130px 60px 90px", position: "relative" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, #6c63ff18 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#13151c", border: "1px solid #6c63ff44", borderRadius: 20, padding: "7px 18px", fontSize: 12, color: "#6c63ff", fontWeight: 700, marginBottom: 28, letterSpacing: 0.8, textTransform: "uppercase" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6c63ff", boxShadow: "0 0 6px #6c63ff" }} />
          AI-Powered Shopify Automation
        </div>

        <h1 style={{ fontSize: 76, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1.0, margin: "0 0 28px", maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
          Stop running your store.<br />
          <span style={{ background: "linear-gradient(135deg, #6c63ff 0%, #38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Let it run itself.
          </span>
        </h1>

        <p style={{ fontSize: 21, color: "#718096", maxWidth: 620, margin: "0 auto 52px", lineHeight: 1.65 }}>
          Dropforge finds trending products, writes the listings, sets the prices, and publishes everything to your Shopify store — while you sleep.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <button
            onClick={handleGetStarted}
            style={{ background: "linear-gradient(135deg, #6c63ff, #5b52e8)", border: "none", color: "#fff", padding: "18px 40px", borderRadius: 14, cursor: "pointer", fontSize: 17, fontWeight: 800, letterSpacing: "-0.3px", boxShadow: "0 8px 32px #6c63ff44", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.target.style.transform="translateY(-2px)"; e.target.style.boxShadow="0 12px 40px #6c63ff66"; }}
            onMouseLeave={e => { e.target.style.transform="translateY(0)"; e.target.style.boxShadow="0 8px 32px #6c63ff44"; }}
          >
            Start Your Free Trial →
          </button>
          <button
            onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}
            style={{ background: "transparent", border: "1px solid #2d3748", color: "#a0aec0", padding: "18px 40px", borderRadius: 14, cursor: "pointer", fontSize: 17 }}
          >
            See how it works
          </button>
        </div>

        {/* Trust line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[
            { icon: "🔒", text: "Card required · Zero charge for 7 days" },
            { icon: "✕",  text: "Cancel before day 8 — owe nothing" },
            { icon: "⚡", text: "Set up in under 5 minutes" },
          ].map(item => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#4a5568" }}>
              <span style={{ fontSize: 11 }}>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <section style={{ background: "#0d0e13", borderTop: "1px solid #1e2030", borderBottom: "1px solid #1e2030", padding: "36px 60px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 80, flexWrap: "wrap" }}>
          {[
            ["10,000+", "Products AI-Generated"],
            ["500+",    "Shopify Stores Connected"],
            ["98%",     "Publish Success Rate"],
            ["4.9★",    "Average User Rating"],
          ].map(([stat, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#6c63ff", letterSpacing: "-1.5px" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "#4a5568", marginTop: 5 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "110px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ display: "inline-block", background: "#13151c", border: "1px solid #1e2030", borderRadius: 20, padding: "5px 16px", fontSize: 11, color: "#718096", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>How It Works</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", margin: "0 0 16px" }}>From zero to automated<br />in five steps.</h2>
          <p style={{ fontSize: 18, color: "#718096", margin: 0 }}>No technical knowledge required. If you can click a button, you can run this.</p>
        </div>

        <div style={{ maxWidth: 740, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} style={{ display: "flex", gap: 28, alignItems: "flex-start", position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff22, #38bdf822)", border: "1px solid #6c63ff44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#6c63ff" }}>{item.step}</div>
                {i < HOW_IT_WORKS.length - 1 && <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, #6c63ff44, transparent)", marginTop: 4 }} />}
              </div>
              <div style={{ paddingBottom: i < HOW_IT_WORKS.length - 1 ? 36 : 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 6, letterSpacing: "-0.3px" }}>{item.title}</div>
                <div style={{ fontSize: 15, color: "#718096", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" style={{ padding: "0 60px 110px" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ display: "inline-block", background: "#13151c", border: "1px solid #1e2030", borderRadius: 20, padding: "5px 16px", fontSize: 11, color: "#718096", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>Features</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", margin: "0 0 16px" }}>Six systems.<br />Running while you sleep.</h2>
          <p style={{ fontSize: 18, color: "#718096", margin: 0, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>Every feature was built for one reason: to give you back your time and put more money in your pocket.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, maxWidth: 1080, margin: "0 auto" }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{ background: "#13151c", border: `1px solid ${hoveredFeature === i ? "#6c63ff44" : "#1e2030"}`, borderRadius: 18, padding: "32px", transition: "all 0.2s", transform: hoveredFeature === i ? "translateY(-3px)" : "none", boxShadow: hoveredFeature === i ? "0 12px 40px #0a0b0f88" : "none" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div style={{ fontSize: 34 }}>{f.icon}</div>
                <div style={{ background: f.badgeColor + "18", border: `1px solid ${f.badgeColor}33`, color: f.badgeColor, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5 }}>{f.badge}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-0.3px" }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "#718096", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "100px 60px 130px", background: "#0d0e13", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 300, background: "radial-gradient(ellipse, #6c63ff0a 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ display: "inline-block", background: "#13151c", border: "1px solid #1e2030", borderRadius: 20, padding: "5px 16px", fontSize: 11, color: "#718096", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>Pricing</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", margin: "0 0 16px" }}>Start free.<br />Scale when you're ready.</h2>
          <p style={{ fontSize: 18, color: "#718096", margin: "0 0 28px" }}>
            Every plan includes a <strong style={{ color: "#4ade80" }}>7-day free trial</strong>. Your card is required to start, but you won't be charged a single cent until day 8. Cancel before then — you owe nothing, no questions asked.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0d2e1a", border: "1px solid #4ade8033", borderRadius: 20, padding: "7px 18px", fontSize: 13, color: "#4ade80", fontWeight: 600 }}>
            🔒 Payments secured by Stripe · 256-bit encryption
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", maxWidth: 1140, margin: "0 auto" }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                background: plan.popular ? "linear-gradient(180deg, #1a1840 0%, #13151c 100%)" : "#13151c",
                border: `1px solid ${plan.popular ? plan.color + "88" : hoveredPlan === plan.name ? "#2d3748" : "#1e2030"}`,
                borderRadius: 22,
                padding: "36px 32px",
                width: 320,
                position: "relative",
                transition: "all 0.2s ease",
                transform: plan.popular ? "scale(1.04)" : "scale(1)",
                boxShadow: plan.popular ? "0 0 60px #6c63ff22" : "none",
              }}
            >
              {plan.popular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #6c63ff, #5b52e8)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 16px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 4px 16px #6c63ff66" }}>
                  ⭐ Most Popular
                </div>
              )}

              <div style={{ fontSize: 13, color: "#718096", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 13, color: plan.color, marginBottom: 16, fontStyle: "italic" }}>{plan.tagline}</div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-3px", color: plan.color }}>${plan.price}</div>
                <div style={{ fontSize: 14, color: "#4a5568" }}>/mo</div>
              </div>

              <div style={{ background: "#0d2e1a", border: "1px solid #4ade8033", borderRadius: 8, padding: "7px 12px", marginBottom: 20, fontSize: 12, color: "#4ade80", fontWeight: 700 }}>
                ✓ 7-day free trial · No charge until day 8
              </div>

              <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 4, display: "flex", gap: 6 }}>
                <span style={{ color: plan.color }}>📦</span> {plan.products}
              </div>
              <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 22, display: "flex", gap: 6 }}>
                <span style={{ color: plan.color }}>🎯</span> {plan.niches}
              </div>

              <div style={{ borderTop: "1px solid #1e2030", paddingTop: 20, marginBottom: 28 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ fontSize: 13, color: "#718096", marginBottom: 11, display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.4 }}>
                    <span style={{ color: plan.color, flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <button
                onClick={handleGetStarted}
                style={{
                  width: "100%",
                  background: plan.popular ? "linear-gradient(135deg, #6c63ff, #5b52e8)" : "transparent",
                  border: `1px solid ${plan.popular ? "#6c63ff" : "#2d3748"}`,
                  color: plan.popular ? "#fff" : "#a0aec0",
                  padding: "14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "-0.2px",
                  boxShadow: plan.popular ? "0 4px 20px #6c63ff44" : "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!plan.popular) { e.target.style.borderColor="#6c63ff"; e.target.style.color="#e2e8f0"; } }}
                onMouseLeave={e => { if (!plan.popular) { e.target.style.borderColor="#2d3748"; e.target.style.color="#a0aec0"; } }}
              >
                Start {plan.name} Free Trial →
              </button>
            </div>
          ))}
        </div>

        {/* Comparison note */}
        <div style={{ textAlign: "center", marginTop: 48, fontSize: 14, color: "#4a5568" }}>
          All plans include community access, the approval queue, and the 8AM digest.
          <span style={{ color: "#718096" }}> · </span>
          Upgrade or downgrade anytime.
          <span style={{ color: "#718096" }}> · </span>
          No contracts. No surprises.
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section style={{ padding: "100px 60px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, #6c63ff0c 0%, transparent 65%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-2.5px", margin: "0 0 20px", lineHeight: 1.05 }}>
          Your competitors<br />are already automating.
        </h2>
        <p style={{ fontSize: 19, color: "#718096", maxWidth: 520, margin: "0 auto 44px", lineHeight: 1.6 }}>
          The dropshippers winning right now aren't working harder — they're running smarter systems. Dropforge is that system.
        </p>
        <button
          onClick={handleGetStarted}
          style={{ background: "linear-gradient(135deg, #6c63ff, #5b52e8)", border: "none", color: "#fff", padding: "20px 48px", borderRadius: 16, cursor: "pointer", fontSize: 18, fontWeight: 900, letterSpacing: "-0.3px", boxShadow: "0 8px 40px #6c63ff55" }}
        >
          Start Free — No Commitment →
        </button>
        <div style={{ marginTop: 16, fontSize: 13, color: "#2d3748" }}>7-day trial · Cancel before day 8 · Owe nothing</div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ background: "#0A0B0F", borderTop: "1px solid #1e2030", padding: "40px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span></div>
          <div style={{ display: "flex", gap: 32, fontSize: 13, color: "#4a5568" }}>
            <span style={{ cursor: "pointer" }} onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>Features</span>
            <span style={{ cursor: "pointer" }} onClick={() => document.getElementById("pricing").scrollIntoView({ behavior: "smooth" })}>Pricing</span>
            <span style={{ cursor: "pointer", color: "#6c63ff" }} onClick={handleLogin}>Log In</span>
          </div>
          <div style={{ fontSize: 13, color: "#2d3748" }}>© 2026 Dropforge · dropforge.pro</div>
        </div>
      </footer>
    </div>
  );
}
