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
    readingPdf: "Leyendo tu PDF...",
    scoreMeta: "puntuación actual",
    strengthsTitle: "Lo que ya funciona bien",
    strengthsSub: "Estas áreas de tu CV están sólidas",
    improvementsTitle: "Oportunidades de mejora",
    improvementsSub: "Ordenado por impacto — cada punto incluye un ejemplo de antes y después",
    improvedTitle: "Tu CV mejorado",
    improvedSub: "Aplicamos las mejoras identificadas arriba. Revísalo y realiza las correcciones que consideres necesarias en tu documento.",
    improvedNote: "Si quieres, vuélvelo a subir — puedes hacer 7 revisiones cada hora, ilimitadas por día.",
    changesTitle: "Mejoras aplicadas",
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
    targetRole: "Target role (optional)",
    uploadPdf: "or drag a PDF here",
    btnAnalyze: "Analyze my resume and suggest improvements",
    rateLimit: "7 analyses per hour · no daily limit",
    privacy: "Your resume is analyzed in real time and discarded instantly. No sign-up, no storage.",
    analyzing: "Analyzing your resume...",
    readingPdf: "Reading your PDF...",
    scoreMeta: "current score",
    strengthsTitle: "What already works well",
    strengthsSub: "These areas of your resume are solid",
    improvementsTitle: "Improvement opportunities",
    improvementsSub: "Ordered by impact — each item includes a before and after example",
    improvedTitle: "Your improved resume",
    improvedSub: "We applied the improvements identified above. Review it and make any corrections you see fit.",
    improvedNote: "Want to refine further? Upload it again — 7 reviews per hour, unlimited per day.",
    changesTitle: "Improvements applied",
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

// ─── Resume text renderer with hanging indent ──────────────────────
function ResumeText({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed text-ink-700 font-[family-name:var(--font-geist)]">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trimStart();
        if (trimmed.startsWith("•") || trimmed.startsWith("·") || trimmed.startsWith("‣")) {
          return <p key={i} className="m-0" style={{ paddingLeft: "1.5em", textIndent: "-1.5em" }}>{trimmed}</p>;
        }
        if (line.trim() === "") return <div key={i} className="h-3" />;
        const isHeader = line === line.toUpperCase() && line.trim().length > 2 && /^[A-ZÁÉÍÓÚÑÜ\s&/\-:]+$/.test(line.trim());
        if (isHeader) return <p key={i} className="m-0 font-medium text-ink-900 mt-4 mb-1">{line}</p>;
        return <p key={i} className="m-0">{line}</p>;
      })}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────
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
  const [dragOver, setDragOver] = useState(false);
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
      if (!res.ok) {
        setError(t.errorPdf);
        return;
      }
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
              disabled={loading || parsing}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {parsing ? (
                <span className="text-xs text-accent">{t.readingPdf}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-ink-400 hover:text-accent transition cursor-pointer"
                >
                  {t.uploadPdf}
                </button>
              )}
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
            disabled={loading || parsing}
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

      {/* ═══════════ RESULTS ═══════════ */}
      {result && (
        <div ref={resultsRef} className="space-y-10" aria-live="polite">

          {/* 1. Score — discrete metadata + summary left-aligned */}
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

          {/* 2. Strengths FIRST — empathy-first approach */}
          {result.analysis.strengths.length > 0 && (
            <section className="card-enter" style={{ animationDelay: "0.06s" }}>
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

          {/* 3. Improvements — unified section (top actions + detailed improvements) */}
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

          {/* 4. Improved CV — with context about what was applied */}
          <section className="card-enter" style={{ animationDelay: "0.18s" }}>
            <h2 className="text-lg font-medium text-ink-900 mb-1">{t.improvedTitle}</h2>
            <p className="text-sm text-ink-500 mb-4">{t.improvedSub}</p>

            {/* Changes applied — shown BEFORE the CV text */}
            {result.improved_cv.changes.length > 0 && (
              <div className="mb-4 border border-accent/10 bg-accent-ghost rounded-lg p-4">
                <h3 className="text-sm font-medium text-ink-700 mb-2">{t.changesTitle}</h3>
                <ul className="space-y-1">
                  {result.improved_cv.changes.map((change, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink-500">
                      <span className="text-positive shrink-0">+</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CV text with hanging indent for bullets */}
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
               style={{ animationDelay: "0.24s" }}>
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
