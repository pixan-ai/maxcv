import { NextRequest, NextResponse } from "next/server";

// Simple PDF generator without external dependencies
// Creates a basic PDF with the resume text
function generatePdf(text: string): Buffer {
  const lines = text.split("\n");
  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const margin = 50;
  const fontSize = 11;
  const lineHeight = 16;
  const maxCharsPerLine = 80;
  const usableHeight = pageHeight - 2 * margin;
  const linesPerPage = Math.floor(usableHeight / lineHeight);

  // Word-wrap lines
  const wrappedLines: string[] = [];
  for (const line of lines) {
    if (line.length === 0) {
      wrappedLines.push("");
      continue;
    }
    let remaining = line;
    while (remaining.length > maxCharsPerLine) {
      let breakAt = remaining.lastIndexOf(" ", maxCharsPerLine);
      if (breakAt <= 0) breakAt = maxCharsPerLine;
      wrappedLines.push(remaining.slice(0, breakAt));
      remaining = remaining.slice(breakAt).trimStart();
    }
    wrappedLines.push(remaining);
  }

  const totalPages = Math.ceil(wrappedLines.length / linesPerPage);
  const pages: string[][] = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(
      wrappedLines.slice(i * linesPerPage, (i + 1) * linesPerPage)
    );
  }

  // Escape special PDF characters
  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const objects: string[] = [];
  let objectCount = 0;
  const offsets: number[] = [];

  const addObject = (content: string) => {
    objectCount++;
    objects.push(content);
    return objectCount;
  };

  // Object 1: Catalog
  addObject("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  // Object 2: Pages (placeholder, will be updated)
  const pagesObjIndex = addObject("");

  // Object 3: Font
  addObject(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj"
  );

  const pageObjIds: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    const pageLines = pages[p];
    let stream = `BT\n/F1 ${fontSize} Tf\n`;
    let y = pageHeight - margin;

    for (const line of pageLines) {
      stream += `${margin} ${y.toFixed(2)} Td\n(${esc(line)}) Tj\n0 ${(-lineHeight).toFixed(2)} Td\n`;
      y -= lineHeight;
    }
    stream += "ET";

    const streamObjId = addObject(
      `${objectCount + 1} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`
    );

    const pageObjId = addObject(
      `${objectCount + 1} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${streamObjId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj`
    );
    pageObjIds.push(pageObjId);
  }

  // Update pages object
  const pageRefs = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  objects[pagesObjIndex - 1] =
    `2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj`;

  // Build PDF
  let pdf = "%PDF-1.4\n";
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += objects[i] + "\n";
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objectCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 0; i < objectCount; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const pdfBuffer = generatePdf(text);
    const uint8 = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="maxcv-resume.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
