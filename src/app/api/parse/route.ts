import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const anthropic = new Anthropic();

const EXTRACT_PROMPT =
  "Extract ALL text from this document exactly as written. Preserve structure: sections, bullet points, dates, job titles, company names. Return ONLY the raw text. No commentary, no introductions, no formatting markers. Just the plain text content.";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sheetsUrl = formData.get("sheetsUrl") as string | null;

    if (sheetsUrl) {
      const text = await parseGoogleSheets(sheetsUrl);
      return NextResponse.json({ text });
    }

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Archivo muy grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let text = "";

    if (ext === "pdf") {
      // PDF: Claude reads it natively
      try {
        const base64 = buffer.toString("base64");
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          temperature: 0,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf" as const,
                    data: base64,
                  },
                },
                { type: "text", text: EXTRACT_PROMPT },
              ],
            },
          ],
        });
        text = response.content[0].type === "text" ? response.content[0].text : "";
      } catch (e) {
        console.error("PDF extraction error:", e);
        return NextResponse.json(
          { error: "No pudimos leer tu PDF. Intenta pegando el texto en 'Pegar texto'." },
          { status: 400 }
        );
      }
    } else if (ext === "docx" || ext === "doc") {
      // DOCX/DOC: mammoth extracts text
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (e) {
        console.error("DOCX extraction error:", e);
        return NextResponse.json(
          { error: "No pudimos leer tu Word. Intenta pegando el texto en 'Pegar texto'." },
          { status: 400 }
        );
      }
    } else if (ext === "txt" || ext === "rtf") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Usa PDF, DOCX o TXT." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "No pudimos extraer texto. Intenta pegando el texto directamente." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Parse API error:", errMsg);
    return NextResponse.json(
      { error: "Error al procesar archivo. Intenta pegando el texto en 'Pegar texto'." },
      { status: 500 }
    );
  }
}

async function parseGoogleSheets(url: string): Promise<string> {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error("URL de Google Sheets inválida");

  const sheetId = match[1];
  const gidMatch = url.match(/gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(csvUrl, { redirect: "follow" });

  if (!res.ok)
    throw new Error("No pudimos acceder al Google Sheet. Verifica que esté compartido.");

  const csv = await res.text();
  if (!csv || csv.trim().length < 10)
    throw new Error("El Google Sheet parece estar vacío");

  return csv
    .split("\n")
    .map((line) => {
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) { fields.push(current.trim()); current = ""; }
        else current += char;
      }
      fields.push(current.trim());
      return fields.filter(Boolean).join("\t");
    })
    .filter(Boolean)
    .join("\n");
}
