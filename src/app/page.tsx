"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationBanner from "@/components/DonationBanner";
import AboutUs from "@/components/AboutUs";
import AtsExplainer from "@/components/AtsExplainer";

type ResultData = {
  improved: string;
  tips: string[];
  language: string;
};

type InputMode = "text" | "file" | "sheets";

const UI_TEXT = {
  en: {
    heroTitle: "Improve your resume",
    heroHighlight: "in seconds",
    heroSub:
      "Paste your CV, upload a file, or link a Google Sheet — AI rewrites it to stand out. Free, no sign-up required.",
    labelCv: "Your current resume",
    placeholderCv: "Paste your resume text here...",
    labelRole: "Target role or industry",
    optional: "(optional)",
    placeholderRole:
      "e.g. Senior Frontend Developer, Marketing Manager...",
    button: "Improve my resume",
    loading: "Improving your resume...",
    resultTitle: "Improved Resume",
    copy: "Copy",
    copied: "Copied!",
    downloadPdf: "Download PDF",
    tipsTitle: "Tips to strengthen your profile",
    errorGeneric: "Something went wrong. Please try again.",
    errorLimit:
      "You've reached the daily limit (3 improvements per day). Come back tomorrow!",
    errorConnection:
      "Connection error. Please check your internet and try again.",
    errorLength: "Please paste at least 50 characters of resume text.",
    // File upload
    tabText: "Paste text",
    tabFile: "Upload file",
    tabSheets: "Google Sheets",
    uploadLabel: "Upload your resume",
    uploadHint: "PDF, Word (.docx), or plain text — max 5MB",
    uploadButton: "Choose file",
    uploadDrop: "or drag and drop here",
    sheetsLabel: "Google Sheets link",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "Make sure the sheet is shared as \"Anyone with the link\"",
    parsing: "Reading your file...",
    parseError: "Could not read the file. Try pasting your resume instead.",
    sheetsError:
      "Could not access Google Sheet. Make sure it is shared publicly.",
  },
  es: {
    heroTitle: "Mejora tu currículum",
    heroHighlight: "en segundos",
    heroSub:
      "Pega tu CV, sube un archivo o vincula un Google Sheet — la IA lo reescribe para destacar. Gratis, sin registro.",
    labelCv: "Tu currículum actual",
    placeholderCv: "Pega el texto de tu currículum aquí...",
    labelRole: "Puesto o industria objetivo",
    optional: "(opcional)",
    placeholderRole:
      "ej. Gerente de Ventas, Desarrollador Frontend Senior...",
    button: "Mejorar mi currículum",
    loading: "Mejorando tu currículum...",
    resultTitle: "Currículum Mejorado",
    copy: "Copiar",
    copied: "¡Copiado!",
    downloadPdf: "Descargar PDF",
    tipsTitle: "Consejos para fortalecer tu perfil",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorLimit:
      "Has alcanzado el límite diario (3 mejoras por día). ¡Vuelve mañana!",
    errorConnection:
      "Error de conexión. Revisa tu internet e inténtalo de nuevo.",
    errorLength:
      "Por favor pega al menos 50 caracteres de texto de currículum.",
    // File upload
    tabText: "Pegar texto",
    tabFile: "Subir archivo",
    tabSheets: "Google Sheets",
    uploadLabel: "Sube tu currículum",
    uploadHint: "PDF, Word (.docx) o texto plano — máx 5MB",
    uploadButton: "Elegir archivo",
    uploadDrop: "o arrastra y suelta aquí",
    sheetsLabel: "Enlace de Google Sheets",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "Asegúrate de que la hoja esté compartida como \"Cualquier persona con el enlace\"",
    parsing: "Leyendo tu archivo...",
    parseError:
      "No se pudo leer el archivo. Intenta pegando tu currículum en su lugar.",
    sheetsError:
      "No se pudo acceder al Google Sheet. Asegúrate de que esté compartido públicamente.",
  },
};

function generateAndDownloadPdf(text: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MaxCV Resume</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1a1a1a;
          padding: 40px 50px;
          max-width: 800px;
          margin: 0 auto;
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'Inter', sans-serif;
          font-size: 11pt;
          line-height: 1.5;
        }
        @media print {
          body { padding: 0; }
          @page { margin: 2cm; }
        }
      </style>
    </head>
    <body>
      <pre>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export default function Home() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("en");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = UI_TEXT[lang];

  const handleFileUpload = async (file: File) => {
    setParsing(true);
    setError("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.parseError);
        setFileName("");
        return;
      }

      setCvText(data.text);
      setInputMode("text");
    } catch {
      setError(t.parseError);
      setFileName("");
    } finally {
      setParsing(false);
    }
  };

  const handleSheetsImport = async () => {
    if (!sheetsUrl.trim()) return;

    setParsing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("sheetsUrl", sheetsUrl);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.sheetsError);
        return;
      }

      setCvText(data.text);
      setInputMode("text");
      setSheetsUrl("");
    } catch {
      setError(t.sheetsError);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvText.trim()) return;

    if (cvText.trim().length < 50) {
      setError(t.errorLength);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole }),
      });

      if (res.status === 429) {
        setError(t.errorLimit);
        return;
      }

      if (!res.ok) {
        setError(t.errorGeneric);
        return;
      }

      const data = await res.json();
      setResult(data);

      // Switch UI language if the API detected Spanish
      if (data.language === "es" && lang !== "es") {
        setLang("es");
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    generateAndDownloadPdf(result.improved);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            {t.heroTitle}
            <br />
            <span className="text-accent">{t.heroHighlight}</span>
          </h1>
          <p className="text-muted text-lg max-w-md mx-auto">
            {t.heroSub}
          </p>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {/* Input mode tabs */}
          <div className="flex border-b border-border">
            {(["text", "file", "sheets"] as InputMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setInputMode(mode)}
                className={`px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                  inputMode === mode
                    ? "text-accent border-b-2 border-accent -mb-px"
                    : "text-muted hover:text-gray-900"
                }`}
              >
                {mode === "text" ? t.tabText : mode === "file" ? t.tabFile : t.tabSheets}
              </button>
            ))}
          </div>

          {/* Text input */}
          {inputMode === "text" && (
            <div>
              <label htmlFor="cv" className="block text-sm font-medium mb-1.5">
                {t.labelCv}
              </label>
              <textarea
                id="cv"
                rows={10}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={t.placeholderCv}
                className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y transition placeholder:text-gray-400"
                required
              />
            </div>
          )}

          {/* File upload */}
          {inputMode === "file" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t.uploadLabel}
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  dragOver
                    ? "border-accent bg-accent-light"
                    : "border-border hover:border-gray-400"
                }`}
              >
                {parsing ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t.parsing}
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    {/* Upload icon */}
                    <svg
                      className="mx-auto h-10 w-10 text-gray-300 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-medium text-accent hover:text-accent-hover transition cursor-pointer"
                    >
                      {t.uploadButton}
                    </button>
                    <p className="text-xs text-muted mt-1">{t.uploadDrop}</p>
                    <p className="text-xs text-muted mt-2">{t.uploadHint}</p>
                    {fileName && (
                      <p className="text-xs text-accent mt-2 font-medium">
                        {fileName}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Google Sheets */}
          {inputMode === "sheets" && (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="sheets"
                  className="block text-sm font-medium mb-1.5"
                >
                  {t.sheetsLabel}
                </label>
                <input
                  id="sheets"
                  type="url"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  placeholder={t.sheetsPlaceholder}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition placeholder:text-gray-400"
                />
                <p className="text-xs text-muted mt-1.5">{t.sheetsHint}</p>
              </div>
              <button
                type="button"
                onClick={handleSheetsImport}
                disabled={parsing || !sheetsUrl.trim()}
                className="w-full bg-accent text-white font-medium py-3 px-6 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {parsing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t.parsing}
                  </span>
                ) : (
                  lang === "en" ? "Import from Google Sheets" : "Importar de Google Sheets"
                )}
              </button>
            </div>
          )}

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1.5">
              {t.labelRole}{" "}
              <span className="text-muted font-normal">{t.optional}</span>
            </label>
            <input
              id="role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder={t.placeholderRole}
              className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !cvText.trim()}
            className="w-full bg-accent text-white font-medium py-3 px-6 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {t.loading}
              </span>
            ) : (
              t.button
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef} className="space-y-6">
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t.resultTitle}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-sm text-accent hover:text-accent-hover font-medium transition cursor-pointer"
                  >
                    {copied ? t.copied : t.copy}
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="text-sm text-muted hover:text-gray-900 font-medium transition cursor-pointer"
                  >
                    {t.downloadPdf}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {result.improved}
              </pre>
            </div>

            {result.tips.length > 0 && (
              <div className="bg-accent-light rounded-lg p-6">
                <h3 className="text-sm font-semibold mb-3">{t.tipsTitle}</h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-accent mt-0.5 shrink-0">
                        &bull;
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DonationBanner lang={lang} />
          </div>
        )}

        {/* ATS Explainer */}
        <AtsExplainer lang={lang} />

        {/* About Us */}
        <AboutUs lang={lang} />
      </main>

      <Footer />
    </div>
  );
}
