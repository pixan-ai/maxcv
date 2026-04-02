"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ResumeText } from "@/components/ResumeText";

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
    attachPdf: "Adjuntar PDF",
    targetRole: "Puesto al que aspiras (opcional)",
    btnAnalyze: "Analizar tu CV y recomendar mejoras",
    rateLimit: "7 análisis por hora · sin límite de uso diario",
    privacy: "Tu CV se analiza en tiempo real y se descarta al instante. Sin registro, sin almacenamiento.",
    analyzing: "Analizando tu CV...",
    readingPdf: "Leyendo tu PDF...",
    scoreMeta: "puntuación actual",
    analysisBlockTitle: "Análisis de tu CV",
    analysisBlockSub: "Expande cada sección para ver el detalle",
    analysisSummaryTitle: "Resumen del análisis",
    strengthsTitle: "Lo que ya funciona bien",
    improvementsTitle: "Oportunidades de mejora",
    improvedBlockTitle: "Tu CV con mejoras",
    changesSubTitle: "Mejoras que aplicamos",
    improvedNote: "Revísalo y realiza las correcciones que consideres necesarias en tu documento. Si quieres, vuélvelo a subir — puedes hacer 7 revisiones cada hora, ilimitadas por día.",
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
    errorPdf: "No se pudo leer el PDF. Intenta pegando el texto directamente.",
    before: "Antes",
    after: "Después",
  },
  en: {
    heroTitle: "Your next job starts with a great resume.",
    heroAccent: "Professional AI analysis. Free.",
    heroSub: "See what recruiters see in your resume and improve it instantly. No sign-up, no tricks.",
    placeholder: "Paste your resume text here...",
    attachPdf: "Attach PDF",
    targetRole: "Target role (optional)",
    btnAnalyze: "Analyze your resume and suggest improvements",
    rateLimit: "7 analyses per hour · no daily limit",
    privacy: "Your resume is analyzed in real time and discarded instantly. No sign-up, no storage.",
    analyzing: "Analyzing your resume...",
    readingPdf: "Reading your PDF...",
    scoreMeta: "current score",
    analysisBlockTitle: "Analysis of your resume",
    analysisBlockSub: "Expand each section for details",
    analysisSummaryTitle: "Analysis summary",
    strengthsTitle: "What already works well",
    improvementsTitle: "Improvement opportunities",
    improvedBlockTitle: "Your resume with improvements",
    changesSubTitle: "Improvements we applied",
    improvedNote: "Review it and make any corrections you see fit. Want to refine further? Upload it again — 7 reviews per hour, unlimited per day.",
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
    errorPdf: "Could not read the PDF. Try pasting the text directly.",
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

// ─── Progress bar (asymptotic) ─────────────────────────────────────
function ProgressBar({ label, durationMs = 15000 }: { label: string; durationMs?: number }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(90, (elapsed / durationMs) * 90));
    }, 100);
    return () => clearInterval(interval);
  }, [durationMs]);

  return (
    <div className="w-full max-w-sm mx-auto text-center py-8">
      <div className="h-1 bg-ink-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  );
}

// ─── Step badge ────────────────────────────────────────────────────
function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent text-white text-[11px]
                     font-medium flex items-center justify-center mt-0.5">
      {n}
    </span>
  );
}

// ─── Collapsible section ───────────────────────────────────────────
function Collapsible({ title, isOpen, onToggle, children }: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-ink-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-ink-700
                   hover:bg-ink-050 transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-ink-400 text-xs transition-transform duration-200"
              style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
          ▸
        </span>
        {title}
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "2000px" : "0" }}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────
export function Analyzer({ lang, onLangDetected }: {
  lang: "en" | "es";
  onLangDetected: (l: "en" | "es") => void;
}) {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const t = UI[lang];
  const ready = cvText.trim().length >= 50 && !loading && !parsing;

  // ── PDF handling via backend ──
  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") return;
    setParsing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      if (!res.ok) { setError(t.errorPdf); return; }
      const data = await res.json();
      if (data.text && data.text.trim().length > 10) {
        setCvText(data.text);
      } else {
        setError(t.errorPdf);
      }
    } catch {
      setError(t.errorPdf);
    } finally {
      setParsing(false);
    }
  }, [t.errorPdf]);

  // ── Analyze ──
  const analyze = async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setOpenSection(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole: targetRole || undefined }),
      });

      if (res.status === 429) { setError(t.errorLimit); return; }
      if (!res.ok) { setError(t.errorGeneric); return; }

      const data: AnalysisResult = await res.json();
      setResult(data);

      if (data.detected_language === "en" || data.detected_language === "es") {
        onLangDetected(data.detected_language);
      }

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
    setOpenSection(null);
  };

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
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

      {/* Progress bar (above input) */}
      {(loading || parsing) && (
        <div aria-live="polite">
          <ProgressBar
            label={parsing ? t.readingPdf : t.analyzing}
            durationMs={parsing ? 8000 : 30000}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="text-center py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ═══════════ INPUT FORM ═══════════ */}
      {!result && !loading && !parsing && (
        <section className="space-y-5">
          {/* Step 1: CV Input */}
          <div className="flex gap-3">
            <StepBadge n={1} />
            <div className="flex-1">
              <div className="relative border border-ink-100 rounded-lg focus-within:border-accent transition">
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={t.placeholder}
                  aria-label={t.placeholder}
                  aria-describedby="cv-hint"
                  className="w-full min-h-[180px] p-4 pb-12 text-sm text-ink-700 bg-transparent
                             placeholder:text-ink-300 resize-y focus:outline-none rounded-lg"
                />
                {/* Attach PDF pill */}
                <div className="absolute bottom-3 right-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink-100
                               text-xs text-ink-500 hover:border-accent hover:text-accent
                               transition cursor-pointer bg-ink-000"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    {t.attachPdf}
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
            </div>
          </div>

          {/* Step 2: Target Role */}
          <div className="flex gap-3">
            <StepBadge n={2} />
            <div className="flex-1">
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
              />
            </div>
          </div>

          {/* Step 3: CTA Button */}
          <div className="flex gap-3">
            <StepBadge n={3} />
            <div className="flex-1">
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
                {t.btnAnalyze}
              </button>
            </div>
          </div>

          {/* Privacy + rate limit */}
          <div id="cv-hint" className="text-center space-y-1 pl-8">
            <p className="text-xs text-ink-300">{t.privacy}</p>
            <p className="text-xs text-ink-300">{t.rateLimit}</p>
          </div>
        </section>
      )}

      {/* ═══════════ RESULTS ═══════════ */}
      {result && (
        <div ref={resultsRef} className="space-y-8" aria-live="polite">

          {/* Score — discrete metadata + summary */}
          <div className="card-enter">
            <div className="text-center mb-3">
              <span className="font-[family-name:var(--font-mono)] text-[13px] text-ink-500 tracking-wide">
                {result.score.total}/100 — {t.scoreMeta}
              </span>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">
              {result.score.summary}
            </p>
          </div>

          {/* Block 1: Analysis */}
          <section className="card-enter" style={{ animationDelay: "0.06s" }}>
            <h2 className="text-lg font-medium text-ink-900 mb-1">{t.analysisBlockTitle}</h2>
            <p className="text-xs text-ink-400 mb-4">{t.analysisBlockSub}</p>

            <div className="space-y-2">
              {/* 1.1 Analysis summary (top_actions) */}
              <Collapsible
                title={t.analysisSummaryTitle}
                isOpen={openSection === "summary"}
                onToggle={() => toggleSection("summary")}
              >
                <ol className="space-y-2 mt-1">
                  {result.analysis.top_actions.map((action, i) => (
                    <li key={i} className="flex gap-3 text-sm text-ink-700">
                      <span className="font-[family-name:var(--font-mono)] text-accent text-[13px] font-medium shrink-0">
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ol>
              </Collapsible>

              {/* 1.2 Strengths */}
              {result.analysis.strengths.length > 0 && (
                <Collapsible
                  title={t.strengthsTitle}
                  isOpen={openSection === "strengths"}
                  onToggle={() => toggleSection("strengths")}
                >
                  <div className="space-y-2 mt-1">
                    {result.analysis.strengths.map((str, i) => (
                      <div key={i} className="border border-positive/20 bg-positive-ghost rounded-lg p-3">
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
                </Collapsible>
              )}

              {/* 1.3 Improvements */}
              {result.analysis.improvements.length > 0 && (
                <Collapsible
                  title={t.improvementsTitle}
                  isOpen={openSection === "improvements"}
                  onToggle={() => toggleSection("improvements")}
                >
                  <div className="space-y-3 mt-1">
                    {result.analysis.improvements.map((imp, i) => (
                      <div key={i} className="border border-ink-100 rounded-lg p-3 space-y-2">
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
                </Collapsible>
              )}
            </div>
          </section>

          {/* Block 2: Improved CV */}
          <section className="card-enter" style={{ animationDelay: "0.12s" }}>
            <h2 className="text-lg font-medium text-ink-900 mb-4">{t.improvedBlockTitle}</h2>

            {/* 2.1 Changes — collapsible */}
            {result.improved_cv.changes.length > 0 && (
              <div className="mb-4">
                <Collapsible
                  title={t.changesSubTitle}
                  isOpen={openSection === "changes"}
                  onToggle={() => toggleSection("changes")}
                >
                  <ul className="space-y-1 mt-1">
                    {result.improved_cv.changes.map((change, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink-500">
                        <span className="text-positive shrink-0">+</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </Collapsible>
              </div>
            )}

            {/* 2.2 Full improved CV — always visible */}
            <div className="border border-ink-100 rounded-lg p-4 sm:p-6 mb-3">
              <ResumeText text={result.improved_cv.text} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-3">
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

            {/* Resubmit note */}
            <p className="text-xs text-ink-400 leading-relaxed">{t.improvedNote}</p>
          </section>

          {/* Donation CTA */}
          <div className="text-center border border-ink-100 rounded-lg p-6 card-enter"
               style={{ animationDelay: "0.18s" }}>
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
