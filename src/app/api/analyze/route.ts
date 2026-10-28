import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { analyzeResume, matchJobDescription } from "@/lib/gemini";
import { PDFParse } from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const token = await getSessionToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume");
    const jobDescription = formData.get("jobDescription") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF must be 5 MB or smaller" }, { status: 400 });
    }
    if (jobDescription && jobDescription.length > 30000) {
      return NextResponse.json({ error: "Job description is too long" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    let resumeText = "";
    try {
      const pdfData = await parser.getText();
      resumeText = pdfData.text?.trim() ?? "";
    } finally {
      await parser.destroy();
    }

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Please ensure it is a text-based PDF." },
        { status: 400 }
      );
    }

    // AI analysis
    const analysisResult = await analyzeResume(resumeText);

    let jobMatchResult = null;
    if (jobDescription && jobDescription.trim().length > 20) {
      jobMatchResult = await matchJobDescription(resumeText, jobDescription);
    }

    // Save to DB
    await connectDB();
    const userId = token.id ?? token.email!;
    const analysis = await Analysis.create({
      userId,
      fileName: file.name,
      resumeText,
      score: analysisResult.score,
      atsScore: analysisResult.atsScore,
      summary: analysisResult.summary,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      skills: analysisResult.skills,
      missingKeywords: analysisResult.missingKeywords,
      improvements: analysisResult.improvements,
      ...(jobMatchResult && {
        jobMatch: {
          jobDescription,
          matchScore: jobMatchResult.matchScore,
          matchedSkills: jobMatchResult.matchedSkills,
          missingSkills: jobMatchResult.missingSkills,
          tailoringSuggestions: jobMatchResult.tailoringSuggestions,
          summary: jobMatchResult.summary,
        },
      }),
    });

    return NextResponse.json({
      id: analysis._id.toString(),
      ...analysisResult,
      jobMatch: jobMatchResult,
      fileName: file.name,
    });
  } catch (err: unknown) {
    console.error("Analyze error:", err);
    const errorMessage = err instanceof Error ? err.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
