import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { stripMarkdown, sanitizeInput } from "@/lib/apiUtils";

const ANALYZE_PROMPT = readFileSync(
  join(process.cwd(), "src/lib/prompts/analyze.txt"),
  "utf-8",
);

const MAX_CV_LENGTH = 35_000;
const MAX_ROLE_LENGTH = 200;
const MIN_CV_LENGTH = 50;

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "rate_limit", message: "Rate limit exceeded" },
      { status: 429 },
    );
  }

  // Parse and validate input
  let body: { cvText?: string; targetRole?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Invalid request body" },
      { status: 400 },
    );
  }

  const cvText = sanitizeInput(body.cvText ?? "");
  const targetRole = sanitizeInput(
    (body.targetRole ?? "").slice(0, MAX_ROLE_LENGTH),
  );

  if (cvText.length < MIN_CV_LENGTH) {
    return NextResponse.json(
      { error: "too_short", message: "CV text must be at least 50 characters" },
      { status: 400 },
    );
  }

  const trimmedCv = cvText.slice(0, MAX_CV_LENGTH);

  // Build user message
  let userMessage = `Here is the resume to analyze:\n\n${trimmedCv}`;
  if (targetRole) {
    userMessage += `\n\nTarget role: ${targetRole}`;
  }

  // Call Claude with prompt caching
  const model = process.env.CLAUDE_MODEL || "claude-opus-4-6";

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 16_000,
      temperature: 0,
      system: [
        {
          type: "text",
          text: ANALYZE_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = stripMarkdown(raw);

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Claude response as JSON");
      return NextResponse.json(
        { error: "parse_error", message: "Failed to process analysis" },
        { status: 500 },
      );
    }

    // Validate required fields
    if (!result.score || !result.analysis || !result.improved_cv) {
      console.error("Missing required fields in Claude response");
      return NextResponse.json(
        { error: "incomplete", message: "Incomplete analysis result" },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "api_error", message: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
