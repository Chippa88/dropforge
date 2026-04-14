import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#0A0B0F", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

      {/* LOGO */}
      <div onClick={() => navigate("/Landing")} style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 48, cursor: "pointer" }}>
        ⚡ Drop<span style={{ color: "#6c63ff" }}>forge</span>
      </div>

      {/* CARD */}
      <div style={{ background: "#13151c", border: "1px solid #1e2030", borderRadius: 20, padding: "40px", width: "100%", maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 8px" }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: "#718096", margin: "0 0 32px" }}>Sign in to your Dropforge account</p>

        {/* Base44 handles auth — this redirects to the platform login */}
        <div style={{ background: "#0A0B0F", border: "1px solid #1e2030", borderRadius: 12, padding: "20px", marginBottom: 24, fontSize: 13, color: "#718096", lineHeight: 1.6 }}>
          You'll be redirected to our secure sign-in page. Your account is managed by Base44's authentication system — industry-standard, fully encrypted.
        </div>

        <a
          href="/login"
          style={{ display: "block", width: "100%", background: "#6c63ff", border: "none", color: "#fff", padding: "14px", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}
        >
          Sign In →
        </a>

        <div style={{ marginTop: 24, fontSize: 13, color: "#4a5568" }}>
          Don't have an account?{" "}
          <span onClick={() => navigate("/Onboarding")} style={{ color: "#6c63ff", cursor: "pointer", fontWeight: 600 }}>
            Start free trial
          </span>
        </div>
      </div>

      <div style={{ marginTop: 32, fontSize: 12, color: "#2d3748" }}>
        © 2026 Dropforge · dropforge.pro
      </div>
    </div>
  );
}
