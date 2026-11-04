import { GoogleGenerativeAI } from "@google/generative-ai";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-flash-latest" });
}

function extractJSON(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text;
}

export async function analyzeResume(resumeText: string): Promise<AnalysisResult> {
  const prompt = `You are an expert career coach and ATS (Applicant Tracking System) specialist. Analyze the following resume and return a JSON object with EXACTLY this structure:

{
  "score": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "skills": ["<skill 1>", "<skill 2>", ...],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...], 
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>", "<specific improvement 4>"],
  "atsScore": <number 0-100>
}

Score criteria:
- 80-100: Excellent, ready to apply
- 60-79: Good, minor improvements needed
- 40-59: Average, significant improvements needed
- 0-39: Poor, major rewrite needed

Respond ONLY with valid JSON, no markdown, no explanation.

RESUME:
${resumeText}`;

  const result = await getModel().generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = extractJSON(text);
  const parsed = JSON.parse(cleaned) as Partial<AnalysisResult>;
  const clamp = (value: unknown, fallback = 0) =>
    typeof value === "number" && Number.isFinite(value)
      ? Math.max(0, Math.min(100, Math.round(value)))
      : fallback;
  const strings = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];

  return {
    score: clamp(parsed.score),
    atsScore: clamp(parsed.atsScore),
    summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "No summary was generated.",
    strengths: strings(parsed.strengths),
    weaknesses: strings(parsed.weaknesses),
    skills: strings(parsed.skills),
    missingKeywords: strings(parsed.missingKeywords),
    improvements: strings(parsed.improvements),
  };
}

export async function matchJobDescription(
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  const prompt = `You are an expert recruiter and ATS specialist. Compare this resume against the job description and return a JSON object with EXACTLY this structure:

{
  "matchScore": <number 0-100>,
  "matchedSkills": ["<skill 1>", "<skill 2>", ...],
  "missingSkills": ["<missing skill 1>", "<missing skill 2>", ...],
  "tailoringSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "summary": "<2-3 sentence assessment of the fit>"
}

Respond ONLY with valid JSON, no markdown, no explanation.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  const result = await getModel().generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = extractJSON(text);
  const parsed = JSON.parse(cleaned) as Partial<JobMatchResult>;
  const strings = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];

  return {
    matchScore: typeof parsed.matchScore === "number" && Number.isFinite(parsed.matchScore)
      ? Math.max(0, Math.min(100, Math.round(parsed.matchScore)))
      : 0,
    matchedSkills: strings(parsed.matchedSkills),
    missingSkills: strings(parsed.missingSkills),
    tailoringSuggestions: strings(parsed.tailoringSuggestions),
    summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "No job match summary was generated.",
  };
}

export async function improveResume(
  resumeText: string,
  weaknesses: string[],
  improvements: string[],
  missingKeywords: string[],
  jobDescription?: string
): Promise<ImprovedContent> {
  const jobContext = jobDescription && jobDescription.trim().length > 20
    ? `\nTarget Job Description:\n${jobDescription}`
    : "";

  const prompt = `You are an expert resume writer and ATS optimization specialist. 
Based on the candidate's original resume, identified weaknesses, actionable improvements, and missing keywords, generate tailored improvements. 

Original Resume:
${resumeText}

Identified Weaknesses:
${weaknesses.map(w => `- ${w}`).join("\n")}

Actionable Improvements:
${improvements.map(i => `- ${i}`).join("\n")}

Missing Keywords/Skills:
${missingKeywords.map(k => `- ${k}`).join("\n")}${jobContext}

Provide the response as a JSON object with EXACTLY this structure:
{
  "improvedSummary": "<A compelling, ATS-friendly professional summary (3-4 sentences) that highlights top skills and matches the target job/keywords if provided.>",
  "improvedExperience": [
    "<Example rewritten experience bullet point 1 (use STAR/XYZ method, quantify results, integrate missing keywords/action verbs)>",
    "<Example rewritten experience bullet point 2 (use STAR/XYZ method, quantify results, integrate missing keywords/action verbs)>",
    "<Example rewritten experience bullet point 3 (use STAR/XYZ method, quantify results, integrate missing keywords/action verbs)>"
  ],
  "skillsIntegration": "<A brief paragraph advising the candidate on how to integrate the missing keywords into their Skills or Professional Experience sections naturally.>"
}

Respond ONLY with valid JSON, no markdown, no explanation.`;

  const result = await getModel().generateContent(prompt);
  const textResponse = result.response.text().trim();
  const cleaned = extractJSON(textResponse);
  const parsed = JSON.parse(cleaned) as Partial<ImprovedContent>;
  return {
    improvedSummary: typeof parsed.improvedSummary === "string" ? parsed.improvedSummary.trim() : "No improved summary was generated.",
    improvedExperience: Array.isArray(parsed.improvedExperience)
      ? parsed.improvedExperience.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
      : [],
    skillsIntegration: typeof parsed.skillsIntegration === "string" ? parsed.skillsIntegration.trim() : "",
  };
}

export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skills: string[];
  missingKeywords: string[];
  improvements: string[];
  atsScore: number;
}

export interface JobMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  tailoringSuggestions: string[];
  summary: string;
}

export interface ImprovedContent {
  improvedSummary: string;
  improvedExperience: string[];
  skillsIntegration: string;
}
