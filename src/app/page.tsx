"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationBanner from "@/components/DonationBanner";
import AboutUs from "@/components/AboutUs";
import CVInput from "@/components/CVInput";

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
      "Paste your CV, upload a file, or link a Google Sheet — AI rewrites it to stand out. Free, no sign-up required.",
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
    tryAgain: "Improve another CV",
  },
  es: {
    heroTitle: "Mejora tu currículum",
    heroHighlight: "en segundos",
    heroSub:
      "Pega tu CV, sube un archivo o vincula un Google Sheet — la IA lo reescribe para destacar. Gratis, sin registro.",
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
    tryAgain: "Mejorar otro CV",
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
      <title>maxcv Resume</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
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
          font-family: system-ui, -apple-system, sans-serif;
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
      <\/script>
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
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("es");
  const resultRef = useRef<HTMLDivElement>(null);

  const t = UI_TEXT[lang];
  const isEs = lang === "es";

  const handleSubmit = async () => {
    if (!cvText.trim()) return;

    if (cvText.trim().length < 50) {
      setError(t.errorLength);
      return;
    }

    setLoading(true);
    setError(null);
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
        <section className="text-center mb-12">
          <h1 className="text-4xl tracking-tight mb-3 text-[--ink-900] font-light">
            {t.heroTitle}
            <br />
            <span className="text-[--accent]">{t.heroHighlight}</span>
          </h1>
          <p className="text-[--ink-500] text-lg max-w-md mx-auto">
            {t.heroSub}
          </p>
        </section>

        {!result && (
          <div className="mb-8">
            <CVInput
              cvText={cvText}
              setCvText={setCvText}
              targetRole={targetRole}
              setTargetRole={setTargetRole}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              setError={setError}
              isEs={isEs}
              submitLabel={t.button}
              loadingLabel={t.loading}
            />
          </div>
        )}

        {result && (
          <div ref={resultRef} className="space-y-6">
            <div className="border border-[--ink-100] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-[--ink-900]">{t.resultTitle}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-sm text-[--accent] hover:text-[--accent-dim] font-medium transition cursor-pointer"
                  >
                    {copied ? t.copied : t.copy}
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="text-sm text-[--ink-500] hover:text-[--ink-900] font-medium transition cursor-pointer"
                  >
                    {t.downloadPdf}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[--ink-900]">
                {result.improved}
              </pre>
            </div>

            {result.tips.length > 0 && (
              <div className="bg-[--accent-ghost] rounded-lg p-6">
                <h3 className="text-sm font-medium mb-3 text-[--ink-900]">{t.tipsTitle}</h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-[--ink-500] flex gap-2">
                      <span className="text-[--accent] mt-0.5 shrink-0">
                        &bull;
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => { setResult(null); setCvText(""); setTargetRole(""); }}
              className="w-full bg-[--accent] text-white font-[family-name:var(--font-mono)] text-sm tracking-wide py-3 px-6 rounded-lg hover:bg-[--accent-dim] transition-colors duration-150 cursor-pointer"
            >
              {t.tryAgain}
            </button>

            <DonationBanner lang={lang} />
          </div>
        )}

        <AboutUs lang={lang} />
      </main>

      <Footer />
    </div>
  );
}
