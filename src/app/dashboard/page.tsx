"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScoreRing from "@/components/ScoreRing";
import { FileSearch, TrendingUp, Award, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Analysis {
  _id: string;
  fileName: string;
  score: number;
  atsScore: number;
  skills: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || "Failed to load dashboard");
          return data;
        })
        .then((data) => {
          setAnalyses(Array.isArray(data) ? data : []);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <Loader2 size={32} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const avgScore = analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length) : 0;
  const bestScore = analyses.length > 0 ? Math.max(...analyses.map((a) => a.score)) : 0;
  const allSkills = [...new Set(analyses.flatMap((a) => a.skills))].slice(0, 8);

  const stats = [
    { icon: FileSearch, label: "Total Analyses", value: analyses.length, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)" },
    { icon: TrendingUp, label: "Average Score", value: avgScore, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", suffix: "/100" },
    { icon: Award, label: "Best Score", value: bestScore, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", suffix: "/100" },
  ];

  return (
    <div className="hero-bg app-page" style={{ minHeight: "calc(100vh - 72px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.75rem", padding: "0.875rem 1rem", color: "#fca5a5", marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <h1 style={{
            fontFamily: "Sora, Inter, sans-serif",
            fontSize: "clamp(2rem, 5vw, 2.5rem)",
            fontWeight: 700,
            color: "#f1f5f9",
            marginBottom: "0.5rem"
          }}>
            Welcome back, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p style={{ color: "#64748b", fontSize: "clamp(1rem, 2vw, 1.125rem)" }}>
            Here&apos;s an overview of your resume performance
          </p>
        </div>

        {/* Stats cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem"
        }}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-card" style={{
                borderRadius: "1.25rem",
                padding: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                border: `1px solid ${s.color}20`,
                boxShadow: `0 8px 24px ${s.color}15`,
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "1rem",
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${s.color}30`,
                }}>
                  <Icon size={24} color={s.color} />
                </div>
                <div>
                  <div style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#f1f5f9",
                    lineHeight: 1,
                    fontFamily: "Sora, Inter, sans-serif"
                  }}>
                    {s.value}{s.suffix ?? ""}
                  </div>
                  <div style={{
                    fontSize: "0.875rem",
                    color: "#64748b",
                    marginTop: "0.25rem"
                  }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className={`dashboard-grid ${analyses.length > 0 ? "has-data" : ""}`} style={{ gap: "2rem" }}>
          {/* Recent analyses */}
          <div className="glass-card" style={{
            borderRadius: "1.5rem",
            padding: "2rem",
            border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              <h2 style={{
                fontWeight: 700,
                color: "#f1f5f9",
                fontSize: "clamp(1.125rem, 3vw, 1.25rem)"
              }}>
                Recent Analyses
              </h2>
              {analyses.length > 0 && (
                <Link href="/history" style={{
                  color: "#67e8f9",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  background: "rgba(6, 182, 212, 0.1)",
                  border: "1px solid rgba(6, 182, 212, 0.2)",
                  transition: "all 0.2s ease",
                }}>
                  View all <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {analyses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <FileSearch size={40} color="#334155" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "#64748b", marginBottom: "1.25rem" }}>No analyses yet. Upload your first resume!</p>
                <Link href="/analyze" className="btn-primary" style={{ textDecoration: "none" }}>
                  Analyze Resume <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {analyses.slice(0, 5).map((a) => (
                  <div key={a._id} className="glass-card" style={{
                    borderRadius: "1rem",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.2s ease",
                  }}>
                    <ScoreRing score={a.score} size={64} strokeWidth={6} label="" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600,
                        color: "#f1f5f9",
                        fontSize: "1rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {a.fileName}
                      </div>
                      <div style={{
                        color: "#64748b",
                        fontSize: "0.875rem",
                        marginTop: "0.2rem"
                      }}>
                        ATS: {a.atsScore}/100 - {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`chip ${a.score >= 70 ? "chip-green" : a.score >= 50 ? "chip-blue" : "chip-red"}`}>
                      {a.score >= 70 ? "Good" : a.score >= 50 ? "Fair" : "Needs Work"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top skills */}
          {analyses.length > 0 && (
            <div className="glass-card" style={{
              borderRadius: "1.5rem",
              padding: "2rem",
              alignSelf: "start",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <h2 style={{
                fontWeight: 700,
                color: "#f1f5f9",
                fontSize: "clamp(1.125rem, 3vw, 1.25rem)",
                marginBottom: "1.5rem"
              }}>
                Your Top Skills
              </h2>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginBottom: "2rem"
              }}>
                {allSkills.map((skill) => (
                  <span key={skill} className="chip chip-cyan">{skill}</span>
                ))}
                {allSkills.length === 0 && <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Skills will appear here after analysis.</p>}
              </div>

              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "1.5rem"
              }}>
                <Link href="/analyze" className="btn-primary btn-lg" style={{
                  textDecoration: "none",
                  width: "100%",
                  justifyContent: "center"
                }}>
                  New Analysis <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
        }

        @media (min-width: 1024px) {
          .dashboard-grid.has-data { grid-template-columns: 1fr 340px; }
        }

        @media (max-width: 1023px) {
          .dashboard-grid.has-data { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .app-page { padding: 2rem 1rem; }
          .glass-card { padding: 1.25rem; }
        }

        @media (max-width: 480px) {
          .hero-bg { padding: 1.5rem 1rem; }
          .glass-card { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
