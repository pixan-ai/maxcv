"use client";

import { useState, useRef, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────
type Improvement = {
  dimension: string;
  dimension_score: number;
  issue: string;
  suggestion: string;
  before?: string;
  after?: string;
};

type Strength = {
  dimension: string;
  dimension_score: number;
  detail: string;
};

type AnalysisResult = {
  detected_language: string;
  inferred_role?: string;
  score: { total: number; summary: string };
  analysis: {
    top_actions: string[];
    improvements: Improvement[];
    strengths: Strength[];
  };
  improved_cv: { text: string; changes: string[] };
};

// ─── Bilingual strings ─────────────────────────────────────────────
const UI = {
  es: {
    heroTitle: "Tu próximo trabajo empieza con un gran CV.",
    heroAccent: "Análisis profesional con IA. Gratis.",
    heroSub: "Descubre qué ven los reclutadores en tu CV y mejóralo al instante. Sin registro, sin trucos.",
    placeholder: "Pega el texto de tu CV aquí...",
    targetRole: "Puesto al que aspiras (opcional)",
    uploadPdf: "o arrastra un PDF aquí",
    btnAnalyze: "Analizar mi CV y recomendar mejoras",
    rateLimit: "7 análisis por hora · sin límite de uso diario",
    privacy: "Tu CV se analiza en tiempo real y se descarta al instante. Sin registro, sin almacenamiento.",
    analyzing: "Analizando tu CV...",
    scoreMeta: "puntuación actual",
    topActionsTitle: "Empieza aquí",
    topActionsSub: "Los 3 cambios con más impacto",
    improvementsTitle: "Lo que puedes mejorar",
    improvementsSub: "Ordenado por impacto — empieza por arriba",
    strengthsTitle: "Lo que ya funciona",
    strengthsSub: "Estas áreas están bien",
    improvedTitle: "Tu CV mejorado",
    changesTitle: "Qué cambió",
    copy: "Copiar",
    copied: "¡Copiado!",
    downloadWord: "Descargar para Word",
    donationText: "¿Te fue útil? Ayúdanos a mantenerlo gratis.",
    donationBtn: "Invitar un café",
    tryAgain: "Empezar de nuevo",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorLimit: "Límite alcanzado (7/hora). Intenta más tarde.",
    errorConnection: "Error de conexión. Revisa tu internet.",
    errorLength: "Pega al menos 50 caracteres.",
    before: "Antes",
    after: "Después",
  },
  en: {
    heroTitle: "Your next job starts with a great resume.",
    heroAccent: "Professional AI analysis. Free.",
    heroSub: "See what recruiters see in your resume and improve it instantly. No sign-up, no tricks.",
    placeholder: "Paste your resume text here...",
    targetRole: "Target role (optional)",
    uploadPdf: "or drag a PDF here",
    btnAnalyze: "Analyze my resume and suggest improvements",
    rateLimit: "7 analyses per hour · no daily limit",
    privacy: "Your resume is analyzed in real time and discarded instantly. No sign-up, no storage.",
    analyzing: "Analyzing your resume...",
    scoreMeta: "current score",
    topActionsTitle: "Start here",
    topActionsSub: "The 3 changes with the most impact",
    improvementsTitle: "What you can improve",
    improvementsSub: "Ordered by impact — start from the top",
    strengthsTitle: "What already works",
    strengthsSub: "These areas are solid",
    improvedTitle: "Your improved resume",
    changesTitle: "What changed",
    copy: "Copy",
    copied: "Copied!",
    downloadWord: "Download for Word",
    donationText: "Found this useful? Help us keep it free.",
    donationBtn: "Buy us a coffee",
    tryAgain: "Start over",
    errorGeneric: "Something went wrong. Please try again.",
    errorLimit: "Limit reached (7/hour). Try again later.",
    errorConnection: "Connection error. Check your internet.",
    errorLength: "Please paste at least 50 characters.",
    before: "Before",
    after: "After",
  },
};

const DIM_NAMES: Record<string, { en: string; es: string }> = {
  ats_compatibility: { en: "ATS Compatibility", es: "Compatibilidad ATS" },
  achievement_impact: { en: "Achievement Impact", es: "Impacto de Logros" },
  structure_format: { en: "Structure & Format", es: "Estructura y Formato" },
  keyword_relevance: { en: "Keyword Relevance", es: "Palabras Clave" },
  writing_clarity: { en: "Writing Clarity", es: "Claridad de Escritura" },
  completeness: { en: "Completeness", es: "Completitud" },
};

// ─── PDF text extraction (browser) ─────────────────────────────────
async function extractPdfText(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n\n");
}

// ─── Component ─────────────────────────────────────────────────────
export function Analyzer({ lang, onLangDetected }: {
  lang: "en" | "es";
  onLangDetected: (l: "en" | "es") => void;
}) {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const t = UI[lang];
  const ready = cvText.trim().length >= 50 && !loading;

  // ── PDF handling ──
  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") return;
    try {
      const text = await extractPdfText(file);
      setCvText(text);
      setError(null);
    } catch {
      setError(t.errorGeneric);
    }
  }, [t.errorGeneric]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Analyze ──
  const analyze = async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole: targetRole || undefined }),
      });

      if (res.status === 429) {
        setError(t.errorLimit);
        return;
      }

      if (!res.ok) {
        setError(t.errorGeneric);
        return;
      }

      const data: AnalysisResult = await res.json();
      setResult(data);

      // Auto-detect language from response
      if (data.detected_language === "en" || data.detected_language === "es") {
        onLangDetected(data.detected_language);
      }

      // Scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  };

  // ── Copy & Download ──
  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.improved_cv.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadForWord = () => {
    if (!result) return;
    const bom = "\uFEFF";
    const blob = new Blob([bom + result.improved_cv.text], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-maxcv.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setCvText("");
    setTargetRole("");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const dimName = (key: string) => DIM_NAMES[key]?.[lang] ?? key;

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center space-y-3 pt-4">
        <h1 className="text-2xl sm:text-3xl font-medium text-ink-900 hero-reveal-1">
          {t.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-accent font-medium hero-reveal-2">
          {t.heroAccent}
        </p>
        <p className="text-sm text-ink-400 max-w-md mx-auto leading-relaxed hero-reveal-3">
          {t.heroSub}
        </p>
      </section>

      {/* Input area */}
      {!result && (
        <section className="space-y-4">
          {/* Textarea + drop zone */}
          <div
            className={`relative border rounded-lg transition ${
              dragOver ? "border-accent bg-accent-ghost" : "border-ink-100"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              aria-describedby="cv-hint"
              className="w-full min-h-[200px] p-4 text-sm text-ink-700 bg-transparent
                         placeholder:text-ink-300 resize-y focus:outline-none"
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs text-ink-400 hover:text-accent transition cursor-pointer"
              >
                {t.uploadPdf}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                aria-label="Upload PDF"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          </div>

          {/* Target role */}
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder={t.targetRole}
            aria-label={t.targetRole}
            maxLength={200}
            className="w-full border border-ink-100 rounded-lg px-4 py-2.5 text-sm
                       text-ink-700 placeholder:text-ink-300 focus:outline-none
                       focus:border-accent transition"
            disabled={loading}
          />

          {/* CTA button */}
          <button
            onClick={analyze}
            disabled={!ready}
            aria-disabled={!ready}
            className={`w-full py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
              ready
                ? "bg-accent text-white hover:bg-accent-dim soft-pulse"
                : "bg-ink-100 text-ink-300 cursor-not-allowed"
            }`}
          >
            {loading ? t.analyzing : t.btnAnalyze}
          </button>

          {/* Privacy + rate limit */}
          <div id="cv-hint" className="text-center space-y-1">
            <p className="text-xs text-ink-300">{t.privacy}</p>
            <p className="text-xs text-ink-300">{t.rateLimit}</p>
          </div>
        </section>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-12" aria-live="polite">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent
                          rounded-full animate-spin mb-3" />
          <p className="text-sm text-ink-400">{t.analyzing}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="text-center py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="space-y-10" aria-live="polite">
          {/* Score — discrete metadata */}
          <div className="text-center card-enter">
            <span className="font-[family-name:var(--font-mono)] text-[13px] text-ink-500 tracking-wide">
              {result.score.total}/100 — {t.scoreMeta}
            </span>
            <p className="text-sm text-ink-600 mt-2 max-w-lg mx-auto leading-relaxed">
              {result.score.summary}
            </p>
          </div>

          {/* Top 3 Actions */}
          <section className="card-enter" style={{ animationDelay: "0.06s" }}>
            <h2 className="text-lg font-medium text-ink-900 mb-1">{t.topActionsTitle}</h2>
            <p className="text-xs text-ink-400 mb-4">{t.topActionsSub}</p>
            <div className="space-y-2">
              {result.analysis.top_actions.map((action, i) => (
                <div key={i} className="flex gap-3 border border-ink-100 rounded-lg p-4">
                  <span className="font-[family-name:var(--font-mono)] text-[13px] text-accent font-medium shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-ink-700">{action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Improvements */}
          {result.analysis.improvements.length > 0 && (
            <section className="card-enter" style={{ animationDelay: "0.12s" }}>
              <h2 className="text-lg font-medium text-ink-900 mb-1">{t.improvementsTitle}</h2>
              <p className="text-xs text-ink-400 mb-4">{t.improvementsSub}</p>
              <div className="space-y-3">
                {result.analysis.improvements.map((imp, i) => (
                  <div key={i} className="border border-ink-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink-700">{dimName(imp.dimension)}</span>
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-ink-400 tracking-wide uppercase">
                        {imp.dimension_score}/100
                      </span>
                    </div>
                    <p className="text-sm text-ink-600">{imp.issue}</p>
                    <p className="text-sm text-ink-500">{imp.suggestion}</p>
                    {imp.before && imp.after && (
                      <div className="grid gap-2 text-xs">
                        <div className="bg-ink-050 rounded-lg p-3">
                          <span className="font-[family-name:var(--font-mono)] text-ink-400 uppercase tracking-wide text-[11px]">
                            {t.before}
                          </span>
                          <p className="text-ink-500 mt-1">{imp.before}</p>
                        </div>
                        <div className="bg-positive-ghost rounded-lg p-3">
                          <span className="font-[family-name:var(--font-mono)] text-positive uppercase tracking-wide text-[11px]">
                            {t.after}
                          </span>
                          <p className="text-ink-700 mt-1">{imp.after}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Strengths */}
          {result.analysis.strengths.length > 0 && (
            <section className="card-enter" style={{ animationDelay: "0.18s" }}>
              <h2 className="text-lg font-medium text-ink-900 mb-1">{t.strengthsTitle}</h2>
              <p className="text-xs text-ink-400 mb-4">{t.strengthsSub}</p>
              <div className="space-y-2">
                {result.analysis.strengths.map((str, i) => (
                  <div key={i} className="border border-positive/20 bg-positive-ghost rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink-700">{dimName(str.dimension)}</span>
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-positive tracking-wide">
                        {str.dimension_score}/100
                      </span>
                    </div>
                    <p className="text-sm text-ink-600">{str.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Improved CV */}
          <section className="card-enter" style={{ animationDelay: "0.24s" }}>
            <h2 className="text-lg font-medium text-ink-900 mb-1">{t.improvedTitle}</h2>
            <div className="border border-ink-100 rounded-lg p-4 mb-3">
              <pre className="text-sm text-ink-700 whitespace-pre-wrap font-[family-name:var(--font-geist)] leading-relaxed">
                {result.improved_cv.text}
              </pre>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="border border-ink-100 rounded-lg px-4 py-2 text-sm text-ink-600
                           hover:border-ink-200 transition cursor-pointer"
              >
                {copied ? t.copied : t.copy}
              </button>
              <button
                onClick={downloadForWord}
                className="border border-ink-100 rounded-lg px-4 py-2 text-sm text-ink-600
                           hover:border-ink-200 transition cursor-pointer"
              >
                {t.downloadWord}
              </button>
            </div>
          </section>

          {/* Changes */}
          {result.improved_cv.changes.length > 0 && (
            <section className="card-enter" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-sm font-medium text-ink-900 mb-2">{t.changesTitle}</h2>
              <ul className="space-y-1">
                {result.improved_cv.changes.map((change, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-500">
                    <span className="text-positive shrink-0">+</span>
                    {change}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Donation CTA */}
          <div className="text-center border border-ink-100 rounded-lg p-6 card-enter"
               style={{ animationDelay: "0.36s" }}>
            <p className="text-sm text-ink-500 mb-3">{t.donationText}</p>
            <div className="flex justify-center gap-3">
              {process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK && (
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium
                             hover:bg-accent-dim transition"
                >
                  {t.donationBtn}
                </a>
              )}
              {process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK && (
                <a
                  href={process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-ink-100 px-5 py-2 rounded-lg text-sm text-ink-600
                             hover:border-ink-200 transition"
                >
                  PayPal
                </a>
              )}
            </div>
          </div>

          {/* Start over */}
          <div className="text-center">
            <button
              onClick={reset}
              className="text-sm text-ink-400 hover:text-ink-700 transition cursor-pointer"
            >
              {t.tryAgain}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
