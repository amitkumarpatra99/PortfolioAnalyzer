"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import ScoreRing from "@/components/ScoreRing";
import {
  Upload, FileText, Loader2, CheckCircle, XCircle, Lightbulb,
  Target, Zap, ChevronDown, ChevronUp, AlertCircle, Sparkles,
  Clipboard, Download,
} from "lucide-react";

interface AnalysisData {
  id: string;
  score: number;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skills: string[];
  missingKeywords: string[];
  improvements: string[];
  jobMatch?: {
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

function Section({ title, icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass no-pad" style={{ borderRadius: "1rem", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.125rem 1.25rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#f1f5f9",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: 600, fontSize: "0.9375rem" }}>
          {icon} {title}
        </span>
        {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
      </button>
      {open && <div style={{ padding: "0 1.25rem 1.25rem" }}>{children}</div>}
    </div>
  );
}

export default function AnalyzePage() {
  const { status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setResult(null);
      setError("");
      setImproveError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setImproveError("");

    const formData = new FormData();
    formData.append("resume", file);
    if (jobDesc.trim()) formData.append("jobDescription", jobDesc);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setCopyMessage("");
    } catch (e) {
      setError((e as Error).message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDesc("");
    setResult(null);
    setError("");
    setImproveError("");
    setCopyMessage("");
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const payload = {
      ...result,
      downloadedAt: new Date().toISOString(),
      reportSource: "Resume Analyzer",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `resume-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`Summary: ${result.summary}\n\nKey improvements: ${result.improvements.join("; ")}`);
      setCopyMessage("Summary copied to clipboard!");
      window.setTimeout(() => setCopyMessage(""), 2500);
    } catch {
      setCopyMessage("Unable to copy. Please try again.");
    }
  };

  const handleImprove = async () => {
    if (!result?.id) return;
    setImproving(true);
    setImproveError("");
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate improvements");
      setResult((prev) => (prev ? { ...prev, improvedContent: data } : null));
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

  return (
    <div className="hero-bg" style={{ minHeight: "calc(100vh - 64px)", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "Sora, Inter, sans-serif", fontSize: "2rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.375rem" }}>
            Resume Analyzer
          </h1>
          <p style={{ color: "#64748b" }}>Upload your resume and get instant AI-powered insights</p>
        </div>

        <div className={`analyze-grid ${result ? "has-result" : ""}`} style={{ gap: "1.5rem" }}>
          {/* Upload Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className="glass"
              style={{
                borderRadius: "1.25rem",
                padding: "2.5rem 1.5rem",
                textAlign: "center",
                cursor: "pointer",
                border: isDragActive
                  ? "2px dashed #06b6d4"
                  : file
                    ? "2px dashed #10b981"
                    : "2px dashed rgba(255,255,255,0.1)",
                transition: "all 0.2s",
                background: isDragActive ? "rgba(6, 182, 212, 0.05)" : undefined,
              }}
            >
              <input {...getInputProps()} />
              {file ? (
                <>
                  <FileText size={40} color="#10b981" style={{ margin: "0 auto 1rem" }} />
                  <p style={{ color: "#10b981", fontWeight: 600, marginBottom: "0.25rem" }}>{file.name}</p>
                  <p style={{ color: "#64748b", fontSize: "0.8125rem" }}>
                    {(file.size / 1024).toFixed(1)} KB - Click to change
                  </p>
                </>
              ) : (
                <>
                  <Upload size={40} color={isDragActive ? "#06b6d4" : "#475569"} style={{ margin: "0 auto 1rem" }} />
                  <p style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: "0.25rem" }}>
                    {isDragActive ? "Drop it here!" : "Drop your resume here"}
                  </p>
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>or click to browse - PDF only - max 5MB</p>
                </>
              )}
            </div>

            {/* Job description */}
            <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.25rem" }}>
              <label style={{ display: "block", fontWeight: 600, color: "#f1f5f9", fontSize: "0.9375rem", marginBottom: "0.75rem" }}>
                <Target size={16} style={{ display: "inline", marginRight: "0.4rem", verticalAlign: "middle" }} />
                Job Description <span style={{ color: "#64748b", fontSize: "0.8125rem", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                className="input"
                placeholder="Paste the job description here to see how well your resume matches..."
                rows={5}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.875rem", padding: "0.875rem 1rem", display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "#fca5a5", fontSize: "0.875rem" }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                {error}
              </div>
            )}

            <button
              className="btn-primary btn-lg"
              onClick={handleAnalyze}
              disabled={!file || loading}
              style={{ width: "100%", justifyContent: "center", opacity: !file || loading ? 0.6 : 1, cursor: !file ? "not-allowed" : "pointer" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Resume
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Score cards */}
              <div className="glass" style={{ borderRadius: "1.25rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "1rem" }}>
                  <ScoreRing score={result.score} size={130} label="Overall Score" />
                  <ScoreRing score={result.atsScore} size={130} label="ATS Score" color="#06b6d4" />
                  {result.jobMatch && (
                    <ScoreRing score={result.jobMatch.matchScore} size={130} label="Job Match" color="#10b981" />
                  )}
                </div>
                {result.summary && (
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", marginTop: "1.25rem", lineHeight: 1.6 }}>
                    {result.summary}
                  </p>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginTop: "1.25rem" }}>
                  <button type="button" className="btn-secondary" onClick={handleCopySummary}>
                    <Clipboard size={16} /> Copy summary
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleDownloadReport}>
                    <Download size={16} /> Download report
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleReset}>
                    New analysis
                  </button>
                </div>
                {copyMessage && (
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", textAlign: "center", marginTop: "0.75rem" }}>
                    {copyMessage}
                  </p>
                )}
              </div>

              {/* Strengths */}
              <Section title="Strengths" icon={<CheckCircle size={16} color="#10b981" />} defaultOpen>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {result.strengths.map((s, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.6rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                      <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Weaknesses */}
              <Section title="Areas to Improve" icon={<XCircle size={16} color="#ef4444" />} defaultOpen>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {result.weaknesses.map((w, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.6rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                      <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                      {w}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Improvements */}
              <Section title="Actionable Tips" icon={<Lightbulb size={16} color="#f59e0b" />}>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {result.improvements.map((tip, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.6rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                      <Lightbulb size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* AI Resume Improver */}
              <Section title="AI Resume Improver" icon={<Sparkles size={16} color="#67e8f9" />} defaultOpen>
                {!result.improvedContent ? (
                  <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(6, 182, 212, 0.05)", borderRadius: "0.875rem", border: "1px dashed rgba(6, 182, 212, 0.2)", marginTop: "0.5rem" }}>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <h4 style={{ color: "#f1f5f9", fontSize: "0.875rem", fontWeight: 600 }}>Improved Professional Summary</h4>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => handleCopyText(result.improvedContent!.improvedSummary, "Summary")}
                          style={{ padding: "0.25rem 0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                        >
                          <Clipboard size={12} /> Copy
                        </button>
                      </div>
                      <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6, background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.04)", whiteSpace: "pre-line" }}>
                        {result.improvedContent.improvedSummary}
                      </p>
                    </div>

                    <div>
                      <h4 style={{ color: "#f1f5f9", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Tailored Experience Bullet Points</h4>
                      <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {result.improvedContent.improvedExperience.map((bullet, idx) => (
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
                          onClick={() => handleCopyText(result.improvedContent!.skillsIntegration, "Integration tips")}
                          style={{ padding: "0.25rem 0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                        >
                          <Clipboard size={12} /> Copy
                        </button>
                      </div>
                      <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6, background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.04)", whiteSpace: "pre-line" }}>
                        {result.improvedContent.skillsIntegration}
                      </p>
                    </div>
                  </div>
                )}
              </Section>

              {/* Skills */}
              {result.skills.length > 0 && (
                <Section title="Detected Skills" icon={<Zap size={16} color="#06b6d4" />}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {result.skills.map((s) => (
                      <span key={s} className="chip chip-cyan">{s}</span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Missing Keywords */}
              {result.missingKeywords.length > 0 && (
                <Section title="Missing Keywords" icon={<AlertCircle size={16} color="#f59e0b" />}>
                  <p style={{ color: "#64748b", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
                    Add these keywords to improve your ATS score:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {result.missingKeywords.map((k) => (
                      <span key={k} className="chip chip-cyan">{k}</span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Job Match Details */}
              {result.jobMatch && (
                <Section title="Job Match Details" icon={<Target size={16} color="#10b981" />} defaultOpen>
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: 1.6 }}>
                    {result.jobMatch.summary}
                  </p>
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ color: "#10b981", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Matched Skills</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {result.jobMatch.matchedSkills.map((s) => <span key={s} className="chip chip-green">{s}</span>)}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ color: "#ef4444", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Missing Skills</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {result.jobMatch.missingSkills.map((s) => <span key={s} className="chip chip-red">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <p style={{ color: "#f59e0b", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Tailoring Suggestions</p>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {result.jobMatch.tailoringSuggestions.map((t, i) => (
                        <li key={i} style={{ color: "#94a3b8", fontSize: "0.875rem", display: "flex", gap: "0.4rem" }}>
                          <span style={{ color: "#f59e0b" }}>-</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .analyze-grid { display: grid; grid-template-columns: 1fr; }
        @media (min-width: 769px) {
          .analyze-grid.has-result { grid-template-columns: 1fr 1.4fr; }
        }
        @media (max-width: 768px) {
          .analyze-grid.has-result { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}


