"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationBanner from "@/components/DonationBanner";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CriterionStatus { status: string; detail: string; }
interface DimensionResult {
  score: number;
  criteria_checked?: Record<string, CriterionStatus>;
  evidence?: string;
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

const DIMENSIONS: { key: keyof ScoreResult["dimensions"]; label: string; labelEn: string; weight: string }[] = [
  { key: "ats_compatibility", label: "Compatibilidad ATS", labelEn: "ATS Compatibility", weight: "25%" },
  { key: "achievement_impact", label: "Impacto de logros", labelEn: "Achievement Impact", weight: "20%" },
  { key: "structure_format", label: "Estructura y formato", labelEn: "Structure & Format", weight: "15%" },
  { key: "keyword_relevance", label: "Palabras clave", labelEn: "Keywords", weight: "20%" },
  { key: "writing_clarity", label: "Claridad de redacción", labelEn: "Writing Clarity", weight: "10%" },
  { key: "completeness", label: "Completitud", labelEn: "Completeness", weight: "10%" },
];

function scoreColor(s: number) { return s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-500" : "text-red-500"; }
function scoreBg(s: number) { return s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-400" : "bg-red-500"; }
function scoreRing(s: number) { return s >= 80 ? "stroke-emerald-500" : s >= 60 ? "stroke-amber-400" : "stroke-red-500"; }
function catLabel(c: string, l: string) { const m: any = { excellent:{es:"Excelente",en:"Excellent"}, good:{es:"Bueno",en:"Good"}, fair:{es:"Regular",en:"Fair"}, low:{es:"Bajo",en:"Low"}, critical:{es:"Crítico",en:"Critical"} }; return m[c]?.[l==="es"?"es":"en"]||c; }
function statusIcon(s: string) { return s === "pass" ? "\u2705" : s === "warning" ? "\u26A0\uFE0F" : "\u274C"; }
function statusBg(s: string) { return s === "pass" ? "bg-emerald-50" : s === "warning" ? "bg-amber-50" : "bg-red-50"; }

function Ring({ score, animate }: { score: number; animate: boolean }) {
  const c = 2 * Math.PI * 54;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" className="stroke-gray-200" strokeWidth="7"/>
        <circle cx="60" cy="60" r="54" fill="none" className={`${scoreRing(score)} transition-all duration-[1.5s] ease-out`} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={animate ? c*(1-score/100) : c}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-semibold tabular-nums ${scoreColor(score)}`}>{animate?score:0}</span>
        <span className="text-xs text-muted mt-0.5">de 100</span>
      </div>
    </div>
  );
}

function DimensionCard({ dim, meta, isEs, score }: { dim: DimensionResult; meta: typeof DIMENSIONS[0]; isEs: boolean; score: number }) {
  const passCount = dim.criteria_checked ? Object.values(dim.criteria_checked).filter(c => c.status === "pass").length : 0;
  const totalCount = dim.criteria_checked ? Object.keys(dim.criteria_checked).length : 0;

  return (
    <div className="border border-border rounded-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">{isEs ? meta.label : meta.labelEn}</h3>
          <span className="text-xs text-muted">{meta.weight} {isEs?"del puntaje":"of score"} · {passCount}/{totalCount} {isEs?"pasaron":"passed"}</span>
        </div>
        <span className={`text-2xl font-bold tabular-nums ${scoreColor(score)}`}>{score}</span>
      </div>

      {/* Score bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div className={`h-full rounded-full ${scoreBg(score)} transition-all duration-1000 ease-out`} style={{width:`${score}%`}}/>
      </div>

      {/* Criteria checklist */}
      {dim.criteria_checked && (
        <div className="space-y-1.5 mb-4">
          {Object.entries(dim.criteria_checked).map(([key, val]) => (
            <div key={key} className={`flex items-start gap-2 p-2 rounded-lg ${statusBg(val.status)} text-sm`}>
              <span className="shrink-0 text-xs mt-0.5">{statusIcon(val.status)}</span>
              <div className="min-w-0">
                <span className="font-medium text-gray-700">{key.replace(/_/g," ")}</span>
                <span className="text-gray-500"> — {val.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence */}
      {dim.evidence && (
        <div className="mb-3 p-3 rounded-lg bg-gray-50 border-l-2 border-gray-300">
          <p className="text-xs font-medium text-muted mb-1">{isEs?"Evidencia del CV:":"CV evidence:"}</p>
          <p className="text-sm text-gray-600 italic">{dim.evidence}</p>
        </div>
      )}

      {/* Achievement example */}
      {meta.key === "achievement_impact" && dim.example_improvement && (
        <div className="mb-3 p-3 rounded-lg bg-gray-50">
          <p className="text-xs font-medium text-muted mb-2">{isEs?"Ejemplo de mejora:":"Improvement example:"}</p>
          <p className="text-sm text-red-600/80 line-through">{dim.example_improvement.before}</p>
          <p className="text-sm text-emerald-700 font-medium mt-1">{dim.example_improvement.after}</p>
        </div>
      )}

      {/* Keywords */}
      {meta.key === "keyword_relevance" && (dim.found_keywords?.length || dim.missing_keywords?.length) && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {dim.found_keywords?.map((kw,i) => <span key={`f${i}`} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{kw}</span>)}
          {dim.missing_keywords?.map((kw,i) => <span key={`m${i}`} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 border-dashed">+ {kw}</span>)}
        </div>
      )}

      {/* Completeness sections */}
      {meta.key === "completeness" && (dim.present_sections?.length || dim.missing_sections?.length) && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {dim.present_sections?.map((s,i) => <span key={`p${i}`} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{s}</span>)}
          {dim.missing_sections?.map((s,i) => <span key={`m${i}`} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-dashed border-red-200">+ {s}</span>)}
        </div>
      )}

      {/* Issues */}
      {dim.issues && dim.issues.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-red-600 mb-1.5">{isEs?"Problemas:":"Issues:"}</p>
          <ul className="space-y-1">{dim.issues.map((issue,i) => <li key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-red-200">{issue}</li>)}</ul>
        </div>
      )}

      {/* Suggestions */}
      {dim.suggestions && dim.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-accent mb-1.5">{isEs?"Sugerencias:":"Suggestions:"}</p>
          <ul className="space-y-1">{dim.suggestions.map((s,i) => <li key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-emerald-200">{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

type InputMode = "text" | "file" | "sheets";

export default function ScorePage() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animateScore, setAnimateScore] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [lang, setLang] = useState<"en" | "es">("es");
  const resultRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (result) { const t = setTimeout(() => setAnimateScore(true), 100); return () => clearTimeout(t); } }, [result]);

  const isEs = result ? result.detected_language === "es" : lang === "es";

  async function handleFileUpload(file: File) {
    setUploading(true); setError(null); setFileName(file.name);
    try {
      const form = new FormData(); form.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al procesar el archivo."); setUploading(false); return; }
      setCvText(data.text); setInputMode("text");
    } catch { setError("Error al subir el archivo."); } finally { setUploading(false); }
  }

  async function handleSheetsImport() {
    const urlEl = document.getElementById("sheets-url") as HTMLInputElement;
    const url = urlEl?.value;
    if (!url?.trim()) return;
    setUploading(true); setError(null);
    try {
      const form = new FormData(); form.append("sheetsUrl", url);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al acceder a Google Sheets."); setUploading(false); return; }
      setCvText(data.text); setInputMode("text");
    } catch { setError("Error al procesar Google Sheets."); } finally { setUploading(false); }
  }

  async function handleScore() {
    if (cvText.trim().length < 100) { setError(isEs ? "Pega tu CV completo. El texto es muy corto." : "Paste your full CV. Text is too short."); return; }
    setLoading(true); setError(null); setResult(null); setAnimateScore(false);
    try {
      const res = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvText: cvText.trim(), targetRole: targetRole.trim() || undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Error al evaluar tu CV."); return; }
      setResult(data);
      if (data.detected_language === "es" && lang !== "es") setLang("es");
      if (data.detected_language === "en" && lang !== "en") setLang("en");
      setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 200);
    } catch { setError(isEs ? "Error de conexión." : "Connection error."); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        {!result && (
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              {isEs ? "Conoce el puntaje real" : "Get the real score"}
              <br />
              <span className="text-accent">{isEs ? "de tu CV" : "of your CV"}</span>
            </h1>
            <p className="text-muted text-lg max-w-md mx-auto">
              {isEs
                ? "Evaluamos tu CV en 6 dimensiones con IA avanzada. Sin registro, sin costo, sin almacenar datos."
                : "We evaluate your CV across 6 dimensions with advanced AI. No sign-up, no cost, no data stored."}
            </p>
          </section>
        )}

        {/* Input form */}
        {!result && (
          <div className="space-y-4 mb-8">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["text", "file", "sheets"] as InputMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInputMode(mode)}
                  className={`px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                    inputMode === mode
                      ? "text-accent border-b-2 border-accent -mb-px"
                      : "text-muted hover:text-gray-900"
                  }`}
                >
                  {mode === "text"
                    ? (isEs ? "Pegar texto" : "Paste text")
                    : mode === "file"
                    ? (isEs ? "Subir archivo" : "Upload file")
                    : "Google Sheets"}
                </button>
              ))}
            </div>

            {/* Text input */}
            {inputMode === "text" && (
              <div>
                <label htmlFor="cv" className="block text-sm font-medium mb-1.5">
                  {isEs ? "Tu currículum" : "Your resume"}
                </label>
                <textarea
                  id="cv"
                  rows={10}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={isEs ? "Pega el texto de tu currículum aquí..." : "Paste your resume text here..."}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y transition placeholder:text-gray-400"
                  required
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted">{cvText.length > 0 ? `${cvText.length.toLocaleString()} ${isEs?"caracteres":"chars"}` : ""}{fileName ? ` — ${fileName}` : ""}</span>
                  <span className="text-xs text-muted">{isEs ? "Máximo ~5 páginas" : "Max ~5 pages"}</span>
                </div>
              </div>
            )}

            {/* File upload */}
            {inputMode === "file" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {isEs ? "Sube tu currículum" : "Upload your resume"}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition"
                >
                  <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { if(e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}/>
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      {isEs ? "Leyendo tu archivo..." : "Reading your file..."}
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                      </svg>
                      <p className="text-sm font-medium text-accent">{isEs ? "Elegir archivo" : "Choose file"}</p>
                      <p className="text-xs text-muted mt-1">PDF — {isEs ? "máx 5MB" : "max 5MB"}</p>
                      <p className="text-xs text-muted mt-1">{isEs ? "¿Tu CV es Word? Guárdalo como PDF primero." : "Word CV? Save as PDF first."}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Google Sheets */}
            {inputMode === "sheets" && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="sheets-url" className="block text-sm font-medium mb-1.5">
                    {isEs ? "Enlace de Google Sheets" : "Google Sheets link"}
                  </label>
                  <input
                    id="sheets-url"
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition placeholder:text-gray-400"
                  />
                  <p className="text-xs text-muted mt-1.5">{isEs ? "Asegúrate de que esté compartido como 'Cualquier persona con el enlace'" : "Make sure it's shared as 'Anyone with the link'"}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSheetsImport}
                  disabled={uploading}
                  className="w-full bg-accent text-white font-medium py-3 px-6 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {uploading ? (isEs ? "Cargando..." : "Loading...") : (isEs ? "Importar de Google Sheets" : "Import from Google Sheets")}
                </button>
              </div>
            )}

            {/* Target role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1.5">
                {isEs ? "Puesto objetivo" : "Target role"}{" "}
                <span className="text-muted font-normal">({isEs ? "opcional" : "optional"})</span>
              </label>
              <input
                id="role"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={isEs ? "ej. Product Manager, Ingeniero de Software..." : "e.g. Product Manager, Software Engineer..."}
                className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition placeholder:text-gray-400"
              />
            </div>

            {/* Error */}
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

            {/* Submit */}
            <button
              onClick={handleScore}
              disabled={loading || cvText.trim().length < 100}
              className="w-full bg-accent text-white font-medium py-3 px-6 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  {isEs ? "Evaluando tu CV..." : "Evaluating your CV..."}
                </span>
              ) : (isEs ? "Evaluar mi CV" : "Evaluate my CV")}
            </button>

            <p className="text-center text-xs text-muted">{isEs ? "Tu CV se procesa en tiempo real y no se almacena." : "Your CV is processed in real-time and not stored."}</p>
          </div>
        )}

        {/* ===== RESULTS ===== */}
        {result && (
          <div ref={resultRef} className="space-y-6">
            {/* Score overview */}
            <div className="border border-border rounded-lg p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center shrink-0">
                  <Ring score={result.total_score} animate={animateScore}/>
                  <div className="mt-2">
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      result.total_score >= 75 ? "bg-emerald-50 text-emerald-700"
                      : result.total_score >= 60 ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                    }`}>
                      {catLabel(result.category, result.detected_language)}
                    </span>
                  </div>
                  {result.inferred_role && <p className="text-xs text-muted mt-1">{isEs?"Perfil:":"Profile:"} {result.inferred_role}</p>}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
                  <div className="mt-4 space-y-2">
                    {DIMENSIONS.map(d => (
                      <div key={d.key} className="flex items-center gap-3">
                        <span className="text-xs text-muted w-28 shrink-0 truncate">{isEs?d.label:d.labelEn}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBg(result.dimensions[d.key].score)}`} style={{width:`${result.dimensions[d.key].score}%`}}/>
                        </div>
                        <span className={`text-xs font-semibold tabular-nums w-7 text-right ${scoreColor(result.dimensions[d.key].score)}`}>{result.dimensions[d.key].score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension detail cards */}
            {DIMENSIONS.map(d => (
              <DimensionCard key={d.key} dim={result.dimensions[d.key]} meta={d} isEs={isEs} score={result.dimensions[d.key].score}/>
            ))}

            {/* Top 3 Actions */}
            <div className="border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">{isEs?"Las 3 acciones que más impacto tendrán:":"Top 3 highest-impact actions:"}</h3>
              <ol className="space-y-3">
                {result.top_3_actions.map((a,i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">{i+1}</span>
                    <span className="text-sm text-gray-600 leading-relaxed">{a}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setResult(null); setAnimateScore(false); setCvText(""); setFileName(""); }} className="flex-1 bg-accent text-white font-medium py-3 px-6 rounded-lg hover:bg-accent-hover transition cursor-pointer">
                {isEs ? "Evaluar otro CV" : "Score another CV"}
              </button>
              <a href="/" className="flex-1 text-center border border-border text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition">
                {isEs ? "Mejorar mi CV" : "Improve my CV"}
              </a>
              <button onClick={() => { if(navigator.share){navigator.share({text:result.share_text});}else{navigator.clipboard.writeText(result.share_text);alert(isEs?"Copiado":"Copied");}}} className="flex-1 border border-border text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                {isEs ? "Compartir" : "Share"}
              </button>
            </div>

            {/* Donation */}
            <DonationBanner lang={lang} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
