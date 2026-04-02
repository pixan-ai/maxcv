import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { stripMarkdown } from "@/lib/apiUtils";
import { IMPROVE_PROMPT } from "@/lib/prompts";

const anthropic = new Anthropic();

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
      system: IMPROVE_PROMPT,
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = stripMarkdown(text);
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
