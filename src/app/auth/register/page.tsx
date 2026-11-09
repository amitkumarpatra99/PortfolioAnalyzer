"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainCircuit, User, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      router.push("/auth/login?registered=true");
    }
  };

  return (
    <div
      className="hero-bg app-page"
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="glass" style={{ width: "100%", maxWidth: 440, borderRadius: "1.5rem", padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "1rem",
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <BrainCircuit size={24} color="white" />
          </div>
          <h1 style={{ fontFamily: "Sora, Inter, sans-serif", fontSize: "1.625rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.25rem" }}>
            Create Account
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>Start analyzing your resume for free</p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.75rem",
              padding: "0.875rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fca5a5",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}
          >
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
            <input type="text" placeholder="Full name" className="input" style={{ paddingLeft: "2.75rem" }} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
            <input type="email" placeholder="Email address" className="input" style={{ paddingLeft: "2.75rem" }} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
            <input type="password" placeholder="Password (min 6 chars)" className="input" style={{ paddingLeft: "2.75rem" }} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary btn-lg" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.9rem", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#67e8f9", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
