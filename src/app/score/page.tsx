"use client";

import { useState, useRef, useEffect } from "react";

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

const DIMENSIONS: { key: keyof ScoreResult["dimensions"]; label: string; labelEn: string; desc: string; descEn: string }[] = [
  { key: "ats_compatibility", label: "Compatibilidad ATS", labelEn: "ATS Compatibility", desc: "¿Los sistemas de reclutamiento pueden leer tu CV correctamente?", descEn: "Can recruitment systems parse your CV correctly?" },
  { key: "achievement_impact", label: "Impacto de logros", labelEn: "Achievement Impact", desc: "¿Tus bullets muestran resultados medibles o solo listan tareas?", descEn: "Do your bullets show measurable results or just list duties?" },
  { key: "structure_format", label: "Estructura y formato", labelEn: "Structure & Format", desc: "¿Tu CV está bien organizado con la extensión adecuada?", descEn: "Is your CV well-organized with appropriate length?" },
  { key: "keyword_relevance", label: "Palabras clave", labelEn: "Keywords", desc: "¿Tu CV contiene los términos que buscan los reclutadores?", descEn: "Does your CV contain the terms recruiters search for?" },
  { key: "writing_clarity", label: "Claridad de redacción", labelEn: "Writing Clarity", desc: "¿Tu escritura es directa, profesional y sin errores?", descEn: "Is your writing direct, professional, and error-free?" },
  { key: "completeness", label: "Completitud", labelEn: "Completeness", desc: "¿Están todas las secciones que los reclutadores esperan?", descEn: "Are all expected sections present?" },
];

function scoreColor(s: number) { return s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-500" : "text-red-500"; }
function scoreBg(s: number) { return s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-400" : "bg-red-500"; }
function scoreRing(s: number) { return s >= 80 ? "stroke-emerald-500" : s >= 60 ? "stroke-amber-400" : "stroke-red-500"; }
function catLabel(c: string, l: string) { const m: any = { excellent:{es:"Excelente",en:"Excellent"}, good:{es:"Bueno",en:"Good"}, fair:{es:"Regular",en:"Fair"}, low:{es:"Bajo",en:"Low"}, critical:{es:"Crítico",en:"Critical"} }; return m[c]?.[l==="es"?"es":"en"]||c; }
function statusIcon(s: string) { return s === "pass" ? "\u2705" : s === "warning" ? "\u26A0\uFE0F" : "\u274C"; }
function statusColor(s: string) { return s === "pass" ? "text-emerald-600 dark:text-emerald-400" : s === "warning" ? "text-amber-500" : "text-red-500"; }

function Ring({ score, animate }: { score: number; animate: boolean }) {
  const c = 2 * Math.PI * 54;
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" className="stroke-stone-200 dark:stroke-stone-700" strokeWidth="7"/>
        <circle cx="60" cy="60" r="54" fill="none" className={`${scoreRing(score)} transition-all duration-[1.5s] ease-out`} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={animate ? c*(1-score/100) : c}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-semibold tabular-nums ${scoreColor(score)}`}>{animate?score:0}</span>
        <span className="text-xs text-stone-400 mt-0.5">de 100</span>
      </div>
    </div>
  );
}

function DimBar({ label, score, animate, delay, onClick, expanded }: { label: string; score: number; animate: boolean; delay: number; onClick: () => void; expanded: boolean }) {
  return (
    <button onClick={onClick} className={`w-full text-left py-3 px-4 rounded-xl transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 ${expanded?"bg-stone-50 dark:bg-stone-800/50":""}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</span>
        <span className={`text-sm font-semibold tabular-nums ${scoreColor(score)}`}>{score}</span>
      </div>
      <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ease-out ${scoreBg(score)}`} style={{width:animate?`${score}%`:"0%",transitionDuration:"1.2s",transitionDelay:`${delay}ms`}}/>
      </div>
    </button>
  );
}

function PrivacyAnimation({ isEs }: { isEs: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-lg animate-pulse">{"\uD83D\uDCC4"}</div>
        <span className="text-[10px] text-stone-400 mt-1">{isEs?"Tu CV":"Your CV"}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-[ping_1.5s_ease-in-out_infinite]"/>
        <div className="w-8 h-0.5 bg-emerald-300 dark:bg-emerald-700"/>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-[ping_1.5s_ease-in-out_infinite_0.3s]"/>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-lg">{"\uD83D\uDD12"}</div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">{isEs?"Análisis":"Analysis"}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-[ping_1.5s_ease-in-out_infinite_0.6s]"/>
        <div className="w-8 h-0.5 bg-emerald-300 dark:bg-emerald-700"/>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-[ping_1.5s_ease-in-out_infinite_0.9s]"/>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-lg">{"\u2705"}</div>
        <span className="text-[10px] text-stone-400 mt-1">Score</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-8 h-0.5 bg-red-300 dark:bg-red-800"/>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center text-lg">{"\uD83D\uDDD1\uFE0F"}</div>
        <span className="text-[10px] text-red-500 mt-1">{isEs?"CV eliminado":"CV deleted"}</span>
      </div>
    </div>
  );
}

export default function ScorePage() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animateScore, setAnimateScore] = useState(false);
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [inputTab, setInputTab] = useState<"paste"|"upload"|"sheets">("paste");
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (result) { const t = setTimeout(() => setAnimateScore(true), 100); return () => clearTimeout(t); } }, [result]);

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError(null);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al procesar el archivo."); setUploading(false); return; }
      setCvText(data.text);
      setInputTab("paste");
    } catch { setError("Error al subir el archivo."); } finally { setUploading(false); }
  }

  async function handleSheets(url: string) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("sheetsUrl", url);
      const res = await fetch("/api/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al acceder a Google Sheets."); setUploading(false); return; }
      setCvText(data.text);
      setInputTab("paste");
    } catch { setError("Error al procesar Google Sheets."); } finally { setUploading(false); }
  }

  async function handleScore() {
    if (cvText.trim().length < 100) { setError("Pega tu CV completo. El texto es muy corto."); return; }
    setLoading(true); setError(null); setResult(null); setAnimateScore(false); setExpandedDim(null);
    try {
      const res = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvText: cvText.trim(), targetRole: targetRole.trim() || undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Error al evaluar tu CV."); return; }
      setResult(data);
      setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 200);
    } catch { setError("Error de conexión."); } finally { setLoading(false); }
  }

  const isEs = !result || result?.detected_language === "es";
  const dim = expandedDim ? result?.dimensions[expandedDim as keyof typeof result.dimensions] as DimensionResult : null;
  const dimMeta = DIMENSIONS.find(d => d.key === expandedDim);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">Max<span className="text-emerald-600">CV</span></a>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Score</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {!result && (
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">{isEs?"Conoce el puntaje real de tu CV":"Get your real CV score"}</h1>
            <p className="mt-3 text-stone-500 dark:text-stone-400 text-base max-w-md mx-auto leading-relaxed">{isEs?"Evaluamos tu CV en 6 dimensiones con IA avanzada. Sin registro, sin costo, sin almacenar datos.":"We evaluate your CV across 6 dimensions with advanced AI. No sign-up, no cost, no data stored."}</p>
          </div>
        )}

        {!result && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              {(["paste","upload","sheets"] as const).map(tab => (
                <button key={tab} onClick={() => setInputTab(tab)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${inputTab===tab?"bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm":"text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}>
                  {tab==="paste"?(isEs?"Pegar texto":"Paste text"):tab==="upload"?(isEs?"Subir archivo":"Upload file"):"Google Sheets"}
                </button>
              ))}
            </div>

            {/* Paste tab */}
            {inputTab==="paste" && (
              <div className="mb-4">
                <label htmlFor="cv-input" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{isEs?"Pega tu CV aquí":"Paste your CV here"}</label>
                <textarea id="cv-input" rows={10} placeholder={isEs?"Copia y pega el contenido de tu CV...\n\nTip: Abre tu CV en Word o PDF, selecciona todo (Ctrl+A), copia (Ctrl+C), y pega aquí (Ctrl+V).":"Copy and paste your CV content here..."}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-4 text-sm leading-relaxed placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-y min-h-[200px] transition-colors"
                  value={cvText} onChange={e => setCvText(e.target.value)}/>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-stone-400">{cvText.length>0?`${cvText.length.toLocaleString()} ${isEs?"caracteres":"chars"}`:""}{fileName?` — ${fileName}`:""}</span>
                  <span className="text-xs text-stone-400">{isEs?"Máximo ~5 páginas":"Max ~5 pages"}</span>
                </div>
              </div>
            )}

            {/* Upload tab */}
            {inputTab==="upload" && (
              <div className="mb-4">
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
                  <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { if(e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}/>
                  <div className="text-3xl mb-2">{uploading?"\u23F3":"\uD83D\uDCC2"}</div>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{uploading?(isEs?"Procesando...":"Processing..."):(isEs?"Haz clic o arrastra tu archivo":"Click or drag your file")}</p>
                  <p className="text-xs text-stone-400 mt-1">PDF — {isEs?"Máximo 5MB":"Max 5MB"}</p>
                  <p className="text-xs text-stone-400 mt-1">{isEs?"¿Tu CV es Word? Guárdalo como PDF primero.":"Word CV? Save as PDF first."}</p>
                </div>
              </div>
            )}

            {/* Sheets tab */}
            {inputTab==="sheets" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Google Sheets URL</label>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://docs.google.com/spreadsheets/d/..." className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors" id="sheets-url"/>
                  <button onClick={() => { const u = (document.getElementById("sheets-url") as HTMLInputElement).value; if(u) handleSheets(u); }} disabled={uploading} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 disabled:opacity-50">{uploading?(isEs?"Cargando...":"Loading..."):(isEs?"Cargar":"Load")}</button>
                </div>
                <p className="text-xs text-stone-400 mt-1.5">{isEs?"El Sheet debe ser público o 'cualquier persona con el enlace'":"Sheet must be public or 'anyone with the link'"}</p>
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="target-role" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{isEs?"Puesto objetivo":"Target role"} <span className="text-stone-400 font-normal">({isEs?"opcional":"optional"})</span></label>
              <input id="target-role" type="text" placeholder={isEs?"ej. Product Manager, Ingeniero de Software...":"e.g. Product Manager, Software Engineer..."} className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-4 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors" value={targetRole} onChange={e => setTargetRole(e.target.value)}/>
            </div>

            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">{error}</div>}

            <button onClick={handleScore} disabled={loading||cvText.trim().length<100} className="w-full py-3 px-6 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 active:scale-[0.98]">
              {loading?<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>{isEs?"Evaluando tu CV...":"Evaluating..."}</span>:(isEs?"Evaluar mi CV":"Evaluate my CV")}
            </button>

            {/* Privacy animation */}
            {loading && <PrivacyAnimation isEs={isEs}/>}
            {!loading && <p className="text-center text-xs text-stone-400 mt-3">{isEs?"Tu CV se procesa en tiempo real y no se almacena.":"Your CV is processed in real-time and not stored."}</p>}
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef}>
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="text-center">
                  <Ring score={result.total_score} animate={animateScore}/>
                  <div className="mt-3"><span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${result.total_score>=75?"bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400":result.total_score>=60?"bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400":"bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{catLabel(result.category,result.detected_language)}</span></div>
                  {result.inferred_role && <p className="text-xs text-stone-400 mt-2">{isEs?"Perfil:":"Profile:"} {result.inferred_role}</p>}
                </div>
                <div className="space-y-0.5">
                  {DIMENSIONS.map((d,i) => <DimBar key={d.key} label={isEs?d.label:d.labelEn} score={result.dimensions[d.key].score} animate={animateScore} delay={i*150} onClick={() => setExpandedDim(expandedDim===d.key?null:d.key)} expanded={expandedDim===d.key}/>)}
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800">
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Expanded Dimension with criteria */}
            {expandedDim && dim && dimMeta && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm mb-4">
                <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">{isEs?dimMeta.label:dimMeta.labelEn}</h3>
                <p className="text-xs text-stone-400 mb-4">{isEs?dimMeta.desc:dimMeta.descEn}</p>

                {/* Criteria checklist */}
                {dim.criteria_checked && (
                  <div className="mb-4 space-y-1.5">
                    <p className="text-xs font-medium text-stone-500 mb-1">{isEs?"Criterios evaluados:":"Criteria evaluated:"}</p>
                    {Object.entries(dim.criteria_checked).map(([key, val]) => (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <span className={`shrink-0 text-xs ${statusColor(val.status)}`}>{statusIcon(val.status)}</span>
                        <div>
                          <span className="font-medium text-stone-700 dark:text-stone-300">{key.replace(/_/g," ")}</span>
                          <span className="text-stone-500 dark:text-stone-400"> — {val.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Evidence */}
                {dim.evidence && (
                  <div className="mb-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border-l-2 border-stone-300 dark:border-stone-600">
                    <p className="text-xs font-medium text-stone-500 mb-1">{isEs?"Evidencia del CV:":"CV evidence:"}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400 italic">{dim.evidence}</p>
                  </div>
                )}

                {/* Issues */}
                {dim.issues && dim.issues.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">{isEs?"Problemas detectados:":"Issues found:"}</p>
                    <ul className="space-y-1">{dim.issues.map((issue,i) => <li key={i} className="text-sm text-stone-600 dark:text-stone-400 pl-3 border-l-2 border-red-200 dark:border-red-800">{issue}</li>)}</ul>
                  </div>
                )}

                {/* Suggestions */}
                {dim.suggestions && dim.suggestions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1.5">{isEs?"Sugerencias:":"Suggestions:"}</p>
                    <ul className="space-y-1">{dim.suggestions.map((s,i) => <li key={i} className="text-sm text-stone-600 dark:text-stone-400 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800">{s}</li>)}</ul>
                  </div>
                )}

                {/* Achievement example */}
                {expandedDim==="achievement_impact" && dim.example_improvement && (
                  <div className="mt-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                    <p className="text-xs font-medium text-stone-500 mb-2">{isEs?"Ejemplo de mejora:":"Improvement example:"}</p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 line-through">{dim.example_improvement.before}</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mt-1">{dim.example_improvement.after}</p>
                  </div>
                )}

                {/* Keywords */}
                {expandedDim==="keyword_relevance" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {dim.found_keywords?.map((kw,i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{kw}</span>)}
                    {dim.missing_keywords?.map((kw,i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 border-dashed">+ {kw}</span>)}
                  </div>
                )}

                {/* Completeness sections */}
                {expandedDim==="completeness" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {dim.present_sections?.map((s,i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{s}</span>)}
                    {dim.missing_sections?.map((s,i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-dashed border-red-200 dark:border-red-800">+ {s}</span>)}
                  </div>
                )}
              </div>
            )}

            {/* Top 3 Actions */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm mb-4">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3">{isEs?"Las 3 acciones que más impacto tendrán:":"Top 3 highest-impact actions:"}</h3>
              <ol className="space-y-2.5">{result.top_3_actions.map((a,i) => <li key={i} className="flex gap-3 items-start"><span className="shrink-0 w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs font-semibold flex items-center justify-center">{i+1}</span><span className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{a}</span></li>)}</ol>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button onClick={() => {setResult(null);setAnimateScore(false);setExpandedDim(null);setCvText("");setFileName("");}} className="py-3 px-4 rounded-xl text-sm font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all active:scale-[0.98]">{isEs?"Evaluar otro CV":"Score another CV"}</button>
              <a href="/" className="py-3 px-4 rounded-xl text-sm font-medium text-center border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all">{isEs?"Mejorar mi CV":"Improve my CV"}</a>
              <button onClick={() => { if(navigator.share){navigator.share({text:result.share_text});}else{navigator.clipboard.writeText(result.share_text);alert(isEs?"Copiado":"Copied");}}} className="py-3 px-4 rounded-xl text-sm font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all">{isEs?"Compartir":"Share"}</button>
            </div>

            {/* Donation */}
            <div className="text-center bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-stone-900 rounded-2xl border border-emerald-200 dark:border-emerald-900 p-6">
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">{isEs?"¿Te fue útil? MaxCV se mantiene con donaciones.":"Was this helpful? MaxCV runs on donations."}</p>
              <div className="flex justify-center gap-2 mt-3">
                {[{l:"$50 MXN",v:50},{l:"$100 MXN",v:100},{l:"$200 MXN",v:200}].map(o => <a key={o.v} href={`#donate-${o.v}`} className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">{o.l}</a>)}
              </div>
              <p className="text-xs text-stone-400 mt-3">{isEs?"100% voluntario. Tu score ya es tuyo.":"100% voluntary. Your score is already yours."}</p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <span>MaxCV — {isEs?"Gratis para todos, para siempre.":"Free for everyone, forever."}</span>
          <div className="flex gap-4">
            <a href="/principles" className="hover:text-stone-600 transition-colors">{isEs?"Principios":"Principles"}</a>
            <a href="/privacy" className="hover:text-stone-600 transition-colors">{isEs?"Privacidad":"Privacy"}</a>
            <a href="https://www.anthropic.com/claude" target="_blank" rel="noopener noreferrer" className="hover:text-stone-600 transition-colors">Powered by Claude</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
