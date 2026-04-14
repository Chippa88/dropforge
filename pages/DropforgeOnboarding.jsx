import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DropforgeSubscription, Store } from "@/api/entities";
import { User } from "@/api/entities";

const PLANS = [
  {
    name: "Starter",
    price: 29,
    priceId: "price_1TLu5aPM6gWUtTPVk70mRYFp",
    products: "20 products/mo",
    niches: "1 niche",
    color: "#4ade80",
    popular: false,
  },
  {
    name: "Growth",
    price: 59,
    priceId: "price_1TLu5tPM6gWUtTPVzwFiOdyY",
    products: "75 products/mo",
    niches: "3 niches",
    color: "#6c63ff",
    popular: true,
  },
  {
    name: "Pro",
    price: 99,
    priceId: "price_1TLu65PM6gWUtTPVzonIXm6Z",
    products: "Unlimited",
    niches: "Unlimited niches",
    color: "#38bdf8",
    popular: false,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=welcome, 2=plan, 3=connect
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [shopDomain, setShopDomain] = useState("");
  const [shopError, setShopError] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    User.me?.().then(u => setUser(u)).catch(() => {});
  }, []);

  async function startTrial(plan) {
    setSelectedPlan(plan);
    setLoading(true);
    try {
      // Create a Stripe checkout session with a 7-day trial
      // Card IS collected upfront — no charge for 7 days
      // This maximizes conversion and reduces churn vs. no-card trials
      const res = await fetch("/functions/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          plan: plan.name.toLowerCase(),
          trial: true,
          successUrl: "https://dropforge.pro/Onboarding?step=connect&plan=" + plan.name.toLowerCase(),
          cancelUrl: "https://dropforge.pro/Onboarding",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Could not start checkout: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function connectShopify() {
    const raw = shopDomain.trim().toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    const domain = raw.includes(".myshopify.com") ? raw : raw + ".myshopify.com";

    if (!domain.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      setShopError("Please enter a valid Shopify store domain (e.g. my-store.myshopify.com)");
      return;
    }
    setShopError("");
    window.location.href = `https://dropforge.pro/functions/shopifyInstall?shop=${domain}`;
  }

  // Check URL params for step=connect (returning from Stripe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "connect") setStep(3);
  }, []);

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #1e2030" }}>
        <div onClick={() => navigate("/Landing")} style={{ fontSize: 20, fontWeight: 700, cursor: "pointer" }}>
          ⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span>
        </div>
        <div style={{ fontSize: 13, color: "#4a5568" }}>
          Already have an account?{" "}
          <span onClick={() => navigate("/Login")} style={{ color: "#6c63ff", cursor: "pointer", fontWeight: 600 }}>Sign in</span>
        </div>
      </nav>

      {/* PROGRESS */}
      <div style={{ display: "flex", justifyContent: "center", padding: "32px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {["Choose Plan", "Start Trial", "Connect Store"].map((label, i) => {
            const stepNum = i + 1;
            const active = step === stepNum;
            const done = step > stepNum;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "#6c63ff" : active ? "#6c63ff" : "#1e2030", border: `2px solid ${active || done ? "#6c63ff" : "#2d3748"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: active || done ? "#fff" : "#4a5568" }}>
                    {done ? "✓" : stepNum}
                  </div>
                  <div style={{ fontSize: 11, color: active ? "#e2e8f0" : "#4a5568", whiteSpace: "nowrap" }}>{label}</div>
                </div>
                {i < 2 && <div style={{ width: 80, height: 2, background: done ? "#6c63ff" : "#1e2030", margin: "0 8px", marginBottom: 22 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1 — CHOOSE PLAN */}
      {step === 1 && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 12px" }}>Start your 7-day free trial</h1>
            <p style={{ fontSize: 16, color: "#718096", margin: 0 }}>
              Enter your card details to start — you won't be charged for 7 days. Cancel anytime before then.
            </p>
            <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, background: "#13151c", border: "1px solid #1e2030", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#718096" }}>
              <span style={{ color: "#4ade80" }}>🔒</span> Secured by Stripe · No charge for 7 days
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                style={{ background: "#13151c", border: `1px solid ${plan.popular ? plan.color : "#1e2030"}`, borderRadius: 20, padding: "32px 28px", width: 280, position: "relative", transform: plan.popular ? "scale(1.03)" : "scale(1)" }}
              >
                {plan.popular && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#6c63ff", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>Most Popular</div>
                )}
                <div style={{ fontSize: 13, color: "#718096", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontSize: 44, fontWeight: 800, color: plan.color, letterSpacing: "-2px", marginBottom: 4 }}>${plan.price}</div>
                <div style={{ fontSize: 12, color: "#4a5568", marginBottom: 20 }}>per month after trial</div>
                <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 4 }}>📦 {plan.products}</div>
                <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 24 }}>🎯 {plan.niches}</div>
                <button
                  onClick={() => startTrial(plan)}
                  disabled={loading && selectedPlan?.name === plan.name}
                  style={{ width: "100%", background: plan.popular ? "#6c63ff" : "transparent", border: `1px solid ${plan.popular ? "#6c63ff" : "#2d3748"}`, color: plan.popular ? "#fff" : "#a0aec0", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}
                >
                  {loading && selectedPlan?.name === plan.name ? "Loading..." : "Start Free Trial →"}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "#2d3748" }}>
            By starting a trial you agree to our Terms of Service. You can cancel anytime from Settings.
          </div>
        </div>
      )}

      {/* STEP 3 — CONNECT STORE */}
      {step === 3 && (
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "64px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 12px" }}>Trial started!</h1>
            <p style={{ fontSize: 15, color: "#718096", margin: 0 }}>Now connect your Shopify store and you're ready to go.</p>
          </div>

          <div style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 16, padding: "32px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Connect Your Shopify Store</div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#718096", display: "block", marginBottom: 8 }}>Your Shopify store URL</label>
              <input
                type="text"
                value={shopDomain}
                onChange={e => { setShopDomain(e.target.value); setShopError(""); }}
                placeholder="my-store.myshopify.com"
                style={{ width: "100%", background: "#0A0B0F", border: `1px solid ${shopError ? "#f87171" : "#1e2030"}`, borderRadius: 10, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              {shopError && <div style={{ fontSize: 12, color: "#f87171", marginTop: 6 }}>{shopError}</div>}
              <div style={{ fontSize: 12, color: "#4a5568", marginTop: 6 }}>Find this in your Shopify admin — it ends in .myshopify.com</div>
            </div>

            <button
              onClick={connectShopify}
              style={{ width: "100%", background: "#6c63ff", border: "none", color: "#fff", padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700 }}
            >
              Connect Store →
            </button>

            <button
              onClick={() => navigate("/Dashboard")}
              style={{ width: "100%", background: "transparent", border: "none", color: "#4a5568", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 13, marginTop: 8 }}
            >
              Skip for now — I'll connect later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
