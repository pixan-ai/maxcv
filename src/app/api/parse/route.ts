import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "invalid_file", message: "Please upload a PDF file" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "too_large", message: "File must be under 10MB" },
        { status: 400 },
      );
    }

    // Convert PDF to base64 and let Claude read it natively
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const model = process.env.CLAUDE_MODEL || "claude-opus-4-6";

    const message = await anthropic.messages.create({
      model,
      max_tokens: 8000,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Extract ALL text from this PDF resume exactly as written. Preserve the original formatting, line breaks, and section structure. Do not add any commentary, analysis, or modifications. Output ONLY the raw text content of the resume.",
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: "empty", message: "Could not extract text from PDF" },
        { status: 422 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json(
      { error: "parse_error", message: "Failed to read PDF" },
      { status: 500 },
    );
  }
}
