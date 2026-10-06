"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Target, CheckCircle, XCircle, Lightbulb, Sparkles, Clipboard } from "lucide-react";
import ScoreRing from "@/components/ScoreRing";

interface AnalysisDetail {
  _id: string;
  fileName: string;
  resumeText: string;
  score: number;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skills: string[];
  missingKeywords: string[];
  improvements: string[];
  createdAt: string;
  jobMatch?: {
    jobDescription: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    tailoringSuggestions: string[];
    summary: string;
  };
  improvedContent?: {
    improvedSummary: string;
    improvedExperience: string[];
    skillsIntegration: string;
  };
}

export default function AnalysisDetailPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const invalidId = !params?.id;
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(!invalidId);
  const [error, setError] = useState(invalidId ? "Invalid report ID." : "");
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const handleImprove = async () => {
    if (!analysis?._id) return;
    setImproving(true);
    setImproveError("");
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: analysis._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate improvements");
      setAnalysis((prev) => (prev ? { ...prev, improvedContent: data } : null));
    } catch (e) {
      setImproveError((e as Error).message || "Something went wrong.");
    } finally {
      setImproving(false);
    }
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(`${label} copied to clipboard!`);
      window.setTimeout(() => setCopyMessage(""), 2500);
    } catch {
      setCopyMessage("Unable to copy. Please try again.");
    }
  };

  useEffect(() => {
    if (invalidId) return;

    fetch(`/api/history/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to load report.");
        }
        setAnalysis(data);
      })
      .catch((err) => setError(err.message || "Unable to load report."))
      .finally(() => setLoading(false));
  }, [invalidId, params.id]);

  const handleGoBack = () => router.push("/history");

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <Loader2 size={32} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="hero-bg" style={{ minHeight: "calc(100vh - 64px)", padding: "2.5rem 1.5rem" }}>
        <div className="glass" style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
          <button onClick={handleGoBack} className="btn-secondary" style={{ marginBottom: "1.25rem" }}>
            <ArrowLeft size={16} /> Back to history
          </button>
          <p style={{ color: "#fca5a5", fontWeight: 600 }}>{error || "Report not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-bg" style={{ minHeight: "calc(100vh - 64px)", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <button onClick={handleGoBack} className="btn-secondary" style={{ marginBottom: "1rem" }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h1 style={{ fontFamily: "Sora, Inter, sans-serif", fontSize: "2rem", fontWeight: 700, color: "#f1f5f9" }}>
              Analysis details
            </h1>
            <p style={{ color: "#64748b" }}>Deep dive into your saved resume analysis.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="chip chip-blue">{new Date(analysis.createdAt).toLocaleString()}</span>
            <span className="chip chip-cyan" style={{ whiteSpace: "normal", wordBreak: "break-all" }}>{analysis.fileName}</span>
          </div>
        </div>

        <div className="glass" style={{ borderRadius: "1.5rem", padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Overall score</span>
              <ScoreRing score={analysis.score} size={100} label="" />
            </div>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>ATS score</span>
              <ScoreRing score={analysis.atsScore} size={100} color="#06b6d4" label="" />
            </div>
            {analysis.jobMatch && (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Job match</span>
                <ScoreRing score={analysis.jobMatch.matchScore} size={100} color="#10b981" label="" />
              </div>
            )}
          </div>
        </div>

        <div className="glass" style={{ borderRadius: "1.5rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.75rem" }}>Summary</h2>
          <p style={{ color: "#94a3b8", lineHeight: 1.75 }}>{analysis.summary}</p>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 700, color: "#f1f5f9" }}>Strengths</h3>
              <CheckCircle size={18} color="#10b981" />
            </div>
            <ul style={{ display: "grid", gap: "0.75rem" }}>
              {analysis.strengths.map((item) => (
                <li key={item} style={{ color: "#94a3b8" }}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 700, color: "#f1f5f9" }}>Areas to improve</h3>
              <XCircle size={18} color="#ef4444" />
            </div>
            <ul style={{ display: "grid", gap: "0.75rem" }}>
              {analysis.weaknesses.map((item) => (
                <li key={item} style={{ color: "#94a3b8" }}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 700, color: "#f1f5f9" }}>Improvements</h3>
              <Lightbulb size={18} color="#f59e0b" />
            </div>
            <ul style={{ display: "grid", gap: "0.75rem" }}>
              {analysis.improvements.map((item) => (
                <li key={item} style={{ color: "#94a3b8" }}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Resume Improver */}
        <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={18} color="#67e8f9" /> AI Resume Improver
            </h3>
          </div>
          {!analysis.improvedContent ? (
            <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(6, 182, 212, 0.05)", borderRadius: "0.875rem", border: "1px dashed rgba(6, 182, 212, 0.2)" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                Want to take action on these insights? Let our AI rewrite your professional summary, tailor your experience bullet points, and integrate missing keywords.
              </p>
              {improveError && (
                <p style={{ color: "#fca5a5", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{improveError}</p>
              )}
              <button
                className="btn-primary"
                onClick={handleImprove}
                disabled={improving}
                style={{ fontSize: "0.875rem", cursor: "pointer" }}
              >
                {improving ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Improving Resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Improve Resume with AI
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {copyMessage && (
                <div style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#67e8f9", fontSize: "0.875rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", textAlign: "center" }}>
                  {copyMessage}
                </div>
              )}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h4 style={{ color: "#f1f5f9", fontSize: "0.875rem", fontWeight: 600 }}>Improved Professional Summary</h4>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => handleCopyText(analysis.improvedContent!.improvedSummary, "Summary")}
                    style={{ padding: "0.25rem 0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    <Clipboard size={12} /> Copy
                  </button>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6, background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.04)", whiteSpace: "pre-line" }}>
                  {analysis.improvedContent.improvedSummary}
                </p>
              </div>

              <div>
                <h4 style={{ color: "#f1f5f9", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Tailored Experience Bullet Points</h4>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {analysis.improvedContent.improvedExperience.map((bullet, idx) => (
                    <li key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.5 }}>• {bullet}</p>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => handleCopyText(bullet, `Bullet point ${idx + 1}`)}
                          style={{ padding: "0.25rem 0.5rem", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.25rem" }}
                        >
                          <Clipboard size={12} /> Copy
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h4 style={{ color: "#f1f5f9", fontSize: "0.875rem", fontWeight: 600 }}>Keywords & Skills Integration</h4>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => handleCopyText(analysis.improvedContent!.skillsIntegration, "Integration tips")}
                    style={{ padding: "0.25rem 0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    <Clipboard size={12} /> Copy
                  </button>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6, background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.04)", whiteSpace: "pre-line" }}>
                  {analysis.improvedContent.skillsIntegration}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.5rem" }}>
          <h3 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: "0.75rem" }}>Detected skills</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {analysis.skills.map((skill) => (
              <span key={skill} className="chip chip-cyan">{skill}</span>
            ))}
          </div>
        </div>

        <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.5rem" }}>
          <h3 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: "0.75rem" }}>Missing keywords</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {analysis.missingKeywords.map((keyword) => (
              <span key={keyword} className="chip chip-cyan">{keyword}</span>
            ))}
          </div>
        </div>

        {analysis.jobMatch && (
          <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 700, color: "#f1f5f9" }}>Job match details</h3>
              <Target size={18} color="#10b981" />
            </div>
            <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>{analysis.jobMatch.summary}</p>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Matched skills</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {analysis.jobMatch.matchedSkills.map((skill) => (
                    <span key={skill} className="chip chip-green">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Missing skills</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {analysis.jobMatch.missingSkills.map((skill) => (
                    <span key={skill} className="chip chip-red">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Tailoring suggestions</p>
                <ul style={{ color: "#94a3b8", display: "grid", gap: "0.5rem" }}>
                  {analysis.jobMatch.tailoringSuggestions.map((suggestion) => (
                    <li key={suggestion}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
