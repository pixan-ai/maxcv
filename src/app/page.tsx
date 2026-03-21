"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationBanner from "@/components/DonationBanner";

type ResultData = {
  improved: string;
  tips: string[];
  language: string;
};

const UI_TEXT = {
  en: {
    heroTitle: "Improve your resume",
    heroHighlight: "in seconds",
    heroSub:
      "Paste your CV below and let AI rewrite it to stand out. Free, no sign-up required.",
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
  },
  es: {
    heroTitle: "Mejora tu currículum",
    heroHighlight: "en segundos",
    heroSub:
      "Pega tu CV abajo y deja que la IA lo reescriba para destacar. Gratis, sin registro.",
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
  const resultRef = useRef<HTMLDivElement>(null);

  const t = UI_TEXT[lang];

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
      </main>

      <Footer />
    </div>
  );
}
