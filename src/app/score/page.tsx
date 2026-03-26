"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CVInput from "@/components/CVInput";

type Dimension = { score: number; criteria_checked: Record<string, { status: "pass" | "warning" | "fail"; detail: string }>; evidence?: string; issues?: string[]; suggestions?: string[]; found_keywords?: string[]; missing_keywords?: string[]; weak_bullets_count?: number; strong_bullets_count?: number; error_count?: number; present_sections?: string[]; missing_sections?: string[]; example_improvement?: { before: string; after: string } };
type ScoreResult = { total_score: number; category: string; summary: string; detected_language: string; inferred_role?: string; dimensions: { ats_compatibility: Dimension; achievement_impact: Dimension; structure_format: Dimension; keyword_relevance: Dimension; writing_clarity: Dimension; completeness: Dimension }; top_3_actions: string[] };
type ImprovementItem = { dimension: string; issue: string; suggestion: string; score: number };
type StrengthItem = { dimension: string; detail: string };

const spring = { stiffness: 300, damping: 30 };
const stagger = 0.06;

const DIM_NAMES: Record<string, { en: string; es: string }> = {
  ats_compatibility: { en: "ATS Compatibility", es: "Compatibilidad ATS" },
  achievement_impact: { en: "Achievement Impact", es: "Impacto de Logros" },
  structure_format: { en: "Structure & Format", es: "Estructura y Formato" },
  keyword_relevance: { en: "Keyword Relevance", es: "Palabras Clave" },
  writing_clarity: { en: "Writing Clarity", es: "Claridad de Escritura" },
  completeness: { en: "Completeness", es: "Completitud" },
};

const UI = {
  en: { badge: "AI resume analysis", heroTitle: "Know your resume's", heroHighlight: "real score", heroSub: "Get a detailed breakdown of what works, what doesn't, and exactly how to fix it.", submitLabel: "Analyze my resume", loadingLabel: "Analyzing...", scoreMeta: "current score", topActionsTitle: "Start here", topActionsSubtitle: "The 3 changes with the most impact", improvementsTitle: "What you can improve", improvementsSubtitle: "Ordered by impact \u2014 start from the top", strengthsTitle: "What already works", strengthsSubtitle: "These areas are solid", cta: "Improve these sections with AI", analyzeAnother: "Analyze another resume", errorGeneric: "Something went wrong. Please try again.", errorLimit: "Limit reached (5/hour). Try again later.", errorConnection: "Connection error. Check your internet." },
  es: { badge: "An\u00e1lisis de CV con IA", heroTitle: "Conoce el score real", heroHighlight: "de tu CV", heroSub: "Obt\u00e9n un desglose detallado de lo que funciona, lo que no, y c\u00f3mo corregirlo.", submitLabel: "Analizar mi curr\u00edculum", loadingLabel: "Analizando...", scoreMeta: "puntuaci\u00f3n actual", topActionsTitle: "Empieza aqu\u00ed", topActionsSubtitle: "Los 3 cambios con m\u00e1s impacto", improvementsTitle: "Lo que puedes mejorar", improvementsSubtitle: "Ordenado por impacto \u2014 empieza por arriba", strengthsTitle: "Lo que ya funciona", strengthsSubtitle: "Estas \u00e1reas est\u00e1n bien", cta: "Mejorar estas secciones con IA", analyzeAnother: "Analizar otro curr\u00edculum", errorGeneric: "Algo sali\u00f3 mal. Int\u00e9ntalo de nuevo.", errorLimit: "L\u00edmite alcanzado (5/hora). Intenta m\u00e1s tarde.", errorConnection: "Error de conexi\u00f3n. Revisa tu internet." },
};

function extractImprovements(dims: ScoreResult["dimensions"]): ImprovementItem[] {
  const items: ImprovementItem[] = [];
  for (const [key, dim] of Object.entries(dims)) {
    for (let i = 0; i < (dim.issues?.length || 0); i++) items.push({ dimension: key, issue: dim.issues![i], suggestion: dim.suggestions?.[i] || "", score: dim.score });
  }
  return items.sort((a, b) => a.score - b.score);
}

function extractStrengths(dims: ScoreResult["dimensions"], lang: "en" | "es"): StrengthItem[] {
  const items: StrengthItem[] = [];
  for (const [key, dim] of Object.entries(dims)) {
    if (dim.score >= 70) { const passing = Object.entries(dim.criteria_checked || {}).filter(([, c]) => c.status === "pass").map(([, c]) => c.detail).filter(Boolean); if (passing.length > 0) items.push({ dimension: key, detail: passing.slice(0, 2).join(". ") }); }
  }
  if (items.length === 0) { for (const [key, dim] of Object.entries(dims)) { if (dim.score >= 60 && dim.evidence) items.push({ dimension: key, detail: `${lang === "en" ? "Scored" : "Puntuaci\u00f3n"} ${dim.score}/100 \u2014 ${dim.evidence.slice(0, 120)}` }); } }
  return items.slice(0, 4);
}

export default function ScorePage() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "es">("es");
  const resultRef = useRef<HTMLDivElement>(null);
  const t = UI[lang];
  const dimName = (key: string) => DIM_NAMES[key]?.[lang] || key;

  async function handleScore() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvText: cvText.trim(), targetRole: targetRole.trim() || undefined }) });
      if (res.status === 429) { setError(t.errorLimit); return; }
      if (!res.ok) { const d = await res.json().catch(() => null); setError(d?.message || t.errorGeneric); return; }
      const data: ScoreResult = await res.json();
      setResult(data);
      if (data.detected_language === "es" || data.detected_language === "es-MX") setLang("es");
      if (data.detected_language === "en") setLang("en");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError(t.errorConnection); }
    finally { setLoading(false); }
  }

  const improvements = result ? extractImprovements(result.dimensions) : [];
  const strengths = result ? extractStrengths(result.dimensions, lang) : [];

  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} active="score" />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        {!result && (
          <>
            <section className="text-center mb-6">
              <div className="hero-reveal inline-flex items-center gap-1.5 bg-accent-ghost text-accent text-xs font-medium px-3 py-1 rounded-full mb-4">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                {t.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-3 text-ink-900">
                <span className="hero-reveal-1 inline-block">{t.heroTitle}</span><br />
                <span className="hero-reveal-2 inline-block text-accent">{t.heroHighlight}</span>
              </h1>
              <p className="hero-reveal-3 text-ink-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">{t.heroSub}</p>
            </section>
            <CVInput cvText={cvText} setCvText={setCvText} targetRole={targetRole} setTargetRole={setTargetRole} onSubmit={handleScore} loading={loading} error={error} setError={setError} isEs={lang === "es"} submitLabel={t.submitLabel} loadingLabel={t.loadingLabel} />
          </>
        )}

        {result && (
          <div ref={resultRef} className="space-y-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white border border-ink-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 border-b border-ink-100 bg-ink-050">
                <div className="w-12 h-12 rounded-xl bg-accent-ghost flex items-center justify-center">
                  <span className="text-lg font-medium text-accent font-[family-name:var(--font-mono)]">{result.total_score}</span>
                </div>
                <div>
                  <p className="text-xs text-ink-400 font-[family-name:var(--font-mono)] uppercase tracking-wider">{t.scoreMeta}</p>
                  <p className="text-sm font-medium text-ink-900">{result.total_score} / 100<span className="ml-2 text-xs text-ink-400 font-normal capitalize">{result.category}</span></p>
                </div>
              </div>
              <p className="text-sm text-ink-500 leading-relaxed px-5 py-4">{result.summary}</p>
            </motion.div>

            {result.top_3_actions?.length > 0 && (
              <section>
                <h2 className="text-base font-medium text-ink-900 mb-1">{t.topActionsTitle}</h2>
                <p className="text-xs text-ink-400 mb-5">{t.topActionsSubtitle}</p>
                <div className="space-y-3">
                  {result.top_3_actions.map((action, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: i * stagger }}
                      className="flex gap-3.5 items-start bg-accent-ghost border border-accent/10 rounded-xl px-4 py-3.5">
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-[family-name:var(--font-mono)]">{i + 1}</span>
                      <p className="text-sm text-ink-700 leading-relaxed">{action}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {improvements.length > 0 && (
              <section className="reveal">
                <h2 className="text-base font-medium text-ink-900 mb-1">{t.improvementsTitle}</h2>
                <p className="text-xs text-ink-400 mb-5">{t.improvementsSubtitle}</p>
                <div className="space-y-3">
                  {improvements.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: (3 + i) * stagger }}
                      className="bg-white border border-ink-100 rounded-xl px-4 py-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-medium text-ink-900">{dimName(item.dimension)}</span>
                        <span className={`font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${item.score < 50 ? "bg-accent-ghost text-accent" : "bg-ink-050 text-ink-400"}`}>
                          {item.score < 50 ? (lang === "es" ? "alto impacto" : "high impact") : (lang === "es" ? "impacto medio" : "medium")}
                        </span>
                      </div>
                      <p className="text-sm text-ink-500 leading-relaxed">{item.issue}</p>
                      {item.suggestion && <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">{item.suggestion}</p>}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {strengths.length > 0 && (
              <section className="reveal">
                <h2 className="text-base font-medium text-ink-900 mb-1">{t.strengthsTitle}</h2>
                <p className="text-xs text-ink-400 mb-5">{t.strengthsSubtitle}</p>
                <div className="space-y-3">
                  {strengths.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: (3 + improvements.length + i) * stagger }}
                      className="bg-positive-ghost border border-positive/15 rounded-xl px-4 py-3.5">
                      <span className="text-sm font-medium text-ink-900">{dimName(item.dimension)}</span>
                      <p className="text-sm text-ink-500 mt-0.5 leading-relaxed">{item.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: (3 + improvements.length + strengths.length) * stagger }}
              className="flex flex-col items-center gap-3 pt-4">
              <button onClick={() => { try { sessionStorage.setItem("maxcv_cv", cvText); if (targetRole) sessionStorage.setItem("maxcv_role", targetRole); } catch {} window.location.href = "/"; }}
                className="bg-accent text-white font-medium py-3.5 px-8 rounded-xl hover:bg-accent-dim transition-colors cursor-pointer text-sm">{t.cta}</button>
              <button onClick={() => { setResult(null); setCvText(""); setTargetRole(""); setError(null); }}
                className="text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer">{t.analyzeAnother}</button>
            </motion.div>
          </div>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
