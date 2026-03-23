"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";

// -- Types -------------------------------------------------------------------

type CriterionStatus = {
  status: "pass" | "warning" | "fail";
  detail: string;
};

type Dimension = {
  score: number;
  criteria_checked: Record<string, CriterionStatus>;
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

type InputMode = "text" | "file" | "sheets";

type ImprovementItem = {
  dimension: string;
  issue: string;
  suggestion: string;
  score: number;
};

type StrengthItem = {
  dimension: string;
  detail: string;
};

// -- Spring config -----------------------------------------------------------

const spring = { stiffness: 300, damping: 30 };
const stagger = 0.06;

// -- Dimension names ---------------------------------------------------------

const DIMENSION_NAMES: Record<string, { en: string; es: string }> = {
  ats_compatibility: { en: "ATS Compatibility", es: "Compatibilidad ATS" },
  achievement_impact: { en: "Achievement Impact", es: "Impacto de Logros" },
  structure_format: { en: "Structure & Format", es: "Estructura y Formato" },
  keyword_relevance: { en: "Keyword Relevance", es: "Relevancia de Palabras Clave" },
  writing_clarity: { en: "Writing Clarity", es: "Claridad de Escritura" },
  completeness: { en: "Completeness", es: "Completitud" },
};

// -- Extract data from dimensions --------------------------------------------

function extractImprovements(dimensions: ScoreResult["dimensions"]): ImprovementItem[] {
  const items: ImprovementItem[] = [];
  for (const [key, dim] of Object.entries(dimensions)) {
    const issues = dim.issues || [];
    const suggestions = dim.suggestions || [];
    for (let i = 0; i < issues.length; i++) {
      items.push({
        dimension: key,
        issue: issues[i],
        suggestion: suggestions[i] || "",
        score: dim.score,
      });
    }
  }
  items.sort((a, b) => a.score - b.score);
  return items;
}

function extractStrengths(dimensions: ScoreResult["dimensions"], lang: "en" | "es"): StrengthItem[] {
  const items: StrengthItem[] = [];
  for (const [key, dim] of Object.entries(dimensions)) {
    if (dim.score >= 70) {
      const passing = Object.entries(dim.criteria_checked || {})
        .filter(([, c]) => c.status === "pass")
        .map(([, c]) => c.detail)
        .filter(Boolean);
      if (passing.length > 0) {
        items.push({ dimension: key, detail: passing.slice(0, 2).join(". ") });
      }
    }
  }
  if (items.length === 0) {
    for (const [key, dim] of Object.entries(dimensions)) {
      if (dim.score >= 60 && dim.evidence) {
        items.push({
          dimension: key,
          detail: lang === "en"
            ? `Scored ${dim.score}/100 — ${dim.evidence.slice(0, 120)}`
            : `Puntuación ${dim.score}/100 — ${dim.evidence.slice(0, 120)}`,
        });
      }
    }
  }
  return items.slice(0, 4);
}

// -- Bilingual copy ----------------------------------------------------------

const UI = {
  en: {
    logo: "maxcv",
    langToggle: "Español",
    tagline: "resume score",
    tabText: "Paste text",
    tabFile: "Upload file",
    tabSheets: "Google Sheets",
    labelCv: "Your current resume",
    placeholderCv: "Paste your resume text here...",
    labelRole: "Target role or industry",
    optional: "(optional)",
    placeholderRole: "e.g. Senior Frontend Developer, Marketing Manager...",
    button: "Analyze my resume",
    loading: "Analyzing...",
    uploadLabel: "Upload your resume",
    uploadHint: "PDF or plain text — max 5MB",
    uploadButton: "Choose file",
    uploadDrop: "or drag and drop here",
    sheetsLabel: "Google Sheets link",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "Make sure the sheet is shared publicly",
    sheetsButton: "Import from Google Sheets",
    parsing: "Reading your file...",
    scoreMeta: "current score",
    improvementsTitle: "What you can improve",
    improvementsSubtitle: "ordered by impact — start from the top",
    strengthsTitle: "What already works",
    strengthsSubtitle: "these areas are solid",
    topActionsTitle: "Start here",
    topActionsSubtitle: "the 3 changes with the most impact",
    cta: "improve these sections with ai",
    analyzeAnother: "analyze another resume",
    errorGeneric: "Something went wrong. Please try again.",
    errorLimit: "Limit reached (5 per hour). Try again later.",
    errorConnection: "Connection error. Check your internet and try again.",
    errorLength: "Please paste at least 50 characters of resume text.",
    parseError: "Could not read the file. Try pasting your resume instead.",
    sheetsError: "Could not access Google Sheet.",
    footer: "maxcv — free for everyone, forever",
  },
  es: {
    logo: "maxcv",
    langToggle: "English",
    tagline: "puntuación de cv",
    tabText: "Pegar texto",
    tabFile: "Subir archivo",
    tabSheets: "Google Sheets",
    labelCv: "Tu currículum actual",
    placeholderCv: "Pega el texto de tu currículum aquí...",
    labelRole: "Puesto o industria objetivo",
    optional: "(opcional)",
    placeholderRole: "ej. Gerente de Ventas, Desarrollador Frontend Senior...",
    button: "Analizar mi currículum",
    loading: "Analizando...",
    uploadLabel: "Sube tu currículum",
    uploadHint: "PDF o texto plano — máx 5MB",
    uploadButton: "Elegir archivo",
    uploadDrop: "o arrastra y suelta aquí",
    sheetsLabel: "Enlace de Google Sheets",
    sheetsPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    sheetsHint: "Asegúrate de que esté compartida públicamente",
    sheetsButton: "Importar de Google Sheets",
    parsing: "Leyendo tu archivo...",
    scoreMeta: "puntuación actual",
    improvementsTitle: "Lo que puedes mejorar",
    improvementsSubtitle: "ordenado por impacto — empieza por arriba",
    strengthsTitle: "Lo que ya funciona",
    strengthsSubtitle: "estas áreas están bien",
    topActionsTitle: "Empieza aquí",
    topActionsSubtitle: "los 3 cambios con más impacto",
    cta: "mejorar estas secciones con ia",
    analyzeAnother: "analizar otro currículum",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorLimit: "Límite alcanzado (5 por hora). Intenta más tarde.",
    errorConnection: "Error de conexión. Revisa tu internet.",
    errorLength: "Por favor pega al menos 50 caracteres.",
    parseError: "No se pudo leer el archivo. Intenta pegando el texto.",
    sheetsError: "No se pudo acceder al Google Sheet.",
    footer: "maxcv — gratis para todos, siempre",
  },
};

// -- Component ---------------------------------------------------------------

export default function ScorePage() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"en" | "es">("en");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = UI[lang];

  const handleFileUpload = async (file: File) => {
    setParsing(true);
    setError("");
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.parseError); setFileName(""); return; }
      setCvText(data.text);
      setInputMode("text");
    } catch { setError(t.parseError); setFileName(""); }
    finally { setParsing(false); }
  };

  const handleSheetsImport = async () => {
    if (!sheetsUrl.trim()) return;
    setParsing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("sheetsUrl", sheetsUrl);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.sheetsError); return; }
      setCvText(data.text);
      setInputMode("text");
      setSheetsUrl("");
    } catch { setError(t.sheetsError); }
    finally { setParsing(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvText.trim()) return;
    if (cvText.trim().length < 50) { setError(t.errorLength); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole }),
      });
      if (res.status === 429) { setError(t.errorLimit); return; }
      if (!res.ok) { const data = await res.json().catch(() => null); setError(data?.message || t.errorGeneric); return; }
      const data: ScoreResult = await res.json();
      setResult(data);
      if (data.detected_language === "es" || data.detected_language === "es-MX") setLang("es");
      setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100);
    } catch { setError(t.errorConnection); }
    finally { setLoading(false); }
  };

  const handleImproveClick = () => {
    try {
      sessionStorage.setItem("maxcv_cv", cvText);
      if (targetRole) sessionStorage.setItem("maxcv_role", targetRole);
    } catch { /* noop */ }
    window.location.href = "/";
  };

  const improvements = result ? extractImprovements(result.dimensions) : [];
  const strengths = result ? extractStrengths(result.dimensions, lang) : [];
  const dimName = (key: string) => DIMENSION_NAMES[key]?.[lang] || key;

  return (
    <div className="min-h-screen flex flex-col bg-[--ink-000]">
      {/* Header */}
      <header className="w-full border-b border-[--ink-100]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="/score" className="font-[family-name:var(--font-mono)] text-base tracking-tight text-[--ink-900]">
            max<span className="text-[--accent]">cv</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="text-[--ink-500] hover:text-[--ink-900] transition cursor-pointer text-xs"
            >
              {t.langToggle}
            </button>
            <span className="font-[family-name:var(--font-mono)] text-[--ink-300] tracking-wide uppercase text-xs">
              {t.tagline}
            </span>
            <span className="text-[--ink-300] font-[family-name:var(--font-mono)] text-[11px]">v2.1</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-12">
        {/* Input form */}
        {!result && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tabs */}
            <div className="flex border-b border-[--ink-100]">
              {(["text", "file", "sheets"] as InputMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInputMode(mode)}
                  className={`px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                    inputMode === mode
                      ? "text-[--accent] border-b-2 border-[--accent] -mb-px"
                      : "text-[--ink-500] hover:text-[--ink-900]"
                  }`}
                >
                  {mode === "text" ? t.tabText : mode === "file" ? t.tabFile : t.tabSheets}
                </button>
              ))}
            </div>

            {/* Text input */}
            {inputMode === "text" && (
              <div>
                <label htmlFor="cv" className="block text-sm font-medium text-[--ink-900] mb-1.5">
                  {t.labelCv}
                </label>
                <textarea
                  id="cv"
                  rows={10}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={t.placeholderCv}
                  className="w-full rounded-lg border border-[--ink-100] px-4 py-3 text-sm text-[--ink-900] focus:outline-none focus:ring-2 focus:ring-[--accent]/30 focus:border-[--accent] resize-y transition placeholder:text-[--ink-300]"
                  required
                />
              </div>
            )}

            {/* File upload */}
            {inputMode === "file" && (
              <div>
                <label className="block text-sm font-medium text-[--ink-900] mb-1.5">{t.uploadLabel}</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                    dragOver ? "border-[--accent] bg-[--accent-ghost]" : "border-[--ink-300] hover:border-[--ink-500]"
                  }`}
                >
                  {parsing ? (
                    <Spinner label={t.parsing} />
                  ) : (
                    <>
                      <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden"
                        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} />
                      <svg className="mx-auto h-8 w-8 text-[--ink-300] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="text-sm font-medium text-[--accent] hover:text-[--accent-dim] transition cursor-pointer">
                        {t.uploadButton}
                      </button>
                      <p className="text-xs text-[--ink-500] mt-1">{t.uploadDrop}</p>
                      <p className="text-xs text-[--ink-300] mt-2">{t.uploadHint}</p>
                      {fileName && <p className="text-xs text-[--accent] font-medium mt-2">{fileName}</p>}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Google Sheets */}
            {inputMode === "sheets" && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="sheets" className="block text-sm font-medium text-[--ink-900] mb-1.5">{t.sheetsLabel}</label>
                  <input id="sheets" type="url" value={sheetsUrl} onChange={(e) => setSheetsUrl(e.target.value)}
                    placeholder={t.sheetsPlaceholder}
                    className="w-full rounded-lg border border-[--ink-100] px-4 py-3 text-sm text-[--ink-900] focus:outline-none focus:ring-2 focus:ring-[--accent]/30 focus:border-[--accent] transition placeholder:text-[--ink-300]" />
                  <p className="text-xs text-[--ink-500] mt-1.5">{t.sheetsHint}</p>
                </div>
                <button type="button" onClick={handleSheetsImport} disabled={parsing || !sheetsUrl.trim()}
                  className="w-full bg-[--accent] text-white font-medium py-3 px-6 rounded-lg hover:bg-[--accent-dim] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer">
                  {parsing ? <Spinner label={t.parsing} /> : t.sheetsButton}
                </button>
              </div>
            )}

            {/* Target role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[--ink-900] mb-1.5">
                {t.labelRole} <span className="text-[--ink-500] font-normal">{t.optional}</span>
              </label>
              <input id="role" type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                placeholder={t.placeholderRole}
                className="w-full rounded-lg border border-[--ink-100] px-4 py-3 text-sm text-[--ink-900] focus:outline-none focus:ring-2 focus:ring-[--accent]/30 focus:border-[--accent] transition placeholder:text-[--ink-300]" />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !cvText.trim()}
              className="w-full bg-[--accent] text-white font-medium py-3 px-6 rounded-lg hover:bg-[--accent-dim] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer font-[family-name:var(--font-mono)]">
              {loading ? <Spinner label={t.loading} /> : t.button}
            </button>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[--ink-100] text-[--ink-900] text-sm px-4 py-3 rounded-lg mb-6 mt-4">{error}</div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef} className="space-y-16">
            {/* Score metadata — discrete */}
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
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", ...spring, delay: i * stagger }}
                      className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[--accent] text-white flex items-center justify-center mt-0.5 text-xs font-[family-name:var(--font-mono)]">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[--ink-900]" style={{ lineHeight: "1.6" }}>{action}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Improvements — HERO */}
            {improvements.length > 0 && (
              <section className="reveal">
                <h2 className="text-lg font-medium text-[--ink-900] mb-1">{t.improvementsTitle}</h2>
                <p className="text-xs text-[--ink-500] mb-6">{t.improvementsSubtitle}</p>
                <div className="space-y-4">
                  {improvements.map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", ...spring, delay: (3 + i) * stagger }}
                      className="border-l-2 border-[--ink-100] pl-4 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[--ink-900]">{dimName(item.dimension)}</span>
                        <span className={`font-[family-name:var(--font-mono)] tracking-wide uppercase text-[11px] ${
                          item.score < 50 ? "text-[--accent]" : "text-[--ink-500]"
                        }`}>
                          {item.score < 50
                            ? (lang === "en" ? "high impact" : "alto impacto")
                            : (lang === "en" ? "medium impact" : "impacto medio")}
                        </span>
                      </div>
                      <p className="text-sm text-[--ink-500]" style={{ lineHeight: "1.6" }}>{item.issue}</p>
                      {item.suggestion && (
                        <p className="text-xs text-[--ink-300] mt-1" style={{ lineHeight: "1.5" }}>{item.suggestion}</p>
                      )}
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
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", ...spring, delay: (3 + improvements.length + i) * stagger }}
                      className="border-l-2 border-[--positive] pl-4 py-1">
                      <span className="text-sm font-medium text-[--ink-900]">{dimName(item.dimension)}</span>
                      <p className="text-sm text-[--ink-500] mt-0.5" style={{ lineHeight: "1.6" }}>{item.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", ...spring, delay: (3 + improvements.length + strengths.length) * stagger }}
              className="reveal text-center">
              <button onClick={handleImproveClick}
                className="bg-[--accent] text-white font-medium py-3 px-8 rounded-lg hover:bg-[--accent-dim] transition cursor-pointer tracking-wide font-[family-name:var(--font-mono)] text-sm">
                {t.cta}
              </button>
            </motion.div>

            {/* Analyze another */}
            <div className="text-center">
              <button
                onClick={() => { setResult(null); setCvText(""); setTargetRole(""); setError(""); }}
                className="text-[--ink-500] hover:text-[--ink-900] transition cursor-pointer text-xs">
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
