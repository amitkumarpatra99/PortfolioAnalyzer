import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { improveResume } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const token = await getSessionToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Analysis ID required" }, { status: 400 });
    }

    await connectDB();
    const userId = token.id ?? token.email!;
    const analysis = await Analysis.findOne({ _id: id, userId });
    
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // If already generated, return it
    if (analysis.improvedContent?.improvedSummary) {
      return NextResponse.json(analysis.improvedContent);
    }

    // Call Gemini
    const improved = await improveResume(
      analysis.resumeText,
      analysis.weaknesses,
      analysis.improvements,
      analysis.missingKeywords,
      analysis.jobMatch?.jobDescription
    );

    // Save to DB
    analysis.improvedContent = improved;
    await analysis.save();

    return NextResponse.json(improved);
  } catch (error: unknown) {
    console.error("Improvement error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate improvements.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
