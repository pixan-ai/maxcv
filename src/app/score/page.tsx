"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import CVInput from "@/components/CVInput";

// -- Types -------------------------------------------------------------------

type Dimension = {
  score: number;
  criteria_checked: Record<string, { status: "pass" | "warning" | "fail"; detail: string }>;
  evidence?: string;
  issues?: string[];
  suggestions?: string[];
  found_keywords?: string[];
  missing_keywords?: string[];
  weak_bullets_count?: number;
  strong_bullets_count?: number;
  error_count?: number;
  present_sections?: string[];
  missing_sections?: string[];
  example_improvement?: { before: string; after: string };
};

type ScoreResult = {
  total_score: number;
  category: string;
  summary: string;
  detected_language: string;
  inferred_role?: string;
  dimensions: {
    ats_compatibility: Dimension;
    achievement_impact: Dimension;
    structure_format: Dimension;
    keyword_relevance: Dimension;
    writing_clarity: Dimension;
    completeness: Dimension;
  };
  top_3_actions: string[];
};

type ImprovementItem = { dimension: string; issue: string; suggestion: string; score: number };
type StrengthItem = { dimension: string; detail: string };

// -- Config ------------------------------------------------------------------

const spring = { stiffness: 300, damping: 30 };
const stagger = 0.06;

const DIM_NAMES: Record<string, { en: string; es: string }> = {
  ats_compatibility: { en: "ATS Compatibility", es: "Compatibilidad ATS" },
  achievement_impact: { en: "Achievement Impact", es: "Impacto de Logros" },
  structure_format: { en: "Structure & Format", es: "Estructura y Formato" },
  keyword_relevance: { en: "Keyword Relevance", es: "Relevancia de Palabras Clave" },
  writing_clarity: { en: "Writing Clarity", es: "Claridad de Escritura" },
  completeness: { en: "Completeness", es: "Completitud" },
};

const UI = {
  en: {
    langToggle: "Espa\u00f1ol",
    tagline: "resume score",
    scoreMeta: "current score",
    topActionsTitle: "Start here",
    topActionsSubtitle: "the 3 changes with the most impact",
    improvementsTitle: "What you can improve",
    improvementsSubtitle: "ordered by impact \u2014 start from the top",
    strengthsTitle: "What already works",
    strengthsSubtitle: "these areas are solid",
    cta: "improve these sections with ai",
    analyzeAnother: "analyze another resume",
    submitLabel: "Analyze my resume",
    loadingLabel: "Analyzing...",
    errorGeneric: "Something went wrong. Please try again.",
    errorLimit: "Limit reached (5 per hour). Try again later.",
    errorConnection: "Connection error. Check your internet and try again.",
    footer: "maxcv \u2014 free for everyone, forever",
  },
  es: {
    langToggle: "English",
    tagline: "puntuaci\u00f3n de cv",
    scoreMeta: "puntuaci\u00f3n actual",
    topActionsTitle: "Empieza aqu\u00ed",
    topActionsSubtitle: "los 3 cambios con m\u00e1s impacto",
    improvementsTitle: "Lo que puedes mejorar",
    improvementsSubtitle: "ordenado por impacto \u2014 empieza por arriba",
    strengthsTitle: "Lo que ya funciona",
    strengthsSubtitle: "estas \u00e1reas est\u00e1n bien",
    cta: "mejorar estas secciones con ia",
    analyzeAnother: "analizar otro curr\u00edculum",
    submitLabel: "Analizar mi curr\u00edculum",
    loadingLabel: "Analizando...",
    errorGeneric: "Algo sali\u00f3 mal. Int\u00e9ntalo de nuevo.",
    errorLimit: "L\u00edmite alcanzado (5 por hora). Intenta m\u00e1s tarde.",
    errorConnection: "Error de conexi\u00f3n. Revisa tu internet.",
    footer: "maxcv \u2014 gratis para todos, siempre",
  },
};

// -- Helpers -----------------------------------------------------------------

function extractImprovements(dims: ScoreResult["dimensions"]): ImprovementItem[] {
  const items: ImprovementItem[] = [];
  for (const [key, dim] of Object.entries(dims)) {
    const issues = dim.issues || [];
    const suggestions = dim.suggestions || [];
    for (let i = 0; i < issues.length; i++) {
      items.push({ dimension: key, issue: issues[i], suggestion: suggestions[i] || "", score: dim.score });
    }
  }
  items.sort((a, b) => a.score - b.score);
  return items;
}

function extractStrengths(dims: ScoreResult["dimensions"], lang: "en" | "es"): StrengthItem[] {
  const items: StrengthItem[] = [];
  for (const [key, dim] of Object.entries(dims)) {
    if (dim.score >= 70) {
      const passing = Object.entries(dim.criteria_checked || {})
        .filter(([, c]) => c.status === "pass")
        .map(([, c]) => c.detail)
        .filter(Boolean);
      if (passing.length > 0) items.push({ dimension: key, detail: passing.slice(0, 2).join(". ") });
    }
  }
  if (items.length === 0) {
    for (const [key, dim] of Object.entries(dims)) {
      if (dim.score >= 60 && dim.evidence) {
        items.push({ dimension: key, detail: `${lang === "en" ? "Scored" : "Puntuaci\u00f3n"} ${dim.score}/100 \u2014 ${dim.evidence.slice(0, 120)}` });
      }
    }
  }
  return items.slice(0, 4);
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </span>
  );
}

// -- Component ---------------------------------------------------------------

export default function ScorePage() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "es">("es");
  const resultRef = useRef<HTMLDivElement>(null);

  const t = UI[lang];
  const isEs = lang === "es";
  const dimName = (key: string) => DIM_NAMES[key]?.[lang] || key;

  async function handleScore() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: cvText.trim(), targetRole: targetRole.trim() || undefined }),
      });
      if (res.status === 429) { setError(t.errorLimit); return; }
      if (!res.ok) { const data = await res.json().catch(() => null); setError(data?.message || t.errorGeneric); return; }
      const data: ScoreResult = await res.json();
      setResult(data);
      if (data.detected_language === "es" || data.detected_language === "es-MX") setLang("es");
      if (data.detected_language === "en") setLang("en");
      setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100);
    } catch { setError(t.errorConnection); }
    finally { setLoading(false); }
  }

  const handleImproveClick = () => {
    try {
      sessionStorage.setItem("maxcv_cv", cvText);
      if (targetRole) sessionStorage.setItem("maxcv_role", targetRole);
    } catch { /* noop */ }
    window.location.href = "/";
  };

  const improvements = result ? extractImprovements(result.dimensions) : [];
  const strengths = result ? extractStrengths(result.dimensions, lang) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[--ink-000]">
      {/* Header */}
      <header className="w-full border-b border-[--ink-100]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="/score" className="font-[family-name:var(--font-mono)] text-base tracking-tight text-[--ink-900]">
            max<span className="text-[--accent]">cv</span>
          </a>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "es" : "en")} className="text-[--ink-500] hover:text-[--ink-900] transition cursor-pointer text-xs">
              {t.langToggle}
            </button>
            <span className="font-[family-name:var(--font-mono)] text-[--ink-300] tracking-wide uppercase text-xs">{t.tagline}</span>
            <span className="text-[--ink-300] font-[family-name:var(--font-mono)] text-[11px]">v2.1</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-12">
        {/* Input — uses shared CVInput component */}
        {!result && (
          <CVInput
            cvText={cvText}
            setCvText={setCvText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            onSubmit={handleScore}
            loading={loading}
            error={error}
            setError={setError}
            isEs={isEs}
            submitLabel={t.submitLabel}
            loadingLabel={t.loadingLabel}
          />
        )}

        {/* Results — Framer Motion animated */}
        {result && (
          <div ref={resultRef} className="space-y-16">
            {/* Score metadata */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="text-center">
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[--ink-500]">
                {t.scoreMeta} &middot; {result.total_score} / 100
              </p>
              <p className="text-[--ink-500] mt-4 max-w-lg mx-auto text-sm" style={{ lineHeight: "1.7" }}>
                {result.summary}
              </p>
            </motion.div>

            {/* Top 3 actions */}
            {result.top_3_actions?.length > 0 && (
              <section className="reveal">
                <h2 className="text-lg font-medium text-[--ink-900] mb-1">{t.topActionsTitle}</h2>
                <p className="text-xs text-[--ink-500] mb-5">{t.topActionsSubtitle}</p>
                <div className="space-y-3">
                  {result.top_3_actions.map((action, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: i * stagger }} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--accent] text-white flex items-center justify-center mt-0.5 text-xs font-[family-name:var(--font-mono)]">{i + 1}</span>
                      <p className="text-sm text-[--ink-900]" style={{ lineHeight: "1.6" }}>{action}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Improvements */}
            {improvements.length > 0 && (
              <section className="reveal">
                <h2 className="text-lg font-medium text-[--ink-900] mb-1">{t.improvementsTitle}</h2>
                <p className="text-xs text-[--ink-500] mb-6">{t.improvementsSubtitle}</p>
                <div className="space-y-4">
                  {improvements.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: (3 + i) * stagger }} className="border-l-2 border-[--ink-100] pl-4 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[--ink-900]">{dimName(item.dimension)}</span>
                        <span className={`font-[family-name:var(--font-mono)] tracking-wide uppercase text-[11px] ${item.score < 50 ? "text-[--accent]" : "text-[--ink-500]"}`}>
                          {item.score < 50 ? (isEs ? "alto impacto" : "high impact") : (isEs ? "impacto medio" : "medium impact")}
                        </span>
                      </div>
                      <p className="text-sm text-[--ink-500]" style={{ lineHeight: "1.6" }}>{item.issue}</p>
                      {item.suggestion && <p className="text-xs text-[--ink-300] mt-1" style={{ lineHeight: "1.5" }}>{item.suggestion}</p>}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <section className="reveal">
                <h2 className="text-lg font-medium text-[--ink-900] mb-1">{t.strengthsTitle}</h2>
                <p className="text-xs text-[--ink-500] mb-5">{t.strengthsSubtitle}</p>
                <div className="space-y-3">
                  {strengths.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: (3 + improvements.length + i) * stagger }} className="border-l-2 border-[--positive] pl-4 py-1">
                      <span className="text-sm font-medium text-[--ink-900]">{dimName(item.dimension)}</span>
                      <p className="text-sm text-[--ink-500] mt-0.5" style={{ lineHeight: "1.6" }}>{item.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: (3 + improvements.length + strengths.length) * stagger }} className="reveal text-center">
              <button onClick={handleImproveClick} className="bg-[--accent] text-white font-medium py-3 px-8 rounded-lg hover:bg-[--accent-dim] transition cursor-pointer tracking-wide font-[family-name:var(--font-mono)] text-sm">
                {t.cta}
              </button>
            </motion.div>

            {/* Analyze another */}
            <div className="text-center">
              <button onClick={() => { setResult(null); setCvText(""); setTargetRole(""); setError(null); }} className="text-[--ink-500] hover:text-[--ink-900] transition cursor-pointer text-xs">
                {t.analyzeAnother}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[--ink-100]">
        <div className="max-w-2xl mx-auto px-5 py-6 text-center">
          <span className="text-[--ink-500] text-xs font-[family-name:var(--font-mono)]">{t.footer}</span>
        </div>
      </footer>
    </div>
  );
}
