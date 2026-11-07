"use client"

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Zap, Target, BarChart3, ArrowRight, CheckCircle, Star } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.1)",
    title: "AI Resume Score",
    desc: "Get an instant 0-100 score with detailed strengths and weaknesses breakdown from our advanced AI.",
  },
  {
    icon: Zap,
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.1)",
    title: "ATS Optimization",
    desc: "Discover missing keywords and skills that ATS systems are looking for. Beat the bots.",
  },
  {
    icon: Target,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.1)",
    title: "Job Description Match",
    desc: "Paste any job listing and see your exact match %. Get tailoring tips to land the interview.",
  },
];

const steps = [
  { step: "01", title: "Upload Resume", desc: "Drag & drop your PDF resume" },
  { step: "02", title: "AI Analyzes", desc: "Gemini AI processes in seconds" },
  { step: "03", title: "Get Insights", desc: "Receive score, feedback & tips" },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      <div className="hero-bg" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* Hero */}
        <section
          className="hero-section"
        >
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <Star size={14} fill="#67e8f9" /> Powered by Google Gemini AI
            </div>
            <h1>
              Supercharge your resume
              <span className="gradient-text">with AI intelligence</span>
            </h1>
            <p className="hero-lead">
              Turn recruiter uncertainty into a clear plan. Get ATS feedback, keyword gaps,
              and a tailored improvement report in seconds.
            </p>
            <div className="hero-actions">
              <button
                className="btn-primary btn-lg"
                onClick={() => router.push(session ? "/analyze" : "/auth/register")}
              >
                Analyze your resume <ArrowRight size={18} />
              </button>
              {!session && (
                <Link href="/auth/login" className="btn-secondary btn-lg" style={{ textDecoration: "none" }}>
                  Sign in
                </Link>
              )}
            </div>
            <div className="hero-trust">
              {["AI-Powered Analysis", "ATS Optimized", "Job Match Score", "Free to Start"].map((t) => (
                <span key={t}>
                  <CheckCircle size={14} color="#10b981" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-preview" aria-label="Resume analysis preview">
            <div className="preview-glow" />
            <div className="preview-panel">
              <div className="preview-header">
                <div>
                  <span>Resume score</span>
                  <strong>Excellent</strong>
                </div>
                <div className="preview-live"><span /> Live analysis</div>
              </div>
              <div className="preview-score-row">
                <div className="preview-ring">
                  <div><strong>87</strong><span>/100</span></div>
                </div>
                <div className="preview-metrics">
                  <div><span>ATS score</span><strong>92</strong></div>
                  <div><span>Job match</span><strong>84%</strong></div>
                  <div><span>Keywords</span><strong>18</strong></div>
                </div>
              </div>
              <div className="preview-divider" />
              <div className="preview-list">
                <div><CheckCircle size={16} color="#10b981" /><span>Strong achievement metrics</span><strong>+12</strong></div>
                <div><CheckCircle size={16} color="#10b981" /><span>Clear career progression</span><strong>+8</strong></div>
                <div><Target size={16} color="#f59e0b" /><span>Add target role keywords</span><strong>3</strong></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontFamily: "Sora, Inter, sans-serif",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "#f1f5f9",
                marginBottom: "0.75rem",
              }}
            >
              Everything You Need to{" "}
              <span className="gradient-text">Land Your Dream Job</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "clamp(1rem, 2vw, 1.125rem)" }}>
              Three powerful AI tools in one platform
            </p>
          </div>

          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="glass-card glow-cyan"
                  style={{
                    borderRadius: "1.5rem",
                    padding: "2.5rem",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "default",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-8px) scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0) scale(1)";
                  }}
                >
                  <div
                    className="how-grid"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: `linear-gradient(90deg, ${f.color}, transparent)`,
                    }}
                  />
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "1rem",
                      background: f.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.5rem",
                      border: `1px solid ${f.color}20`,
                    }}
                  >
                    <Icon size={26} color={f.color} />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#f1f5f9",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: "1rem" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="how-it-works-section">
          <h2
            style={{
              fontFamily: "Sora, Inter, sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: "3rem",
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "2rem",
              maxWidth: 1000,
              margin: "0 auto",
              position: "relative",
            }}
          >
            {steps.map((s, index) => (
              <div key={s.step} className="glass-card" style={{
                borderRadius: "1.25rem",
                padding: "2rem",
                textAlign: "center",
                position: "relative",
                border: "1px solid rgba(6, 182, 212, 0.2)",
              }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "white",
                    boxShadow: "0 8px 24px rgba(6, 182, 212, 0.3)",
                  }}
                >
                  {s.step}
                </div>
                <h3 style={{
                  fontWeight: 700,
                  color: "#f1f5f9",
                  marginBottom: "0.75rem",
                  fontSize: "1.125rem"
                }}>
                  {s.title}
                </h3>
                <p style={{
                  color: "#64748b",
                  fontSize: "1rem",
                  lineHeight: 1.6
                }}>{s.desc}</p>

                {index < steps.length - 1 && (
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    right: "-1rem",
                    transform: "translateY(-50%)",
                    width: "2rem",
                    height: "2px",
                    background: "linear-gradient(90deg, rgba(6, 182, 212, 0.5), transparent)",
                  }} className="step-connector" />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: "4rem" }}>
            <div
              className="glass-strong cta-box"
              style={{
                display: "inline-block",
                borderRadius: "1.5rem",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                boxShadow: "0 16px 48px rgba(6, 182, 212, 0.2)",
              }}
            >
              <BrainCircuit size={40} color="#06b6d4" style={{ marginBottom: "1rem" }} />
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#f1f5f9",
                  marginBottom: "0.75rem",
                }}
              >
                Ready to stand out?
              </h3>
              <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                Join thousands of job seekers who improved their resume score.
              </p>
              <button
                className="btn-primary btn-lg"
                onClick={() => router.push(session ? "/analyze" : "/auth/register")}
              >
                Start for Free <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </div>
      <style>{`
        .hero-section {
          max-width: 1200px;
          margin: 0 auto;
          min-height: calc(100vh - 72px);
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(380px, 0.92fr);
          align-items: center;
          gap: 4rem;
          padding: 5rem 2rem;
        }
        .hero-copy {
          position: relative;
          z-index: 2;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(103,232,249,0.18);
          background: rgba(6,182,212,0.08);
          color: #67e8f9;
          border-radius: 9999px;
          padding: 0.5rem 0.85rem;
          font-size: 0.8125rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }
        .hero-copy h1 {
          max-width: 760px;
          font-family: var(--font-display);
          font-size: clamp(3.25rem, 6vw, 5.25rem);
          line-height: 0.98;
          letter-spacing: -0.055em;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 1.5rem;
        }
        .hero-copy h1 span {
          display: block;
          margin-top: 0.18em;
        }
        .hero-lead {
          max-width: 610px;
          color: #94a3b8;
          font-size: clamp(1.05rem, 1.5vw, 1.25rem);
          line-height: 1.75;
          margin-bottom: 2rem;
        }
        .hero-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .hero-trust {
          display: flex;
          gap: 1.1rem;
          flex-wrap: wrap;
          margin-top: 2rem;
          color: #94a3b8;
          font-size: 0.8125rem;
        }
        .hero-trust span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .hero-preview {
          position: relative;
          min-height: 470px;
          display: flex;
          align-items: center;
          perspective: 1000px;
        }
        .preview-glow {
          position: absolute;
          inset: 8%;
          background: rgba(6,182,212,0.22);
          filter: blur(60px);
          border-radius: 50%;
        }
        .preview-panel {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin-left: auto;
          border-radius: 1.5rem;
          border: 1px solid rgba(148,163,184,0.16);
          background: linear-gradient(145deg, rgba(22,30,48,0.96), rgba(10,14,25,0.96));
          box-shadow: 0 32px 80px rgba(0,0,0,0.48), inset 0 1px rgba(255,255,255,0.04);
          padding: 1.5rem;
          transform: rotateY(-4deg) rotateX(1deg);
        }
        .preview-header,
        .preview-score-row,
        .preview-list div {
          display: flex;
          align-items: center;
        }
        .preview-header {
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .preview-header > div:first-child {
          display: grid;
        }
        .preview-header span {
          color: #64748b;
          font-size: 0.75rem;
        }
        .preview-header strong {
          color: #f8fafc;
          font-size: 1.125rem;
        }
        .preview-live {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #94a3b8;
          font-size: 0.75rem;
          border: 1px solid rgba(148,163,184,0.12);
          border-radius: 999px;
          padding: 0.35rem 0.65rem;
          background: rgba(255,255,255,0.03);
        }
        .preview-live span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 12px #10b981;
        }
        .preview-score-row {
          gap: 1.5rem;
        }
        .preview-ring {
          width: 146px;
          height: 146px;
          flex: 0 0 146px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: conic-gradient(#10b981 0deg 313deg, rgba(255,255,255,0.07) 313deg);
          box-shadow: 0 0 40px rgba(16,185,129,0.12);
        }
        .preview-ring > div {
          width: 126px;
          height: 126px;
          border-radius: 50%;
          display: grid;
          place-content: center;
          text-align: center;
          background: #101624;
        }
        .preview-ring strong {
          display: block;
          color: #6ee7b7;
          font-size: 2.5rem;
          line-height: 1;
        }
        .preview-ring span {
          color: #64748b;
          font-size: 0.75rem;
        }
        .preview-metrics {
          flex: 1;
          display: grid;
          gap: 0.55rem;
        }
        .preview-metrics div {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(148,163,184,0.1);
          border-radius: 0.75rem;
          padding: 0.65rem 0.75rem;
          background: rgba(255,255,255,0.025);
        }
        .preview-metrics span {
          color: #94a3b8;
          font-size: 0.75rem;
        }
        .preview-metrics strong {
          color: #e2e8f0;
          font-size: 0.875rem;
        }
        .preview-divider {
          height: 1px;
          background: rgba(148,163,184,0.1);
          margin: 1.25rem 0;
        }
        .preview-list {
          display: grid;
          gap: 0.55rem;
        }
        .preview-list div {
          gap: 0.65rem;
          border-radius: 0.75rem;
          color: #cbd5e1;
          font-size: 0.8125rem;
          padding: 0.55rem 0.65rem;
          background: rgba(255,255,255,0.025);
        }
        .preview-list div span {
          flex: 1;
        }
        .preview-list div strong {
          color: #64748b;
          font-size: 0.75rem;
        }
        .features-section {
          padding: 4rem 2rem;
        }
        .how-it-works-section {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          padding: 4rem 2rem 6rem;
        }
        .cta-box {
          padding: 3rem 4rem;
        }

        @media (max-width: 1024px) {
          .hero-section { grid-template-columns: 1fr 420px; gap: 2rem; padding: 4rem 1.5rem; }
          .hero-copy h1 { font-size: clamp(3rem, 7vw, 4.5rem); }
          .hero-preview { min-height: 430px; }
          .features-section { padding: 3rem 1.5rem; }
          .how-it-works-section { padding: 3rem 1.5rem 4rem; }
          .cta-box { padding: 2.5rem 3rem; }
        }

        @media (max-width: 768px) {
          .hero-section { grid-template-columns: 1fr; min-height: auto; text-align: left; padding: 3.5rem 1rem 2.5rem; }
          .hero-copy h1 { font-size: clamp(2.65rem, 13vw, 4rem); }
          .hero-lead { font-size: 1rem; }
          .hero-preview { min-height: 390px; }
          .preview-panel { max-width: 560px; margin: 0 auto; transform: none; }
          .hero-trust { gap: 0.75rem 1rem; }
          .features-section { padding: 2rem 1rem; }
          .how-it-works-section { padding: 2rem 1rem 3rem; }
          .cta-box { padding: 2rem 1.5rem; }
          .step-connector { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .features-grid > div { padding: 1.5rem !important; }
          .how-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .how-grid > div { padding: 1.5rem !important; }
        }

        @media (max-width: 480px) {
          .hero-section { padding: 2.5rem 1rem 2rem; }
          .hero-actions { display: grid; grid-template-columns: 1fr; }
          .hero-actions .btn-primary,
          .hero-actions .btn-secondary { width: 100%; justify-content: center; }
          .hero-preview { min-height: 330px; }
          .preview-panel { padding: 1rem; }
          .preview-ring { width: 112px; height: 112px; flex-basis: 112px; }
          .preview-ring > div { width: 96px; height: 96px; }
          .preview-ring strong { font-size: 2rem; }
          .preview-score-row { gap: 0.75rem; }
          .preview-metrics div { padding: 0.5rem; }
          .features-section { padding: 1.5rem 1rem; }
          .how-it-works-section { padding: 1.5rem 1rem 2rem; }
          .cta-box { padding: 1.5rem 1rem; }
        }
      `}</style>
    </>
  );
}

