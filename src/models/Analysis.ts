import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysis extends Document {
  userId: string;
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
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, default: "resume.pdf" },
    resumeText: { type: String, required: true },
    score: { type: Number, required: true },
    atsScore: { type: Number, default: 0 },
    summary: { type: String, default: "" },
    strengths: [String],
    weaknesses: [String],
    skills: [String],
    missingKeywords: [String],
    improvements: [String],
    jobMatch: {
      jobDescription: String,
      matchScore: Number,
      matchedSkills: [String],
      missingSkills: [String],
      tailoringSuggestions: [String],
      summary: String,
    },
    improvedContent: {
      improvedSummary: String,
      improvedExperience: [String],
      skillsIntegration: String,
    },
  },
  { timestamps: true }
);

const Analysis =
  mongoose.models.Analysis || mongoose.model<IAnalysis>("Analysis", AnalysisSchema);
export default Analysis;
