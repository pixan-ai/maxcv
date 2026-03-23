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

const UI = {
  en: {
    badge: "AI-powered resume improver",
    heroTitle: "Your resume,",
    heroHighlight: "reimagined",
    heroSub: "Paste, upload, or link your CV. Our AI rewrites it to stand out — optimized for ATS, tailored to your target role.",
    button: "Improve my resume",
    loading: "Improving...",
    resultTitle: "Your improved resume",
    copy: "Copy",
    copied: "Copied!",
    downloadPdf: "Download PDF",
    tipsTitle: "Actionable tips",
    errorGeneric: "Something went wrong. Please try again.",
    errorLimit: "Daily limit reached (3/day). Come back tomorrow!",
    errorConnection: "Connection error. Check your internet.",
    errorLength: "Please paste at least 50 characters.",
    tryAgain: "Improve another CV",
  },
  es: {
    badge: "Mejora de CV con IA",
    heroTitle: "Tu currículum,",
    heroHighlight: "reinventado",
    heroSub: "Pega, sube o vincula tu CV. Nuestra IA lo reescribe para destacar — optimizado para ATS, adaptado a tu puesto objetivo.",
    button: "Mejorar mi currículum",
    loading: "Mejorando...",
    resultTitle: "Tu currículum mejorado",
    copy: "Copiar",
    copied: "¡Copiado!",
    downloadPdf: "Descargar PDF",
    tipsTitle: "Consejos accionables",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorLimit: "Límite diario alcanzado (3/día). ¡Vuelve mañana!",
    errorConnection: "Error de conexión. Revisa tu internet.",
    errorLength: "Pega al menos 50 caracteres.",
    tryAgain: "Mejorar otro CV",
  },
};

function generateAndDownloadPdf(text: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>maxcv</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;font-size:11pt;line-height:1.6;color:#1a1a1a;padding:40px 50px;max-width:800px;margin:0 auto}pre{white-space:pre-wrap;word-wrap:break-word;font-family:inherit;font-size:inherit;line-height:inherit}@media print{body{padding:0}@page{margin:2cm}}</style>
    </head><body><pre>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
    <script>window.onload=function(){setTimeout(function(){window.print();window.close()},500)};<\/script></body></html>`);
  w.document.close();
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
  const t = UI[lang];

  const handleSubmit = async () => {
    if (!cvText.trim() || cvText.trim().length < 50) { setError(t.errorLength); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole }),
      });
      if (res.status === 429) { setError(t.errorLimit); return; }
      if (!res.ok) { setError(t.errorGeneric); return; }
      const data = await res.json();
      setResult(data);
      if (data.language === "es" && lang !== "es") setLang("es");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError(t.errorConnection); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--ink-000]">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} active="improve" />

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-12">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[--accent-ghost] text-[--accent] text-xs font-medium px-3 py-1 rounded-full mb-5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {t.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl tracking-tight mb-4 text-[--ink-900]">
            {t.heroTitle}
            <br />
            <span className="text-[--accent]">{t.heroHighlight}</span>
          </h1>
          <p className="text-[--ink-500] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            {t.heroSub}
          </p>
        </section>

        {/* Input */}
        {!result && (
          <div className="mb-8">
            <CVInput
              cvText={cvText} setCvText={setCvText}
              targetRole={targetRole} setTargetRole={setTargetRole}
              onSubmit={handleSubmit} loading={loading}
              error={error} setError={setError}
              isEs={lang === "es"} submitLabel={t.button} loadingLabel={t.loading}
            />
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef} className="space-y-6">
            {/* Improved resume card */}
            <div className="bg-white border border-[--ink-100] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[--ink-100] bg-[--ink-050]">
                <h2 className="text-sm font-medium text-[--ink-900]">{t.resultTitle}</h2>
                <div className="flex gap-3">
                  <button onClick={async () => {
                    if (!result) return;
                    await navigator.clipboard.writeText(result.improved);
                    setCopied(true); setTimeout(() => setCopied(false), 2000);
                  }}
                    className="text-xs text-[--accent] hover:text-[--accent-dim] font-medium transition cursor-pointer">
                    {copied ? t.copied : t.copy}
                  </button>
                  <button onClick={() => result && generateAndDownloadPdf(result.improved)}
                    className="text-xs text-[--ink-400] hover:text-[--ink-700] font-medium transition cursor-pointer">
                    {t.downloadPdf}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[--ink-900] p-5 sm:p-6">
                {result.improved}
              </pre>
            </div>

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="bg-[--accent-ghost] border border-[--accent]/10 rounded-xl p-5 sm:p-6">
                <h3 className="text-sm font-medium text-[--ink-900] mb-3">{t.tipsTitle}</h3>
                <ul className="space-y-2.5">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-[--ink-500] flex gap-2.5 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[--accent]/10 text-[--accent] text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Try again */}
            <button onClick={() => { setResult(null); setCvText(""); setTargetRole(""); }}
              className="w-full bg-[--ink-900] text-white font-medium py-3.5 px-6 rounded-xl hover:bg-[--ink-700] transition-colors cursor-pointer text-sm">
              {t.tryAgain}
            </button>

            <DonationBanner lang={lang} />
          </div>
        )}

        <AboutUs lang={lang} />
      </main>

      <Footer lang={lang} />
    </div>
  );
}
