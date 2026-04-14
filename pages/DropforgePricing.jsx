import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PLANS = [
  {
    name: "Starter",
    price: 29,
    priceId: "price_1TLu5aPM6gWUtTPVk70mRYFp",
    products: "20 products/mo",
    niches: "1 niche",
    color: "#4ade80",
    popular: false,
    features: [
      "AI product generation",
      "Auto-publisher",
      "Daily digest email",
      "Approval queue",
      "CJ Dropshipping sourcing",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: 59,
    priceId: "price_1TLu5tPM6gWUtTPVzwFiOdyY",
    products: "75 products/mo",
    niches: "3 niches",
    color: "#6c63ff",
    popular: true,
    features: [
      "Everything in Starter",
      "Multi-niche support",
      "Priority trend scanning",
      "Sales analytics dashboard",
      "Weak product alerts",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: 99,
    priceId: "price_1TLu65PM6gWUtTPVzonIXm6Z",
    products: "Unlimited products",
    niches: "Unlimited niches",
    color: "#38bdf8",
    popular: false,
    features: [
      "Everything in Growth",
      "Full sales & revenue analytics",
      "Auto-replace weak products",
      "Custom digest schedule",
      "Bulk auto-publish",
      "Dedicated support",
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  async function handleCheckout(plan) {
    setLoading(plan.name);
    try {
      const res = await fetch("/functions/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          plan: plan.name.toLowerCase(),
          trial: true,
          successUrl: "https://dropforge.pro/Dashboard",
          cancelUrl: "https://dropforge.pro/Pricing",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout error: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 60px", borderBottom: "1px solid #1e2030", position: "sticky", top: 0, background: "rgba(10,11,15,0.95)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div onClick={() => navigate("/Landing")} style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", cursor: "pointer" }}>
          ⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/Login")} style={{ background: "transparent", border: "1px solid #2d3748", color: "#a0aec0", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>Log in</button>
          <button onClick={() => navigate("/Onboarding")} style={{ background: "#6c63ff", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "80px 40px 60px" }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px" }}>Simple, honest pricing</h1>
        <p style={{ fontSize: 18, color: "#718096", margin: "0 0 24px" }}>7-day free trial on all plans. Card required, no charge until day 8.</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#13151c", border: "1px solid #1e2030", borderRadius: 20, padding: "8px 20px", fontSize: 13, color: "#718096" }}>
          <span style={{ color: "#4ade80" }}>🔒</span> Secured by Stripe · Cancel anytime from Settings
        </div>
      </div>

      {/* PLANS */}
      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px" }}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            style={{ background: "#13151c", border: `1px solid ${plan.popular ? plan.color : "#1e2030"}`, borderRadius: 20, padding: "36px 32px", width: 300, position: "relative", transform: plan.popular ? "scale(1.04)" : "scale(1)" }}
          >
            {plan.popular && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#6c63ff", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>Most Popular</div>
            )}

            <div style={{ fontSize: 13, color: "#718096", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{plan.name}</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: plan.color, letterSpacing: "-2px", marginBottom: 4 }}>${plan.price}</div>
            <div style={{ fontSize: 13, color: "#4a5568", marginBottom: 8 }}>per month</div>

            <div style={{ background: "#0d2e1a", border: "1px solid #4ade8022", borderRadius: 8, padding: "8px 12px", marginBottom: 20, fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
              ✓ 7-day free trial included
            </div>

            <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>📦 {plan.products}</div>
            <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 20 }}>🎯 {plan.niches}</div>

            <div style={{ borderTop: "1px solid #1e2030", paddingTop: 20, marginBottom: 28 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ fontSize: 13, color: "#718096", marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: plan.color, flexShrink: 0 }}>✓</span> {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout(plan)}
              disabled={loading === plan.name}
              style={{ width: "100%", background: plan.popular ? "#6c63ff" : "transparent", border: `1px solid ${plan.popular ? "#6c63ff" : "#2d3748"}`, color: plan.popular ? "#fff" : "#a0aec0", padding: "13px", borderRadius: 10, cursor: loading === plan.name ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, opacity: loading === plan.name ? 0.7 : 1 }}
            >
              {loading === plan.name ? "Loading..." : `Start ${plan.name} Trial →`}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 40px 100px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", textAlign: "center", marginBottom: 40 }}>Common questions</h2>
        {[
          ["Do I need a credit card to start?", "Yes — we collect your card upfront to reduce friction after the trial, but you are not charged a single cent for 7 days. Cancel before day 8 and you owe nothing."],
          ["Can I cancel anytime?", "Absolutely. Cancel from your Settings page at any time. No penalties, no emails guilt-tripping you. Done."],
          ["What happens when my trial ends?", "Your card is charged for the first month of your chosen plan on day 8. You'll get an email reminder on day 6."],
          ["Can I switch plans?", "Yes. Upgrade or downgrade anytime from Settings → Billing. Changes take effect immediately and Stripe prorates the difference."],
          ["What is the sales analytics feature?", "Available on Growth and Pro — we pull your Shopify order data and show you exactly which products are selling and which aren't. Weak products can be replaced automatically with one click."],
        ].map(([q, a]) => (
          <div key={q} style={{ borderBottom: "1px solid #1e2030", padding: "24px 0" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>{q}</div>
            <div style={{ fontSize: 14, color: "#718096", lineHeight: 1.7 }}>{a}</div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1e2030", padding: "32px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span></div>
        <div style={{ fontSize: 13, color: "#4a5568" }}>© 2026 Dropforge</div>
      </footer>
    </div>
  );
}
