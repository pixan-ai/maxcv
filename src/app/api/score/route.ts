import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { stripMarkdown } from "@/lib/apiUtils";
import { SCORE_PROMPT } from "@/lib/prompts";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { cvText, targetRole } = await req.json();

    if (!cvText || typeof cvText !== "string" || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume text must be at least 50 characters" },
        { status: 400 }
      );
    }

    const trimmedCv = cvText.slice(0, 15000);

    let userMessage = `Analyze this resume and return the JSON score:\n\n${trimmedCv}`;
    if (targetRole && typeof targetRole === "string") {
      userMessage += `\n\nTarget role/industry: ${targetRole.slice(0, 200)}`;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      temperature: 0,
      messages: [{ role: "user", content: userMessage }],
      system: SCORE_PROMPT,
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = stripMarkdown(text);
    const parsed = JSON.parse(cleaned);

    // Validate required fields before returning
    if (!parsed.dimensions || typeof parsed.dimensions !== "object") {
      throw new Error("API response missing dimensions object");
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Score API error:", errMsg);
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}
