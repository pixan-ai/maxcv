import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Simple in-memory rate limiting (resets on deploy/restart)
const ipRequests = new Map<string, { count: number; resetAt: number }>();

const HOURLY_LIMIT = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (record.count >= HOURLY_LIMIT) return true;
  record.count++;
  return false;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

const SYSTEM_PROMPT = `You are an expert resume writer and career coach. Your job is to improve resumes to be more impactful, professional, and ATS-friendly.

Rules:
- Detect the language of the resume and respond in THE SAME LANGUAGE
- If the resume is in Spanish, improve it in Spanish. If in English, respond in English. Same for any other language.
- Rewrite the resume to be clearer, more concise, and results-oriented
- Use strong action verbs and quantify achievements where possible
- Improve formatting and structure for ATS compatibility
- Keep the same information — do not invent experience or skills
- If a target role is provided, tailor the language and keywords accordingly
- Maintain a professional tone
- Preserve the EXACT section structure of the original resume
- Use ALL CAPS for section headers (e.g., PROFESSIONAL EXPERIENCE, EDUCATION, SKILLS)
- Use • for bullet points
- Separate sections with blank lines
- The output must be copy-paste compatible with Microsoft Word

You MUST respond in valid JSON with exactly this structure:
{
  "improved": "The full improved resume text with clear sections separated by newlines",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "language": "detected language code (en, es, fr, zh, etc.)"
}

Provide 3-5 actionable tips specific to this resume, in the same language as the resume.
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

    // Cap input length to prevent abuse
    const trimmedCv = cvText.slice(0, 8000);

    let userMessage = `Here is my current resume:\n\n${trimmedCv}`;
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

    // Strip markdown fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      improved: parsed.improved,
      tips: parsed.tips || [],
      language: parsed.language || "en",
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Improve API error:", errMsg);
    return NextResponse.json(
      { error: "Failed to improve resume" },
      { status: 500 }
    );
  }
}
