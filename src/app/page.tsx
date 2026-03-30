"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationBanner from "@/components/DonationBanner";
import AboutUs from "@/components/AboutUs";
import CVInput from "@/components/CVInput";
import ProgressBar from "@/components/ProgressBar";

// --- Types ---

type ImproveResult = { improved: string; tips: string[]; language: string };

type Dimension = {
  score: number;
  criteria_checked: Record<string, { status: "pass" | "warning" | "fail"; detail: string }>;
  evidence?: string; issues?: string[]; suggestions?: string[];
  found_keywords?: string[]; missing_keywords?: string[];
  weak_bullets_count?: number; strong_bullets_count?: number;
  error_count?: number; present_sections?: string[]; missing_sections?: string[];
  example_improvement?: { before: string; after: string };
};

type ScoreResult = {
  total_score: number; category: string; summary: string;
  detected_language: string; inferred_role?: string;
  dimensions: {
    ats_compatibility: Dimension; achievement_impact: Dimension;
    structure_format: Dimension; keyword_relevance: Dimension;
    writing_clarity: Dimension; completeness: Dimension;
  };
  top_3_actions: string[];
};

type ActiveFlow = null | "score" | "improve";

// --- UI strings ---

const DIM_NAMES: Record<string, { en: string; es: string }> = {
  ats_compatibility: { en: "ATS Compatibility", es: "Compatibilidad ATS" },
  achievement_impact: { en: "Achievement Impact", es: "Impacto de Logros" },
  structure_format: { en: "Structure & Format", es: "Estructura y Formato" },
  keyword_relevance: { en: "Keyword Relevance", es: "Palabras Clave" },
  writing_clarity: { en: "Writing Clarity", es: "Claridad de Escritura" },
  completeness: { en: "Completeness", es: "Completitud" },
};

const UI = {
  en: {
    heroTitle: "Your next job starts with a great resume.",
    heroAccent: "Professional AI analysis. Free.",
    heroSub: "See what recruiters see in your resume and improve it instantly. No sign-up, no tricks.",
    btnScore: "Analyze my resume",
    btnScoreSub: "Score + recommendations",
    btnImprove: "Rewrite it for me",
    btnImproveSub: "Improved resume ready to send",
    rateLimit: "5 analyses per hour · no daily usage limit",
    privacy: "Your resume is analyzed in real time and discarded instantly. No sign-up, no storage.",
    scoreMeta: "current score",
    topActionsTitle: "Start here",
    topActionsSub: "The 3 changes with the most impact",
    improvementsTitle: "What you can improve",
    improvementsSub: "Ordered by impact — start from the top",
    strengthsTitle: "What already works",
    strengthsSub: "These areas are solid",
    ctaPostScore: "Want me to rewrite it for you?",
    ctaPostImprove: "Want to see your improved resume's score?",
    resultTitle: "Your improved resume",
    copy: "Copy", copied: "Copied!",
    downloadWord: "Download for Word",
    tipsTitle: "Actionable tips",
    errorGeneric: "Something went wrong. Please try again.",
    errorLimit: "Limit reached (5/hour). Try again later.",
    errorConnection: "Connection error. Check your internet.",
    errorLength: "Please paste at least 50 characters.",
    tryAgain: "Start over",
  },
  es: {
    heroTitle: "Tu próximo trabajo empieza con un gran CV.",
    heroAccent: "Análisis profesional con IA. Gratis.",
    heroSub: "Descubre qué ven los reclutadores en tu CV y mejóralo al instante. Sin registro, sin trucos.",
    btnScore: "Analiza mi CV",
    btnScoreSub: "Score + recomendaciones",
    btnImprove: "Reescríbelo por mí",
    btnImproveSub: "CV mejorado listo para enviar",
    rateLimit: "5 análisis por hora · sin límite de uso diario",
    privacy: "Tu CV se analiza en tiempo real y se descarta al instante. Sin registro, sin almacenamiento.",
    scoreMeta: "puntuación actual",
    topActionsTitle: "Empieza aquí",
    topActionsSub: "Los 3 cambios con más impacto",
    improvementsTitle: "Lo que puedes mejorar",
    improvementsSub: "Ordenado por impacto — empieza por arriba",
    strengthsTitle: "Lo que ya funciona",
    strengthsSub: "Estas áreas están bien",
    ctaPostScore: "¿Quieres que lo reescriba por ti?",
    ctaPostImprove: "¿Quieres ver el score de tu CV mejorado?",
    resultTitle: "Tu currículum mejorado",
    copy: "Copiar", copied: "¡Copiado!",
    downloadWord: "Descargar para Word",
    tipsTitle: "Consejos accionables",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorLimit: "Límite alcanzado (5/hora). Intenta más tarde.",
    errorConnection: "Error de conexión. Revisa tu internet.",
    errorLength: "Pega al menos 50 caracteres.",
    tryAgain: "Empezar de nuevo",
  },
};

// --- Helpers ---

type ImprovementItem = { dimension: string; issue: string; suggestion: string; score: number };
type StrengthItem = { dimension: string; detail: string };

function extractImprovements(dims: ScoreResult["dimensions"]): ImprovementItem[] {
  const items: ImprovementItem[] = [];
  for (const [key, dim] of Object.entries(dims)) {
    for (let i = 0; i < (dim.issues?.length || 0); i++)
      items.push({ dimension: key, issue: dim.issues![i], suggestion: dim.suggestions?.[i] || "", score: dim.score });
  }
  return items.sort((a, b) => a.score - b.score);
}

function extractStrengths(dims: ScoreResult["dimensions"], lang: "en" | "es"): StrengthItem[] {
  const items: StrengthItem[] = [];
  for (const [key, dim] of Object.entries(dims)) {
    if (dim.score >= 70) {
      const passing = Object.entries(dim.criteria_checked || {}).filter(([, c]) => c.status === "pass").map(([, c]) => c.detail).filter(Boolean);
      if (passing.length > 0) items.push({ dimension: key, detail: passing.slice(0, 2).join(". ") });
    }
  }
  if (items.length === 0) {
    for (const [key, dim] of Object.entries(dims)) {
      if (dim.score >= 60 && dim.evidence)
        items.push({ dimension: key, detail: `${lang === "en" ? "Scored" : "Puntuación"} ${dim.score}/100 — ${dim.evidence.slice(0, 120)}` });
    }
  }
  return items.slice(0, 4);
}

function downloadWordTxt(text: string, filename: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/** Renders resume text with proper hanging indent on bullet lines */
function ResumeText({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed text-ink-900 p-5 sm:p-6 font-[family-name:var(--font-geist)]">
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

// --- Score count-up hook ---

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// --- Main component ---

export default function Home() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [improveResult, setImproveResult] = useState<ImproveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("es");
  const [progressComplete, setProgressComplete] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const t = UI[lang];
  const dimName = (key: string) => DIM_NAMES[key]?.[lang] || key;

  const hasResult = scoreResult || improveResult;
  const isReady = cvText.trim().length >= 50;

  const animatedScore = useCountUp(scoreResult?.total_score || 0);

  // --- Handlers ---

  async function handleScore() {
    if (!isReady) { setError(t.errorLength); return; }
    setLoading(true); setError(null); setScoreResult(null); setImproveResult(null);
    setActiveFlow("score"); setProgressComplete(false);
    try {
      const res = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvText: cvText.trim(), targetRole: targetRole.trim() || undefined }) });
      setProgressComplete(true);
      if (res.status === 429) { setError(t.errorLimit); setActiveFlow(null); return; }
      if (!res.ok) { const d = await res.json().catch(() => null); setError(d?.message || t.errorGeneric); setActiveFlow(null); return; }
      const data: ScoreResult = await res.json();
      setScoreResult(data);
      if (data.detected_language === "es" || data.detected_language === "es-MX") setLang("es");
      if (data.detected_language === "en") setLang("en");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch { setError(t.errorConnection); setActiveFlow(null); }
    finally { setLoading(false); }
  }

  async function handleImprove() {
    if (!isReady) { setError(t.errorLength); return; }
    setLoading(true); setError(null); setScoreResult(null); setImproveResult(null);
    setActiveFlow("improve"); setProgressComplete(false);
    try {
      const res = await fetch("/api/improve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvText, targetRole }) });
      setProgressComplete(true);
      if (res.status === 429) { setError(t.errorLimit); setActiveFlow(null); return; }
      if (!res.ok) { setError(t.errorGeneric); setActiveFlow(null); return; }
      const data = await res.json();
      setImproveResult(data);
      if (data.language === "es" && lang !== "es") setLang("es");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch { setError(t.errorConnection); setActiveFlow(null); }
    finally { setLoading(false); }
  }

  function handleReset() {
    setScoreResult(null); setImproveResult(null); setActiveFlow(null);
    setCvText(""); setTargetRole(""); setError(null); setProgressComplete(false);
  }

  const improvements = scoreResult ? extractImprovements(scoreResult.dimensions) : [];
  const strengths = scoreResult ? extractStrengths(scoreResult.dimensions, lang) : [];

  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        {/* Hero */}
        <section className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-3 text-ink-900">
            <span className="hero-reveal-1 inline-block">{t.heroTitle}</span>
          </h1>
          <p className="hero-reveal-2 text-accent text-lg sm:text-xl font-medium mb-3">{t.heroAccent}</p>
          <p className="hero-reveal-3 text-ink-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">{t.heroSub}</p>
        </section>

        {/* Input + CTAs */}
        {!hasResult && !loading && (
          <div className="hero-reveal-3">
            <CVInput
              cvText={cvText} setCvText={setCvText}
              targetRole={targetRole} setTargetRole={setTargetRole}
              onSubmit={() => {}} loading={false}
              error={error} setError={setError}
              isEs={lang === "es"} submitLabel="" loadingLabel=""
              hideSubmit
            />

            {/* Dual CTA buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button type="button" onClick={handleScore} disabled={!isReady}
                className={`flex flex-col items-center gap-1 py-3.5 px-4 rounded-xl text-sm font-medium transition-colors ${isReady ? "bg-ink-900 text-white hover:bg-ink-700 cursor-pointer" : "bg-ink-100 text-ink-300 cursor-not-allowed"}`}>
                {t.btnScore}
                <span className="text-[11px] font-normal opacity-70">{t.btnScoreSub}</span>
              </button>
              <button type="button" onClick={handleImprove} disabled={!isReady}
                className={`flex flex-col items-center gap-1 py-3.5 px-4 rounded-xl text-sm font-medium transition-colors ${isReady ? "bg-accent text-white hover:bg-accent-dim cursor-pointer" : "bg-ink-100 text-ink-300 cursor-not-allowed"}`}>
                {t.btnImprove}
                <span className="text-[11px] font-normal opacity-70">{t.btnImproveSub}</span>
              </button>
            </div>

            {/* Rate limit + privacy */}
            <p className="text-center text-xs text-ink-300 mt-3">{t.rateLimit}</p>
            <p className="text-center text-xs text-ink-300 mt-2 flex items-center justify-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              {t.privacy}
            </p>
          </div>
        )}

        {/* Progress bar during loading */}
        {loading && <ProgressBar isActive={loading} isComplete={progressComplete} isEs={lang === "es"} />}

        {/* Error */}
        {error && !hasResult && !loading && (
          <div className="bg-warning-ghost border border-warning/20 text-ink-700 text-sm px-4 py-3 rounded-xl mt-4">{error}</div>
        )}

        {/* ============ SCORE RESULTS ============ */}
        {scoreResult && (
          <div ref={resultRef} className="space-y-10">
            <div className="bg-white border border-ink-100 rounded-xl overflow-hidden card-enter">
              <div className="flex items-center gap-4 px-5 py-4 border-b border-ink-100 bg-ink-050">
                <div className="w-12 h-12 rounded-xl bg-accent-ghost flex items-center justify-center">
                  <span className="text-lg font-medium text-accent font-[family-name:var(--font-mono)] tabular-nums">{animatedScore}</span>
                </div>
                <div>
                  <p className="text-xs text-ink-400 font-[family-name:var(--font-mono)] uppercase tracking-wider">{t.scoreMeta}</p>
                  <p className="text-sm font-medium text-ink-900">{scoreResult.total_score} / 100<span className="ml-2 text-xs text-ink-400 font-normal capitalize">{scoreResult.category}</span></p>
                </div>
              </div>
              <p className="text-sm text-ink-500 leading-relaxed px-5 py-4">{scoreResult.summary}</p>
            </div>

            {scoreResult.top_3_actions?.length > 0 && (
              <section>
                <h2 className="text-base font-medium text-ink-900 mb-1">{t.topActionsTitle}</h2>
                <p className="text-xs text-ink-400 mb-5">{t.topActionsSub}</p>
                <div className="space-y-3">
                  {scoreResult.top_3_actions.map((action, i) => (
                    <div key={i} className="card-enter flex gap-3.5 items-start bg-accent-ghost border border-accent/10 rounded-xl px-4 py-3.5"
                      style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-[family-name:var(--font-mono)]">{i + 1}</span>
                      <p className="text-sm text-ink-700 leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {improvements.length > 0 && (
              <section className="reveal">
                <h2 className="text-base font-medium text-ink-900 mb-1">{t.improvementsTitle}</h2>
                <p className="text-xs text-ink-400 mb-5">{t.improvementsSub}</p>
                <div className="space-y-3">
                  {improvements.map((item, i) => (
                    <div key={i} className="card-enter bg-white border border-ink-100 rounded-xl px-4 py-3.5"
                      style={{ animationDelay: `${(i + 4) * 80}ms` }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-medium text-ink-900">{dimName(item.dimension)}</span>
                        <span className={`font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${item.score < 50 ? "bg-accent-ghost text-accent" : "bg-ink-050 text-ink-400"}`}>
                          {item.score < 50 ? (lang === "es" ? "alto impacto" : "high impact") : (lang === "es" ? "impacto medio" : "medium")}
                        </span>
                      </div>
                      <p className="text-sm text-ink-500 leading-relaxed">{item.issue}</p>
                      {item.suggestion && <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">{item.suggestion}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {strengths.length > 0 && (
              <section className="reveal">
                <h2 className="text-base font-medium text-ink-900 mb-1">{t.strengthsTitle}</h2>
                <p className="text-xs text-ink-400 mb-5">{t.strengthsSub}</p>
                <div className="space-y-3">
                  {strengths.map((item, i) => (
                    <div key={i} className="card-enter bg-positive-ghost border border-positive/15 rounded-xl px-4 py-3.5"
                      style={{ animationDelay: `${(i + 4 + improvements.length) * 80}ms` }}>
                      <span className="text-sm font-medium text-ink-900">{dimName(item.dimension)}</span>
                      <p className="text-sm text-ink-500 mt-0.5 leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-col items-center gap-3 pt-4">
              <p className="text-sm text-ink-500">{t.ctaPostScore}</p>
              <button onClick={handleImprove}
                className="soft-pulse bg-accent text-white font-medium py-3.5 px-8 rounded-xl hover:bg-accent-dim transition-colors cursor-pointer text-sm">
                {t.btnImprove}
              </button>
              <button onClick={handleReset}
                className="text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer">{t.tryAgain}</button>
            </div>

            <DonationBanner lang={lang} />
          </div>
        )}

        {/* ============ IMPROVE RESULTS ============ */}
        {improveResult && (
          <div ref={resultRef} className="space-y-6">
            <div className="bg-white border border-ink-100 rounded-xl overflow-hidden card-enter">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-100 bg-ink-050">
                <h2 className="text-sm font-medium text-ink-900">{t.resultTitle}</h2>
                <div className="flex gap-3">
                  <button onClick={async () => { await navigator.clipboard.writeText(improveResult.improved); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="text-xs text-accent hover:text-accent-dim font-medium transition cursor-pointer">{copied ? t.copied : t.copy}</button>
                  <button onClick={() => downloadWordTxt(improveResult.improved, "maxcv-resume.txt")}
                    className="text-xs text-ink-400 hover:text-ink-700 font-medium transition cursor-pointer">{t.downloadWord}</button>
                </div>
              </div>
              <ResumeText text={improveResult.improved} />
            </div>

            {improveResult.tips.length > 0 && (
              <div className="card-enter bg-accent-ghost border border-accent/10 rounded-xl p-5 sm:p-6" style={{ animationDelay: "120ms" }}>
                <h3 className="text-sm font-medium text-ink-900 mb-3">{t.tipsTitle}</h3>
                <ul className="space-y-2.5">
                  {improveResult.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-ink-500 flex gap-2.5 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col items-center gap-3 pt-4">
              <p className="text-sm text-ink-500">{t.ctaPostImprove}</p>
              <button onClick={() => { setCvText(improveResult.improved); setImproveResult(null); handleScore(); }}
                className="soft-pulse bg-ink-900 text-white font-medium py-3.5 px-8 rounded-xl hover:bg-ink-700 transition-colors cursor-pointer text-sm">
                {t.btnScore}
              </button>
              <button onClick={handleReset}
                className="text-xs text-ink-400 hover:text-ink-700 transition cursor-pointer">{t.tryAgain}</button>
            </div>

            <DonationBanner lang={lang} />
          </div>
        )}

        <AboutUs lang={lang} />
      </main>

      <Footer lang={lang} />
    </div>
  );
}
