import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getSessionToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await connectDB();
    const userId = token.id ?? token.email!;
    const analysis = await Analysis.findOne({ _id: id, userId }).lean();
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("History detail error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
