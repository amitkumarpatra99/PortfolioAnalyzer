# Portfolio Analyzer 

A beautiful AI-powered resume analysis platform built with Next.js, Google Gemini, and MongoDB.

Upload a PDF resume, get instant ATS insights, resume strength scores, missing keyword suggestions, and optional job description matching.

---

## ?? What it does....

- Secure user registration and login with email/password authentication
- Upload text-based PDF resumes for instant AI evaluation
- Generate an overall resume score and ATS score
- Extract resume strengths, weaknesses, skills, and improvement suggestions
- Compare resume content to a job description for match score and tailoring advice
- Store historical analyses in MongoDB for review later
- Responsive, glassmorphism-inspired UI with Tailwind styling

---

## ?? Pages

- `/` � Landing page with product overview and CTA
- `/auth/register` � Create an account
- `/auth/login` � Sign in
- `/analyze` � Upload resume and run AI analysis
- `/dashboard` � Overview of recent analyses and performance metrics
- `/history` — View saved analysis history
- `/history/[id]` — View detailed analysis report

---

## ??? Tech stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- NextAuth v5 for authentication
- Mongoose + MongoDB for persistence
- Google Gemini AI for resume evaluation and job matching
- `pdf-parse` for extracting text from uploaded PDFs
- `bcryptjs` for secure password hashing

---

## ?? Key backend routes

- `POST /api/register` � create a new user account
- `POST /api/analyze` � upload resume, extract text, analyze with Gemini AI, optionally match a job description
- `GET /api/history` � fetch authenticated user analysis history
- `DELETE /api/history?id=<analysisId>` � delete a saved analysis

---

## ?? Environment variables

Create a `.env.local` file at the project root with:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
NEXTAUTH_SECRET=your_nextauth_secret
```

> `MONGODB_URI` must point to your MongoDB instance.

---

## ?? Local setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

---

## ?? Production

```bash
npm run build
npm start
```

---

## ?? Notes

- The resume analyzer expects text-based PDF resumes.
- Job description matching is optional but recommended for tailored feedback.
- Analysis results are stored per user, so your data is available across sessions.

---

## ?? Contribution

Feel free to extend this project with additional AI prompts, richer resume parsing, or improved dashboard analytics.
