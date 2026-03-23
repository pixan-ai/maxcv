import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Share rate limiter with improve endpoint concept — simple in-memory
const ipRequests = new Map<string, { count: number; resetAt: number }>();
const DAILY_LIMIT = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now > record.resetAt) {
    ipRequests.set(ip, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000,
    });
    return false;
  }

  if (record.count >= DAILY_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

const SYSTEM_PROMPT = `You are an expert resume analyst. Your job is to evaluate resumes and provide a structured, empathetic analysis.

Rules:
- Detect the language of the resume and respond in THE SAME LANGUAGE
- Be specific and actionable — never vague ("improve your experience" is BAD, "your role at Acme Corp has no quantifiable metrics" is GOOD)
- Order improvements by impact (highest first)
- Be encouraging — the user may be frustrated from job searching
- Never say the resume is "bad" or "failing" — frame everything as improvement opportunities
- Identify genuine strengths — don't fabricate compliments, find real positives
- Score from 0-100 based on: clarity, ATS compatibility, impact of achievements, structure, keyword relevance

You MUST respond in valid JSON with exactly this structure:
{
  "score": 65,
  "improvements": [
    {
      "section": "Experience at Acme Corp",
      "issue": "No quantifiable achievements listed",
      "suggestion": "Add metrics: revenue generated, team size managed, percentage improvements",
      "impact": "high"
    }
  ],
  "strengths": [
    {
      "section": "Skills section",
      "detail": "Well-organized with relevant keywords for the target industry"
    }
  ],
  "language": "en"
}

Provide 4-8 improvements and 2-4 strengths, all in the resume's language.
Respond ONLY with the JSON object, no markdown fences or extra text.`;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const { cvText, targetRole } = await req.json();

    if (!cvText || typeof cvText !== "string" || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume text must be at least 50 characters" },
        { status: 400 }
      );
    }

    const trimmedCv = cvText.slice(0, 8000);

    let userMessage = `Analyze this resume and provide a structured score:\n\n${trimmedCv}`;
    if (targetRole && typeof targetRole === "string") {
      userMessage += `\n\nTarget role/industry: ${targetRole.slice(0, 200)}`;
    }

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: userMessage }],
      system: SYSTEM_PROMPT,
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      score: parsed.score,
      improvements: parsed.improvements || [],
      strengths: parsed.strengths || [],
      language: parsed.language || "en",
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Score API error:", errMsg);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
