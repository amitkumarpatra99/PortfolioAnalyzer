import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = extractJSON(text);
  return JSON.parse(cleaned) as AnalysisResult;
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

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = extractJSON(text);
  return JSON.parse(cleaned) as JobMatchResult;
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

  const result = await model.generateContent(prompt);
  const textResponse = result.response.text().trim();
  const cleaned = extractJSON(textResponse);
  return JSON.parse(cleaned) as ImprovedContent;
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
