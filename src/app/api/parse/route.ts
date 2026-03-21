import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sheetsUrl = formData.get("sheetsUrl") as string | null;

    // Handle Google Sheets URL
    if (sheetsUrl) {
      const text = await parseGoogleSheets(sheetsUrl);
      return NextResponse.json({ text });
    }

    // Handle file upload
    if (!file) {
      return NextResponse.json(
        { error: "No file or URL provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      text = await extractPdfText(buffer);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Could not extract text from file. Try pasting your resume instead." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Parse API error:", errMsg);
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 }
    );
  }
}

async function parseGoogleSheets(url: string): Promise<string> {
  // Convert Google Sheets URL to CSV export URL
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error("Invalid Google Sheets URL");
  }

  const sheetId = match[1];
  // Extract gid if present, default to 0
  const gidMatch = url.match(/gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const res = await fetch(csvUrl, { redirect: "follow" });

  if (!res.ok) {
    throw new Error(
      "Could not access Google Sheet. Make sure it is shared as 'Anyone with the link'."
    );
  }

  const csv = await res.text();

  if (!csv || csv.trim().length < 10) {
    throw new Error("Google Sheet appears to be empty");
  }

  // Convert CSV to readable text (rows separated by newlines, columns by tabs)
  const lines = csv.split("\n").map((line) => {
    // Simple CSV parsing: split by comma, handle quoted fields
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    return fields.filter(Boolean).join("\t");
  });

  return lines.filter(Boolean).join("\n");
}
