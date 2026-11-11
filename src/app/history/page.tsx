"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import ScoreRing from "@/components/ScoreRing";
import { Trash2, FileSearch, Loader2, History } from "lucide-react";

interface Analysis {
  _id: string;
  fileName: string;
  score: number;
  atsScore: number;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  createdAt: string;
  jobMatch?: { matchScore: number };
}

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || "Failed to load history");
          return data;
        })
        .then((data) => {
          setAnalyses(Array.isArray(data) ? data : []);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load history"))
        .finally(() => setLoading(false));
    }
  }, [status]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this analysis? This cannot be undone.")) return;
    setDeleting(id);
    setError("");
    try {
      const response = await fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete analysis");
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete analysis");
    } finally {
      setDeleting(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <Loader2 size={32} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            .app-page { padding: 1.5rem 1rem; }
            .history-card { flex-direction: column; gap: 1rem !important; }
            .history-card > .score-ring-wrap { align-self: flex-start; }
          }
          @media (max-width: 480px) {
            .app-page { padding: 1.25rem 0.75rem; }
            .history-card { padding: 1rem !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="hero-bg app-page" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.75rem", padding: "0.875rem 1rem", color: "#fca5a5", marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <History size={28} color="#06b6d4" />
          <div>
            <h1 style={{ fontFamily: "Sora, Inter, sans-serif", fontSize: "2rem", fontWeight: 700, color: "#f1f5f9" }}>
              Analysis History
            </h1>
            <p style={{ color: "#64748b" }}>View all your past resume analyses</p>
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className="glass" style={{ borderRadius: "1.25rem", padding: "4rem 2rem", textAlign: "center" }}>
            <FileSearch size={48} color="#334155" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: "0.5rem" }}>No analyses yet</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Upload your first resume to get started</p>
            <button className="btn-primary" onClick={() => router.push("/analyze")}>
              Analyze Resume
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {analyses.map((a) => (
              <div key={a._id} className="glass history-card" style={{ borderRadius: "1.25rem", padding: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                <ScoreRing score={a.score} size={80} strokeWidth={7} label="" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "1rem", marginBottom: "0.2rem", wordBreak: "break-all" }}>{a.fileName}</h3>
                      <p style={{ color: "#64748b", fontSize: "0.8125rem" }}>
                        {new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      <span className={`chip ${a.score >= 70 ? "chip-green" : a.score >= 50 ? "chip-blue" : "chip-red"}`}>
                        {a.score >= 70 ? "Good" : a.score >= 50 ? "Fair" : "Needs Work"}
                      </span>
                      <Link
                        href={`/history/${a._id}`}
                        className="btn-secondary btn-sm"
                        style={{ textDecoration: "none" }}
                      >
                        View details
                      </Link>
                      <button
                        onClick={() => handleDelete(a._id)}
                        disabled={deleting === a._id}
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.5rem", padding: "0.4rem 0.6rem", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}
                      >
                        {deleting === a._id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.875rem", flexWrap: "wrap" }}>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.75rem" }}>ATS Score</span>
                      <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1.125rem" }}>{a.atsScore}/100</div>
                    </div>
                    {a.jobMatch && (
                      <div>
                        <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Job Match</span>
                        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1.125rem" }}>{a.jobMatch.matchScore}%</div>
                      </div>
                    )}
                  </div>

                  {a.summary && (
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.75rem", lineHeight: 1.6 }}>
                      {a.summary}
                    </p>
                  )}

                  {a.skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.875rem" }}>
                      {a.skills.slice(0, 6).map((s) => (
                        <span key={s} className="chip chip-cyan" style={{ fontSize: "0.75rem", padding: "0.2rem 0.65rem" }}>{s}</span>
                      ))}
                      {a.skills.length > 6 && (
                        <span className="chip chip-blue" style={{ fontSize: "0.75rem", padding: "0.2rem 0.65rem" }}>+{a.skills.length - 6}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
