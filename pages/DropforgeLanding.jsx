import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const plans = [
    {
      name: "Starter",
      price: 29,
      priceId: "price_1TLu5aPM6gWUtTPVk70mRYFp",
      products: "20 products/mo",
      niches: "1 niche",
      features: ["AI product generation", "Auto-publisher", "Daily digest email", "Approval queue"],
      color: "#4ade80",
      popular: false,
    },
    {
      name: "Growth",
      price: 59,
      priceId: "price_1TLu5tPM6gWUtTPVzwFiOdyY",
      products: "75 products/mo",
      niches: "3 niches",
      features: ["Everything in Starter", "Multi-niche support", "Priority trend scanning", "Advanced analytics"],
      color: "#6c63ff",
      popular: true,
    },
    {
      name: "Pro",
      price: 99,
      priceId: "price_1TLu65PM6gWUtTPVzonIXm6Z",
      products: "Unlimited products",
      niches: "Unlimited niches",
      features: ["Everything in Growth", "Custom digest schedule", "Bulk auto-publish", "Priority support"],
      color: "#38bdf8",
      popular: false,
    },
  ];

  const features = [
    { icon: "🔗", title: "One-Click Shopify Connect", desc: "Link your store in seconds. We handle the OAuth handshake securely." },
    { icon: "🤖", title: "AI Product Engine", desc: "GPT-4o writes compelling titles, descriptions, and pricing for every product." },
    { icon: "📦", title: "Auto-Publisher", desc: "Approved products go live in your Shopify store automatically. Zero manual work." },
    { icon: "✅", title: "Approval Queue", desc: "Review everything before it goes live — or flip to full-auto and let it run." },
    { icon: "📧", title: "Daily Digest Email", desc: "A clean morning summary of what's pending, published, and needs attention." },
    { icon: "📈", title: "Trend Scanner", desc: "CJ Dropshipping API finds products trending right now in your niche." },
  ];

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 60px", borderBottom: "1px solid #1e2030", position: "sticky", top: 0, background: "rgba(10,11,15,0.95)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>
          ⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14, color: "#718096" }}>
          <a href="#features" style={{ color: "#718096", textDecoration: "none" }}>Features</a>
          <a href="#pricing" style={{ color: "#718096", textDecoration: "none" }}>Pricing</a>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/Login")} style={{ background: "transparent", border: "1px solid #2d3748", color: "#a0aec0", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
            Log in
          </button>
          <button onClick={() => navigate("/Onboarding")} style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "120px 60px 80px" }}>
        <div style={{ display: "inline-block", background: "#13151c", border: "1px solid #6c63ff33", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#6c63ff", fontWeight: 600, marginBottom: 24, letterSpacing: 1, textTransform: "uppercase" }}>
          AI-Powered Shopify Automation
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, margin: "0 0 24px" }}>
          Your Shopify store,<br />
          <span style={{ background: "linear-gradient(135deg, #6c63ff, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            on autopilot.
          </span>
        </h1>
        <p style={{ fontSize: 20, color: "#718096", maxWidth: 580, margin: "0 auto 48px", lineHeight: 1.6 }}>
          Dropforge finds trending products, writes the listings, sets the prices, and publishes everything to your Shopify store — automatically.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/Onboarding")} style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "16px 36px", borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px" }}>
            Start Free Trial →
          </button>
          <button onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })} style={{ background: "#13151c", border: "1px solid #1e2030", color: "#a0aec0", padding: "16px 36px", borderRadius: 12, cursor: "pointer", fontSize: 16 }}>
            See how it works
          </button>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: "#4a5568" }}>No credit card required · Cancel anytime</p>
      </section>

      {/* STATS BAR */}
      <section style={{ background: "#13151c", borderTop: "1px solid #1e2030", borderBottom: "1px solid #1e2030", padding: "32px 60px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 80, flexWrap: "wrap" }}>
          {[["10,000+", "Products Generated"], ["500+", "Stores Connected"], ["98%", "Publish Success Rate"], ["$0", "Manual Work Required"]].map(([stat, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#6c63ff", letterSpacing: "-1px" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "#4a5568", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px" }}>Everything handled for you</h2>
          <p style={{ fontSize: 18, color: "#718096", margin: 0 }}>Six systems running in the background so you don't have to.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "28px 28px" }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#e2e8f0" }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "#718096", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 60px 120px", background: "#0d0e13" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px" }}>Simple, honest pricing</h2>
          <p style={{ fontSize: 18, color: "#718096", margin: 0 }}>30% cheaper than Apollo or Hunter. Cancel anytime.</p>
        </div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", maxWidth: 1100, margin: "0 auto" }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                background: "#13151c",
                border: `1px solid ${plan.popular ? plan.color : hoveredPlan === plan.name ? "#2d3748" : "#1e2030"}`,
                borderRadius: 20,
                padding: "36px 32px",
                width: 300,
                position: "relative",
                transition: "all 0.2s ease",
                transform: plan.popular ? "scale(1.03)" : "scale(1)",
              }}
            >
              {plan.popular && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#6c63ff", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: 14, color: "#718096", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{plan.name}</div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-2px", marginBottom: 4, color: plan.color }}>${plan.price}</div>
              <div style={{ fontSize: 13, color: "#4a5568", marginBottom: 24 }}>per month</div>
              <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>📦 {plan.products}</div>
              <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 24 }}>🎯 {plan.niches}</div>
              <div style={{ borderTop: "1px solid #1e2030", paddingTop: 20, marginBottom: 28 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ fontSize: 13, color: "#718096", marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: plan.color, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/Onboarding")}
                style={{ width: "100%", background: plan.popular ? "#6c63ff" : "transparent", border: `1px solid ${plan.popular ? "#6c63ff" : "#2d3748"}`, color: plan.popular ? "#fff" : "#a0aec0", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
              >
                Get Started →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0A0B0F", borderTop: "1px solid #1e2030", padding: "40px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span></div>
        <div style={{ fontSize: 13, color: "#4a5568" }}>© 2026 Dropforge. All rights reserved.</div>
        <div style={{ fontSize: 13, color: "#4a5568" }}>dropforge.pro</div>
      </footer>
    </div>
  );
}
