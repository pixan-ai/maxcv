"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────
interface DimensionResult {
  score: number;
  issues?: string[];
  suggestions?: string[];
  found_keywords?: string[];
  missing_keywords?: string[];
  weak_bullets_count?: number;
  strong_bullets_count?: number;
  error_count?: number;
  detected_pages?: string;
  recommended_pages?: string;
  present_sections?: string[];
  missing_sections?: string[];
  example_improvement?: { before: string; after: string };
}

interface ScoreResult {
  score_version: string;
  detected_language: string;
  inferred_role: string;
  total_score: number;
  category: string;
  summary: string;
  dimensions: {
    ats_compatibility: DimensionResult;
    achievement_impact: DimensionResult;
    structure_format: DimensionResult;
    keyword_relevance: DimensionResult;
    writing_clarity: DimensionResult;
    completeness: DimensionResult;
  };
  top_3_actions: string[];
  share_text: string;
}

// ─── Dimension Config ────────────────────────────────────
const DIMENSIONS: {
  key: keyof ScoreResult["dimensions"];
  label: string;
  labelEn: string;
}[] = [
  { key: "ats_compatibility", label: "Compatibilidad ATS", labelEn: "ATS Compatibility" },
  { key: "achievement_impact", label: "Impacto de logros", labelEn: "Achievement Impact" },
  { key: "structure_format", label: "Estructura y formato", labelEn: "Structure & Format" },
  { key: "keyword_relevance", label: "Palabras clave", labelEn: "Keywords" },
  { key: "writing_clarity", label: "Claridad de redacción", labelEn: "Writing Clarity" },
  { key: "completeness", label: "Completitud", labelEn: "Completeness" },
];

// ─── Helpers ─────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-500";
}

function scoreRing(score: number): string {
  if (score >= 80) return "stroke-emerald-500";
  if (score >= 60) return "stroke-amber-400";
  return "stroke-red-500";
}

function categoryLabel(cat: string, lang: string): string {
  const labels: Record<string, Record<string, string>> = {
    excellent: { es: "Excelente", en: "Excellent" },
    good: { es: "Bueno", en: "Good" },
    fair: { es: "Regular", en: "Fair" },
    low: { es: "Bajo", en: "Low" },
    critical: { es: "Crítico", en: "Critical" },
  };
  return labels[cat]?.[lang === "es" ? "es" : "en"] || cat;
}

// ─── Score Ring ──────────────────────────────────────────
function ScoreRing({ score, animate }: { score: number; animate: boolean }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" className="stroke-stone-200 dark:stroke-stone-700" strokeWidth="7" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          className={`${scoreRing(score)} transition-all duration-[1.5s] ease-out`}
          strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? offset : circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-semibold tabular-nums ${scoreColor(score)}`}>
          {animate ? score : 0}
        </span>
        <span className="text-xs text-stone-400 mt-0.5">de 100</span>
      </div>
    </div>
  );
}

// ─── Dimension Bar ───────────────────────────────────────
function DimensionBar({
  label, score, animate, delay, onClick, isExpanded,
}: {
  label: string; score: number; animate: boolean; delay: number; onClick: () => void; isExpanded: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-3 px-4 rounded-xl transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 ${
        isExpanded ? "bg-stone-50 dark:bg-stone-800/50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</span>
        <span className={`text-sm font-semibold tabular-nums ${scoreColor(score)}`}>{score}</span>
      </div>
      <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ease-out ${scoreBg(score)}`}
          style={{ width: animate ? `${score}%` : "0%", transitionDuration: "1.2s", transitionDelay: `${delay}ms` }}
        />
      </div>
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function ScorePage() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animateScore, setAnimateScore] = useState(false);
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => setAnimateScore(true), 100);
      return () => clearTimeout(timer);
    }
  }, [result]);

  async function handleScore() {
    if (cvText.trim().length < 100) {
      setError("Pega tu CV completo. El texto es muy corto para evaluar.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setAnimateScore(false);
    setExpandedDim(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: cvText.trim(), targetRole: targetRole.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al evaluar tu CV. Intenta de nuevo.");
        return;
      }
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const isEs = !result || result.detected_language === "es";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Max<span className="text-emerald-600">CV</span>
          </a>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Score
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero */}
        {!result && (
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
              {isEs ? "Conoce el puntaje real de tu CV" : "Get your real CV score"}
            </h1>
            <p className="mt-3 text-stone-500 dark:text-stone-400 text-base max-w-md mx-auto leading-relaxed">
              {isEs
                ? "Evaluamos tu CV en 6 dimensiones con IA avanzada. Sin registro, sin costo, sin almacenar datos."
                : "We evaluate your CV across 6 dimensions with advanced AI. No sign-up, no cost, no data stored."}
            </p>
          </div>
        )}

        {/* Input Form */}
        {!result && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm">
            <div className="mb-4">
              <label htmlFor="cv-input" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                {isEs ? "Pega tu CV aquí" : "Paste your CV here"}
              </label>
              <textarea
                id="cv-input"
                rows={10}
                placeholder={isEs
                  ? "Copia y pega el contenido de tu CV...\n\nTip: Abre tu CV en Word o PDF, selecciona todo (Ctrl+A), copia (Ctrl+C), y pega aquí (Ctrl+V)."
                  : "Copy and paste your CV content here...\n\nTip: Open your CV in Word or PDF, select all (Ctrl+A), copy (Ctrl+C), and paste here (Ctrl+V)."}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-4 text-sm leading-relaxed placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-y min-h-[200px] transition-colors"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-stone-400">
                  {cvText.length > 0 ? `${cvText.length.toLocaleString()} ${isEs ? "caracteres" : "characters"}` : ""}
                </span>
                <span className="text-xs text-stone-400">{isEs ? "Máximo ~5 páginas" : "Max ~5 pages"}</span>
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="target-role" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                {isEs ? "Puesto objetivo" : "Target role"}{" "}
                <span className="text-stone-400 font-normal">({isEs ? "opcional" : "optional"})</span>
              </label>
              <input
                id="target-role" type="text"
                placeholder={isEs
                  ? "ej. Product Manager, Ingeniero de Software, Marketing Director..."
                  : "e.g. Product Manager, Software Engineer, Marketing Director..."}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-4 py-2.5 text-sm placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleScore}
              disabled={loading || cvText.trim().length < 100}
              className="w-full py-3 px-6 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  {isEs ? "Evaluando tu CV..." : "Evaluating your CV..."}
                </span>
              ) : (
                isEs ? "Evaluar mi CV" : "Evaluate my CV"
              )}
            </button>

            <p className="text-center text-xs text-stone-400 mt-3">
              {isEs ? "Tu CV se procesa en tiempo real y no se almacena." : "Your CV is processed in real-time and not stored."}
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef}>
            {/* Score Card */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="text-center">
                  <ScoreRing score={result.total_score} animate={animateScore} />
                  <div className="mt-3">
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      result.total_score >= 75
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : result.total_score >= 60
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {categoryLabel(result.category, result.detected_language)}
                    </span>
                  </div>
                  {result.inferred_role && (
                    <p className="text-xs text-stone-400 mt-2">
                      {isEs ? "Perfil detectado:" : "Detected profile:"} {result.inferred_role}
                    </p>
                  )}
                </div>

                <div className="space-y-0.5">
                  {DIMENSIONS.map((dim, i) => (
                    <DimensionBar
                      key={dim.key}
                      label={isEs ? dim.label : dim.labelEn}
                      score={result.dimensions[dim.key].score}
                      animate={animateScore}
                      delay={i * 150}
                      onClick={() => setExpandedDim(expandedDim === dim.key ? null : dim.key)}
                      isExpanded={expandedDim === dim.key}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800">
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Expanded Dimension */}
            {expandedDim && result.dimensions[expandedDim as keyof typeof result.dimensions] && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm mb-4">
                <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3">
                  {DIMENSIONS.find((d) => d.key === expandedDim)?.[isEs ? "label" : "labelEn"]}
                </h3>

                {(result.dimensions[expandedDim as keyof typeof result.dimensions] as DimensionResult).issues &&
                  (result.dimensions[expandedDim as keyof typeof result.dimensions] as DimensionResult).issues!.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">
                        {isEs ? "Problemas detectados:" : "Issues found:"}
                      </p>
                      <ul className="space-y-1">
                        {(result.dimensions[expandedDim as keyof typeof result.dimensions] as DimensionResult).issues!.map((issue, i) => (
                          <li key={i} className="text-sm text-stone-600 dark:text-stone-400 pl-3 border-l-2 border-red-200 dark:border-red-800">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {(result.dimensions[expandedDim as keyof typeof result.dimensions] as DimensionResult).suggestions &&
                  (result.dimensions[expandedDim as keyof typeof result.dimensions] as DimensionResult).suggestions!.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1.5">
                        {isEs ? "Sugerencias:" : "Suggestions:"}
                      </p>
                      <ul className="space-y-1">
                        {(result.dimensions[expandedDim as keyof typeof result.dimensions] as DimensionResult).suggestions!.map((sug, i) => (
                          <li key={i} className="text-sm text-stone-600 dark:text-stone-400 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800">
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {expandedDim === "achievement_impact" && result.dimensions.achievement_impact.example_improvement && (
                  <div className="mt-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                    <p className="text-xs font-medium text-stone-500 mb-2">{isEs ? "Ejemplo de mejora:" : "Improvement example:"}</p>
                    <div className="space-y-2 text-sm">
                      <p className="text-red-600/80 dark:text-red-400/80 line-through">{result.dimensions.achievement_impact.example_improvement.before}</p>
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">{result.dimensions.achievement_impact.example_improvement.after}</p>
                    </div>
                  </div>
                )}

                {expandedDim === "keyword_relevance" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {result.dimensions.keyword_relevance.found_keywords?.map((kw, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{kw}</span>
                    ))}
                    {result.dimensions.keyword_relevance.missing_keywords?.map((kw, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 border-dashed">+ {kw}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Top 3 Actions */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm mb-4">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3">
                {isEs ? "Las 3 acciones que más impacto tendrán:" : "Top 3 highest-impact actions:"}
              </h3>
              <ol className="space-y-2.5">
                {result.top_3_actions.map((action, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{action}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => { setResult(null); setAnimateScore(false); setExpandedDim(null); }}
                className="py-3 px-4 rounded-xl text-sm font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all active:scale-[0.98]"
              >
                {isEs ? "Evaluar otro CV" : "Score another CV"}
              </button>
              <a href="/" className="py-3 px-4 rounded-xl text-sm font-medium text-center border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all">
                {isEs ? "Mejorar mi CV" : "Improve my CV"}
              </a>
              <button
                onClick={() => {
                  if (navigator.share) { navigator.share({ text: result.share_text }); }
                  else { navigator.clipboard.writeText(result.share_text); alert(isEs ? "Texto copiado al portapapeles" : "Copied to clipboard"); }
                }}
                className="py-3 px-4 rounded-xl text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
              >
                {isEs ? "Compartir score" : "Share score"}
              </button>
            </div>

            {/* Donation */}
            <div className="text-center bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-stone-900 rounded-2xl border border-emerald-200 dark:border-emerald-900 p-6">
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                {isEs ? "¿Te fue útil? MaxCV es gratuito y se mantiene con donaciones." : "Was this helpful? MaxCV is free and runs on donations."}
              </p>
              <div className="flex justify-center gap-2 mt-3">
                {[{ label: "$50 MXN", value: 50 }, { label: "$100 MXN", value: 100 }, { label: "$200 MXN", value: 200 }].map((opt) => (
                  <a key={opt.value} href={`#donate-${opt.value}`}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >{opt.label}</a>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-3">
                {isEs ? "100% voluntario. Sin presión. Tu score ya es tuyo." : "100% voluntary. No pressure. Your score is already yours."}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <span>MaxCV — {isEs ? "Gratis para todos, para siempre." : "Free for everyone, forever."}</span>
          <div className="flex gap-4">
            <a href="/principles" className="hover:text-stone-600 transition-colors">{isEs ? "Principios" : "Principles"}</a>
            <a href="/privacy" className="hover:text-stone-600 transition-colors">{isEs ? "Privacidad" : "Privacy"}</a>
            <a href="https://www.anthropic.com/claude" target="_blank" rel="noopener noreferrer" className="hover:text-stone-600 transition-colors">Powered by Claude</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
