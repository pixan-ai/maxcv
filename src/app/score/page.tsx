"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";

// -- Types (matching the rich API response) ----------------------------------

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

// Flattened improvement item for the hero list
type ImprovementItem = {
  dimension: string;
  issue: string;
  suggestion: string;
  score: number;
};

// Flattened strength item
type StrengthItem = {
  dimension: string;
  detail: string;
};

// -- Spring config (Style Guide v2.0) ----------------------------------------

const spring = { stiffness: 300, damping: 30 };
const stagger = 0.06;

// -- Dimension display names -------------------------------------------------

const DIMENSION_NAMES: Record<string, { en: string; es: string }> = {
  ats_compatibility: { en: "ATS Compatibility", es: "Compatibilidad ATS" },
  achievement_impact: { en: "Achievement Impact", es: "Impacto de Logros" },
  structure_format: { en: "Structure & Format", es: "Estructura y Formato" },
  keyword_relevance: { en: "Keyword Relevance", es: "Relevancia de Palabras Clave" },
  writing_clarity: { en: "Writing Clarity", es: "Claridad de Escritura" },
  completeness: { en: "Completeness", es: "Completitud" },
};

// -- Extract improvements and strengths from dimensions ----------------------

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

  // Sort by dimension score ascending (worst dimensions first = highest impact)
  items.sort((a, b) => a.score - b.score);
  return items;
}

function extractStrengths(
  dimensions: ScoreResult["dimensions"],
  lang: "en" | "es"
): StrengthItem[] {
  const items: StrengthItem[] = [];

  for (const [key, dim] of Object.entries(dimensions)) {
    if (dim.score >= 70) {
      // Find passing criteria as strengths
      const passing = Object.entries(dim.criteria_checked || {})
        .filter(([, c]) => c.status === "pass")
        .map(([, c]) => c.detail)
        .filter(Boolean);

      if (passing.length > 0) {
        items.push({
          dimension: key,
          detail: passing.slice(0, 2).join(". "),
        });
      }
    }
  }

  // If no criteria-based strengths, use dimensions with high scores
  if (items.length === 0) {
    for (const [key, dim] of Object.entries(dimensions)) {
      if (dim.score >= 60 && dim.evidence) {
        items.push({
          dimension: key,
          detail:
            lang === "en"
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

  // -- File handling ---------------------------------------------------------

  const handleFileUpload = async (file: File) => {
    setParsing(true);
    setError("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.parseError);
        setFileName("");
        return;
      }
      setCvText(data.text);
      setInputMode("text");
    } catch {
      setError(t.parseError);
      setFileName("");
    } finally {
      setParsing(false);
    }
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

      if (!res.ok) {
        setError(data.error || t.sheetsError);
        return;
      }
      setCvText(data.text);
      setInputMode("text");
      setSheetsUrl("");
    } catch {
      setError(t.sheetsError);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // -- Submit ----------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvText.trim()) return;

    if (cvText.trim().length < 50) {
      setError(t.errorLength);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole }),
      });

      if (res.status === 429) {
        setError(t.errorLimit);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || t.errorGeneric);
        return;
      }

      const data: ScoreResult = await res.json();
      setResult(data);

      if (
        data.detected_language === "es" ||
        data.detected_language === "es-MX"
      ) {
        setLang("es");
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  };

  // -- CTA handler -----------------------------------------------------------

  const handleImproveClick = () => {
    try {
      sessionStorage.setItem("maxcv_cv", cvText);
      if (targetRole) sessionStorage.setItem("maxcv_role", targetRole);
    } catch {
      // sessionStorage unavailable
    }
    window.location.href = "/";
  };

  // -- Derived data ----------------------------------------------------------

  const improvements = result ? extractImprovements(result.dimensions) : [];
  const strengths = result ? extractStrengths(result.dimensions, lang) : [];
  const dimName = (key: string) => DIMENSION_NAMES[key]?.[lang] || key;

  // -- Render ----------------------------------------------------------------

  return (
    <div
      className="min-h-screen flex flex-col bg-ink-000"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="w-full border-b border-ink-100">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <a
            href="/score"
            className="font-medium text-ink-800 tracking-tight"
          >
            {t.logo}
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="text-ink-400 hover:text-ink-700 transition cursor-pointer"
              style={{ fontSize: "13px" }}
            >
              {t.langToggle}
            </button>
            <span
              className="text-ink-300 tracking-wide uppercase"
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              {t.tagline}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-12">
        {/* Input form */}
        {!result && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tabs */}
            <div className="flex border-b border-ink-100">
              {(["text", "file", "sheets"] as InputMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInputMode(mode)}
                  className={`px-4 py-2.5 font-medium transition cursor-pointer ${
                    inputMode === mode
                      ? "text-v2-accent border-b-2 border-v2-accent -mb-px"
                      : "text-ink-400 hover:text-ink-700"
                  }`}
                  style={{ fontSize: "14px" }}
                >
                  {mode === "text"
                    ? t.tabText
                    : mode === "file"
                      ? t.tabFile
                      : t.tabSheets}
                </button>
              ))}
            </div>

            {/* Text input */}
            {inputMode === "text" && (
              <div>
                <label
                  htmlFor="cv"
                  className="block font-medium text-ink-700 mb-1.5"
                  style={{ fontSize: "14px" }}
                >
                  {t.labelCv}
                </label>
                <textarea
                  id="cv"
                  rows={10}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={t.placeholderCv}
                  className="w-full rounded-lg border border-ink-100 px-4 py-3 text-ink-700 focus:outline-none focus:ring-2 focus:ring-v2-accent/30 focus:border-v2-accent resize-y transition placeholder:text-ink-300"
                  style={{ fontSize: "14px" }}
                  required
                />
              </div>
            )}

            {/* File upload */}
            {inputMode === "file" && (
              <div>
                <label
                  className="block font-medium text-ink-700 mb-1.5"
                  style={{ fontSize: "14px" }}
                >
                  {t.uploadLabel}
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                    dragOver
                      ? "border-v2-accent bg-v2-accent-light"
                      : "border-ink-100 hover:border-ink-300"
                  }`}
                >
                  {parsing ? (
                    <Spinner label={t.parsing} />
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      <svg
                        className="mx-auto h-10 w-10 text-ink-200 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-medium text-v2-accent hover:text-v2-accent-hover transition cursor-pointer"
                        style={{ fontSize: "14px" }}
                      >
                        {t.uploadButton}
                      </button>
                      <p className="text-ink-400 mt-1" style={{ fontSize: "13px" }}>
                        {t.uploadDrop}
                      </p>
                      <p className="text-ink-400 mt-2" style={{ fontSize: "13px" }}>
                        {t.uploadHint}
                      </p>
                      {fileName && (
                        <p className="text-v2-accent font-medium mt-2" style={{ fontSize: "13px" }}>
                          {fileName}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Google Sheets */}
            {inputMode === "sheets" && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="sheets"
                    className="block font-medium text-ink-700 mb-1.5"
                    style={{ fontSize: "14px" }}
                  >
                    {t.sheetsLabel}
                  </label>
                  <input
                    id="sheets"
                    type="url"
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    placeholder={t.sheetsPlaceholder}
                    className="w-full rounded-lg border border-ink-100 px-4 py-3 text-ink-700 focus:outline-none focus:ring-2 focus:ring-v2-accent/30 focus:border-v2-accent transition placeholder:text-ink-300"
                    style={{ fontSize: "14px" }}
                  />
                  <p className="text-ink-400 mt-1.5" style={{ fontSize: "13px" }}>
                    {t.sheetsHint}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSheetsImport}
                  disabled={parsing || !sheetsUrl.trim()}
                  className="w-full bg-v2-accent text-ink-000 font-medium py-3 px-6 rounded-lg hover:bg-v2-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  style={{ fontSize: "14px" }}
                >
                  {parsing ? <Spinner label={t.parsing} /> : t.sheetsButton}
                </button>
              </div>
            )}

            {/* Target role */}
            <div>
              <label
                htmlFor="role"
                className="block font-medium text-ink-700 mb-1.5"
                style={{ fontSize: "14px" }}
              >
                {t.labelRole}{" "}
                <span className="text-ink-400 font-normal">{t.optional}</span>
              </label>
              <input
                id="role"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={t.placeholderRole}
                className="w-full rounded-lg border border-ink-100 px-4 py-3 text-ink-700 focus:outline-none focus:ring-2 focus:ring-v2-accent/30 focus:border-v2-accent transition placeholder:text-ink-300"
                style={{ fontSize: "14px" }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !cvText.trim()}
              className="w-full bg-v2-accent text-ink-000 font-medium py-3 px-6 rounded-lg hover:bg-v2-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              {loading ? <Spinner label={t.loading} /> : t.button}
            </button>
          </form>
        )}

        {/* Error */}
        {error && (
          <div
            className="bg-ink-050 text-ink-600 px-4 py-3 rounded-lg mb-6 mt-4"
            style={{ fontSize: "14px" }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef} className="space-y-16">
            {/* Score metadata — discrete, not the hero */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p
                className="tracking-wide uppercase text-ink-500 font-light"
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                {t.scoreMeta} &middot; {result.total_score} / 100
              </p>
              {/* Summary — empathetic, starts with a strength */}
              <p
                className="text-ink-600 mt-4 max-w-lg mx-auto"
                style={{ fontSize: "14px", lineHeight: "1.7" }}
              >
                {result.summary}
              </p>
            </motion.div>

            {/* TOP 3 ACTIONS — the quick wins */}
            {result.top_3_actions && result.top_3_actions.length > 0 && (
              <section className="reveal">
                <div className="mb-5">
                  <h2
                    className="font-medium text-ink-800"
                    style={{ fontSize: "18px" }}
                  >
                    {t.topActionsTitle}
                  </h2>
                  <p className="text-ink-400 mt-1" style={{ fontSize: "13px" }}>
                    {t.topActionsSubtitle}
                  </p>
                </div>

                <div className="space-y-3">
                  {result.top_3_actions.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        ...spring,
                        delay: i * stagger,
                      }}
                      className="flex gap-3 items-start"
                    >
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-v2-accent text-ink-000 flex items-center justify-center mt-0.5"
                        style={{
                          fontSize: "12px",
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <p
                        className="text-ink-700"
                        style={{ fontSize: "14px", lineHeight: "1.6" }}
                      >
                        {action}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* HERO — Improvements by dimension */}
            {improvements.length > 0 && (
              <section className="reveal">
                <div className="mb-6">
                  <h2
                    className="font-medium text-ink-800"
                    style={{ fontSize: "18px" }}
                  >
                    {t.improvementsTitle}
                  </h2>
                  <p className="text-ink-400 mt-1" style={{ fontSize: "13px" }}>
                    {t.improvementsSubtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  {improvements.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        ...spring,
                        delay: (3 + i) * stagger,
                      }}
                      className="border-l-2 border-ink-100 pl-4 py-1"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-medium text-ink-700"
                          style={{ fontSize: "14px" }}
                        >
                          {dimName(item.dimension)}
                        </span>
                        <span
                          className={`tracking-wide uppercase font-light ${
                            item.score < 50
                              ? "text-v2-accent"
                              : "text-ink-400"
                          }`}
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-geist-mono)",
                          }}
                        >
                          {item.score < 50
                            ? lang === "en"
                              ? "high impact"
                              : "alto impacto"
                            : lang === "en"
                              ? "medium impact"
                              : "impacto medio"}
                        </span>
                      </div>

                      <p
                        className="text-ink-600"
                        style={{ fontSize: "14px", lineHeight: "1.6" }}
                      >
                        {item.issue}
                      </p>

                      {item.suggestion && (
                        <p
                          className="text-ink-400 mt-1"
                          style={{ fontSize: "13px", lineHeight: "1.5" }}
                        >
                          {item.suggestion}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <section className="reveal">
                <div className="mb-5">
                  <h2
                    className="font-medium text-ink-800"
                    style={{ fontSize: "18px" }}
                  >
                    {t.strengthsTitle}
                  </h2>
                  <p className="text-ink-400 mt-1" style={{ fontSize: "13px" }}>
                    {t.strengthsSubtitle}
                  </p>
                </div>

                <div className="space-y-3">
                  {strengths.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        ...spring,
                        delay: (3 + improvements.length + i) * stagger,
                      }}
                      className="border-l-2 border-positive pl-4 py-1"
                    >
                      <span
                        className="font-medium text-ink-700"
                        style={{ fontSize: "14px" }}
                      >
                        {dimName(item.dimension)}
                      </span>
                      <p
                        className="text-ink-500 mt-0.5"
                        style={{ fontSize: "14px", lineHeight: "1.6" }}
                      >
                        {item.detail}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                ...spring,
                delay: (3 + improvements.length + strengths.length) * stagger,
              }}
              className="reveal text-center"
            >
              <button
                onClick={handleImproveClick}
                className="bg-v2-accent text-ink-000 font-medium py-3 px-8 rounded-lg hover:bg-v2-accent-hover transition cursor-pointer tracking-wide"
                style={{
                  fontSize: "14px",
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                {t.cta}
              </button>
            </motion.div>

            {/* Analyze another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setCvText("");
                  setTargetRole("");
                  setError("");
                }}
                className="text-ink-400 hover:text-ink-600 transition cursor-pointer"
                style={{ fontSize: "13px" }}
              >
                {t.analyzeAnother}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-ink-100">
        <div className="max-w-2xl mx-auto px-5 py-6 text-center">
          <span
            className="text-ink-400"
            style={{
              fontSize: "13px",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            {t.footer}
          </span>
        </div>
      </footer>
    </div>
  );
}

// -- Spinner -----------------------------------------------------------------

function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label}
    </span>
  );
}
