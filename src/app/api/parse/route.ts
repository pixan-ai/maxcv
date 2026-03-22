import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Try pdf-parse v2 API first
  try {
    const { PDFParse } = await import("pdf-parse");
    const data = new Uint8Array(buffer);
    const parser = new PDFParse({ data });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  } catch (e1) {
    console.error("pdf-parse v2 failed:", e1);
  }

  // Fallback: try pdf-parse v1 API (default export)
  try {
    const pdfParse = (await import("pdf-parse")).default;
    if (typeof pdfParse === "function") {
      const result = await pdfParse(buffer);
      return result.text;
    }
  } catch (e2) {
    console.error("pdf-parse v1 fallback failed:", e2);
  }

  // Last resort: basic text extraction from PDF buffer
  try {
    const text = buffer.toString("utf-8");
    // Look for readable text between stream markers
    const readable = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (readable.length > 100) {
      return readable;
    }
  } catch (e3) {
    console.error("Raw text extraction failed:", e3);
  }

  throw new Error("PDF_PARSE_FAILED");
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
        { error: "Archivo muy grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      try {
        text = await extractPdfText(buffer);
      } catch {
        return NextResponse.json(
          {
            error:
              "No pudimos leer tu PDF. Esto puede pasar con PDFs escaneados o protegidos. Intenta abrir tu PDF, seleccionar todo el texto (Ctrl+A), copiar (Ctrl+C), y pegarlo en la pestaña 'Pegar texto'.",
          },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch {
        return NextResponse.json(
          {
            error:
              "No pudimos leer tu archivo Word. Intenta abrirlo, seleccionar todo (Ctrl+A), copiar (Ctrl+C), y pegarlo en la pestaña 'Pegar texto'.",
          },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Usa PDF, DOCX o TXT." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "No pudimos extraer texto del archivo. El archivo puede estar vacío o ser una imagen escaneada. Intenta pegando el texto directamente.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Parse API error:", errMsg);
    return NextResponse.json(
      {
        error:
          "Error al procesar el archivo. Intenta pegando el texto de tu CV directamente en la pestaña 'Pegar texto'.",
      },
      { status: 500 }
    );
  }
}

async function parseGoogleSheets(url: string): Promise<string> {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error("URL de Google Sheets inválida");
  }

  const sheetId = match[1];
  const gidMatch = url.match(/gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const res = await fetch(csvUrl, { redirect: "follow" });

  if (!res.ok) {
    throw new Error(
      "No pudimos acceder al Google Sheet. Asegúrate de que esté compartido como 'Cualquier persona con el enlace'."
    );
  }

  const csv = await res.text();

  if (!csv || csv.trim().length < 10) {
    throw new Error("El Google Sheet parece estar vacío");
  }

  const lines = csv.split("\n").map((line) => {
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
