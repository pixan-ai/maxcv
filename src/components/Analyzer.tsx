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
    heroAccent: "Análisis profesional con IA 100% anónimo",
    heroLine1: "Descubre cómo ven tu CV los expertos y sistemas de reclutamiento (ATS)",
    heroLine2: "Mejóralo al instante sin registrarte, sin almacenar tu info y sin costo siempre.",
    placeholder: "Pega el texto de tu CV aquí o adjunta un PDF",
    attachPdf: "Adjuntar PDF",
    targetRole: "Puesto al que aspiras",
    targetRoleOptional: "(Opcional)",
    btnAnalyze: "Analizar tu CV y recomendar mejoras",
    rateLimit: "Puedes analizar y mejorar tu CV hasta 7 veces cada hora",
    privacy: "Tu CV se analiza en línea por IA de frontera y se elimina de inmediato",
    analyzing: "Analizando tu CV...",
    uploadingPdf: "Subiendo tu PDF...",
    readingPdf: "Leyendo tu PDF...",
    scoreMeta: "puntuación actual",
    originalCvTitle: "Texto original de tu CV",
    targetRoleTitle: "Puesto al que aspiras",
    analysisStepTitle: "Análisis de tu CV",
    scoreSummaryTitle: "Score y resumen del análisis",
    strengthsTitle: "Lo que ya funciona bien",
    improvementsTitle: "Oportunidades de mejora",
    improvedStepTitle: "Tu nuevo CV mejorado (texto)",
    newTextTitle: "Nuevo texto (para copiar y pegar)",
    changesSubTitle: "Mejoras que aplicamos",
    expandHint: "Expande cada sección para ver el detalle",
    noteP1: "Revísalo y realiza las correcciones que consideres necesarias en tu CV.",
    noteP2: "Si quieres, vuelve a subir el CV mejorado. Hasta 7 revisiones cada hora (ilimitadas por día).",
    noteP3: "Sí, esto es gratis para ayudar a otros.",
    noteP4: "Claude es IA y puede cometer errores. Por favor, verifica tu información antes de enviar tu CV.",
    copy: "Copiar",
    copied: "¡Copiado!",
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
    howItWorks: "¿Cómo funciona?",
  },
  en: {
    heroTitle: "Your next job starts with a great resume.",
    heroAccent: "100% anonymous professional AI analysis",
    heroLine1: "See how recruiters and applicant tracking systems (ATS) see your resume",
    heroLine2: "Improve it instantly — no sign-up, no data stored, always free.",
    placeholder: "Paste your resume text here or attach a PDF",
    attachPdf: "Attach PDF",
    targetRole: "Target role",
    targetRoleOptional: "(Optional)",
    btnAnalyze: "Analyze your resume and suggest improvements",
    rateLimit: "You can analyze and improve your resume up to 7 times per hour",
    privacy: "Your resume is analyzed online by frontier AI and deleted immediately",
    analyzing: "Analyzing your resume...",
    uploadingPdf: "Uploading your PDF...",
    readingPdf: "Reading your PDF...",
    scoreMeta: "current score",
    originalCvTitle: "Your original resume text",
    targetRoleTitle: "Target role",
    analysisStepTitle: "Analysis of your resume",
    scoreSummaryTitle: "Score and analysis summary",
    strengthsTitle: "What already works well",
    improvementsTitle: "Improvement opportunities",
    improvedStepTitle: "Your improved resume (text)",
    newTextTitle: "New text (copy and paste)",
    changesSubTitle: "Improvements we applied",
    expandHint: "Expand each section for details",
    noteP1: "Review it and make any corrections you see fit in your resume.",
    noteP2: "Want to refine further? Upload the improved resume again. Up to 7 reviews per hour (unlimited per day).",
    noteP3: "Yes, this is free to help others.",
    noteP4: "Claude is AI and can make mistakes. Please verify your information before sending your resume.",
    copy: "Copy",
    copied: "Copied!",
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
    howItWorks: "How does it work?",
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
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs
                     font-medium flex items-center justify-center">
      {n}
    </span>
  );
}

// ─── Collapsible section ───────────────────────────────────────────
function Collapsible({ title, isOpen, onToggle, children, className: wrapperClass }: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-ink-100 rounded-lg overflow-hidden ${wrapperClass ?? ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-ink-700
                   hover:bg-ink-050 transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-ink-400 text-sm transition-transform duration-200 leading-none"
              style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
          ▶
        </span>
        {title}
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "5000px" : "0" }}
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
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
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
    setOpenSections(new Set());

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
      setOpenSections(new Set(["analysis", "improved"]));

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

  const reset = () => {
    setCvText("");
    setTargetRole("");
    setResult(null);
    setError(null);
    setCopied(false);
    setOpenSections(new Set());
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
        <div className="text-sm text-ink-400 max-w-lg mx-auto leading-relaxed hero-reveal-3 text-center space-y-1">
          <p>{t.heroLine1}</p>
          <p>{t.heroLine2}</p>
        </div>
      </section>

      {/* Progress bar (above input) */}
      {(loading || parsing) && (
        <div aria-live="polite">
          <ProgressBar
            label={parsing ? t.uploadingPdf : t.analyzing}
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
          <div className="flex gap-3 items-start">
            <div className="pt-3">
              <StepBadge n={1} />
            </div>
            <div className="flex-1">
              <div className="relative border border-ink-100 rounded-lg focus-within:border-accent transition">
                {/* Attach PDF pill — top-right */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-ink-200
                               text-xs font-medium text-ink-600 hover:border-accent hover:text-accent
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
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={t.placeholder}
                  aria-label={t.placeholder}
                  aria-describedby="cv-hint"
                  className="w-full min-h-[180px] p-4 pt-12 text-sm text-ink-700 bg-transparent
                             placeholder:text-ink-300 resize-y focus:outline-none rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Target Role */}
          <div className="flex gap-3 items-center">
            <StepBadge n={2} />
            <div className="flex-1">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={`${t.targetRole} ${t.targetRoleOptional}`}
                aria-label={t.targetRole}
                maxLength={200}
                className="w-full border border-ink-100 rounded-lg px-4 py-2.5 text-sm
                           text-ink-700 placeholder:text-ink-300 focus:outline-none
                           focus:border-accent transition"
              />
            </div>
          </div>

          {/* Step 3: CTA Button */}
          <div className="flex gap-3 items-center">
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

          {/* Future sections placeholder */}
          <div className="space-y-4 mt-8 pt-8 border-t border-ink-100">
            <div className="text-center">
              <p className="text-xs text-ink-300">{t.howItWorks}</p>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ RESULTS ═══════════ */}
      {result && (
        <div ref={resultsRef} className="space-y-3" aria-live="polite">

          {/* Hint */}
          <p className="text-xs text-accent font-medium card-enter">
            {t.expandHint}
          </p>

          {/* Step 1: Original CV text — collapsed */}
          <div className="card-enter">
            <div className="flex gap-3 items-center">
              <StepBadge n={1} />
              <div className="flex-1">
                <Collapsible
                  title={t.originalCvTitle}
                  isOpen={openSections.has("original")}
                  onToggle={() => toggleSection("original")}
                >
                  <div className="text-sm text-ink-500 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {cvText}
                  </div>
                </Collapsible>
              </div>
            </div>
          </div>

          {/* Step 2: Target role — collapsed */}
          <div className="card-enter" style={{ animationDelay: "0.04s" }}>
            <div className="flex gap-3 items-center">
              <StepBadge n={2} />
              <div className="flex-1">
                <Collapsible
                  title={t.targetRoleTitle}
                  isOpen={openSections.has("role")}
                  onToggle={() => toggleSection("role")}
                >
                  <p className="text-sm text-ink-500">
                    {targetRole || (lang === "es" ? "No especificado" : "Not specified")}
                  </p>
                </Collapsible>
              </div>
            </div>
          </div>

          {/* Step 3: Analysis — expanded by default */}
          <div className="card-enter" style={{ animationDelay: "0.08s" }}>
            <div className="flex gap-3 items-center">
              <StepBadge n={3} />
              <div className="flex-1">
                <Collapsible
                  title={t.analysisStepTitle}
                  isOpen={openSections.has("analysis")}
                  onToggle={() => toggleSection("analysis")}
                >
                  <div className="space-y-4">
                    {/* Discrete score */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-ink-900">
                        {t.scoreSummaryTitle}
                      </h3>
                      <span className="font-[family-name:var(--font-mono)] text-[13px] text-ink-500 tracking-wide shrink-0 ml-4">
                        {result.score.total}/100 — {t.scoreMeta}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-ink-600 leading-relaxed">
                      {result.score.summary}
                    </p>

                    {/* Strengths — collapsed, green background */}
                    {result.analysis.strengths.length > 0 && (
                      <div className="border border-positive/20 rounded-lg overflow-hidden bg-positive-ghost">
                        <button
                          type="button"
                          onClick={() => toggleSection("strengths")}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-ink-700
                                     hover:bg-positive-ghost/80 transition cursor-pointer"
                          aria-expanded={openSections.has("strengths")}
                        >
                          <span className="text-ink-400 text-sm transition-transform duration-200 leading-none"
                                style={{ transform: openSections.has("strengths") ? "rotate(90deg)" : "rotate(0deg)" }}>
                            ▶
                          </span>
                          {t.strengthsTitle}
                        </button>
                        <div className="overflow-hidden transition-all duration-300 ease-in-out"
                             style={{ maxHeight: openSections.has("strengths") ? "5000px" : "0" }}>
                          <div className="px-4 pb-4 space-y-2">
                            {result.analysis.strengths.map((str, i) => (
                              <div key={i} className="border border-positive/20 rounded-lg p-3 bg-ink-000">
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
                        </div>
                      </div>
                    )}

                    {/* Improvement opportunities — collapsed */}
                    {result.analysis.improvements.length > 0 && (
                      <Collapsible
                        title={t.improvementsTitle}
                        isOpen={openSections.has("improvements")}
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
                </Collapsible>
              </div>
            </div>
          </div>

          {/* Step 4: Improved resume — expanded */}
          <div className="card-enter" style={{ animationDelay: "0.12s" }}>
            <div className="flex gap-3 items-center">
              <StepBadge n={4} />
              <div className="flex-1">
                <Collapsible
                  title={t.improvedStepTitle}
                  isOpen={openSections.has("improved")}
                  onToggle={() => toggleSection("improved")}
                >
                  <div className="space-y-3">
                    {/* Changes applied — collapsed */}
                    {result.improved_cv.changes.length > 0 && (
                      <Collapsible
                        title={t.changesSubTitle}
                        isOpen={openSections.has("changes")}
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
                    )}

                    {/* New text — collapsible, accent background */}
                    <div className="border border-accent/30 rounded-lg overflow-hidden bg-accent-ghost">
                      <button
                        type="button"
                        onClick={() => toggleSection("newtext")}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-accent
                                   hover:bg-accent-ghost/80 transition cursor-pointer"
                        aria-expanded={openSections.has("newtext")}
                      >
                        <span className="text-accent/60 text-sm transition-transform duration-200 leading-none"
                              style={{ transform: openSections.has("newtext") ? "rotate(90deg)" : "rotate(0deg)" }}>
                          ▶
                        </span>
                        {t.newTextTitle}
                      </button>
                      <div className="overflow-hidden transition-all duration-300 ease-in-out"
                           style={{ maxHeight: openSections.has("newtext") ? "50000px" : "0" }}>
                        <div className="px-4 pb-4">
                          <ResumeText text={result.improved_cv.text} />
                        </div>
                      </div>
                    </div>

                    {/* Copy button below text box */}
                    <div className="flex justify-start">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ink-200
                                   text-sm text-ink-600 hover:border-accent hover:text-accent
                                   transition cursor-pointer bg-ink-000"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {copied ? t.copied : t.copy}
                      </button>
                    </div>

                    {/* 4-paragraph note */}
                    <div className="space-y-2">
                      <p className="text-xs text-ink-400 leading-relaxed">{t.noteP1}</p>
                      <p className="text-xs text-ink-400 leading-relaxed">{t.noteP2}</p>
                      <p className="text-xs text-ink-400 leading-relaxed">{t.noteP3}</p>
                      <p className="text-xs text-ink-300 leading-relaxed italic">{t.noteP4}</p>
                    </div>
                  </div>
                </Collapsible>
              </div>
            </div>
          </div>

          {/* Donation CTA */}
          <div className="text-center border border-ink-100 rounded-lg p-6 card-enter"
               style={{ animationDelay: "0.18s" }}>
            <p className="text-sm text-ink-500 mb-3">{t.donationText}</p>
            <div className="flex justify-center gap-3">
              {process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK && (
                <a href={process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK}
                   target="_blank" rel="noopener noreferrer"
                   className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent-dim transition">
                  {t.donationBtn}
                </a>
              )}
              {process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK && (
                <a href={process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK}
                   target="_blank" rel="noopener noreferrer"
                   className="border border-ink-100 px-5 py-2 rounded-lg text-sm text-ink-600 hover:border-ink-200 transition">
                  PayPal
                </a>
              )}
            </div>
          </div>

          {/* Start over */}
          <div className="text-center">
            <button onClick={reset}
                    className="text-sm text-accent hover:text-accent-dim transition cursor-pointer">
              {t.tryAgain}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
