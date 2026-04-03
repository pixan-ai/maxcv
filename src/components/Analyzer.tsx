"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ResumeText } from "@/components/ResumeText";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StepBadge } from "@/components/ui/StepBadge";
import { Collapsible } from "@/components/ui/Collapsible";
import { ANALYZER_UI, DIM_NAMES } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";
import type { Lang } from "@/lib/i18n";
import type { AnalysisResult } from "@/types/analysis";

const ARROW = "▶";
const DEFAULT_OPEN = new Set(["analysis", "improved", "newtext"]);

export function Analyzer({ lang, onLangDetected }: { lang: Lang; onLangDetected: (l: Lang) => void }) {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [inputMethod, setInputMethod] = useState<"paste" | "pdf">("paste");
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const t = ANALYZER_UI[lang];
  const ready = cvText.trim().length >= 50 && !loading && !parsing;
  const hasText = cvText.trim().length > 0;
  const isOpen = (id: string) => openSections.has(id);

  const toggle = (id: string) => {
    setOpenSections(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const dimName = (key: string) => DIM_NAMES[key]?.[lang] ?? key;

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") return;
    setParsing(true); setError(null);
    analytics.pdfUploaded(file.size);
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      if (!res.ok) { setError(t.errorPdf); analytics.pdfError(); return; }
      const data = await res.json();
      if (data.text && data.text.trim().length > 10) {
        setCvText(data.text);
        setInputMethod("pdf");
        analytics.pdfParsed(data.text.length);
      } else { setError(t.errorPdf); analytics.pdfError(); }
    } catch { setError(t.errorPdf); analytics.pdfError(); } finally { setParsing(false); }
  }, [t.errorPdf]);

  const handleTextChange = (text: string) => {
    const wasPaste = text.length - cvText.length > 20;
    setCvText(text);
    if (wasPaste && text.trim().length >= 50) {
      setInputMethod("paste");
      analytics.cvPasted(text.length);
    }
  };

  const analyze = async () => {
    if (!ready) return;
    setLoading(true); setError(null); setResult(null); setOpenSections(new Set());
    analytics.analysisStarted(inputMethod, targetRole.trim().length > 0);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole: targetRole || undefined }),
      });
      if (res.status === 429) { setError(t.errorLimit); analytics.analysisError("rate_limit"); return; }
      if (!res.ok) { setError(t.errorGeneric); analytics.analysisError("api_error"); return; }
      const data: AnalysisResult = await res.json();
      setResult(data);
      setOpenSections(new Set(DEFAULT_OPEN));
      analytics.analysisCompleted(data.score.total, data.detected_language || "unknown");
      if (data.detected_language === "en" || data.detected_language === "es") { onLangDetected(data.detected_language); }
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError(t.errorConnection); analytics.analysisError("connection"); } finally { setLoading(false); }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.improved_cv.text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    analytics.cvCopied();
  };

  const reset = () => {
    setCvText(""); setTargetRole(""); setResult(null); setError(null); setCopied(false); setOpenSections(new Set());
    analytics.resetClicked();
  };

  return (
    <div className="space-y-6">
      <section className="text-center space-y-2 pt-2">
        <h1 className="text-2xl sm:text-3xl font-medium text-ink-900 hero-reveal-1">{t.heroTitle}</h1>
        <p className="text-sm sm:text-base text-accent font-medium hero-reveal-2">{t.heroAccent}</p>
        <div className="text-sm text-ink-400 max-w-lg mx-auto leading-relaxed hero-reveal-3 text-center space-y-0.5">
          <p>{t.heroLine1}</p>
          <p>{t.heroLine2}</p>
        </div>
      </section>

      {(loading || parsing) && (
        <div aria-live="polite">
          <ProgressBar label={parsing ? t.uploadingPdf : t.analyzing} durationMs={parsing ? 8000 : 30000} />
        </div>
      )}

      {error && (<div role="alert" className="text-center py-3"><p className="text-sm text-red-600">{error}</p></div>)}

      {!result && !loading && !parsing && (
        <section className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="pt-3"><StepBadge n={1} /></div>
            <div className="flex-1">
              <div className={`relative border border-ink-100 rounded-lg focus-within:border-accent transition mx-auto ${hasText ? "max-w-full" : "max-w-[70%] sm:max-w-full"}`}>
                <div className="absolute top-3 right-3 z-10">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-ink-200 text-xs font-medium text-ink-600 hover:border-accent hover:text-accent transition cursor-pointer bg-ink-000">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    {t.attachPdf}
                  </button>
                  <input ref={fileRef} type="file" accept=".pdf" aria-label="Upload PDF" className="hidden"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
                </div>
                <textarea value={cvText} onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={t.placeholder} aria-label={t.placeholder} aria-describedby="cv-hint"
                  className="w-full min-h-[120px] p-4 pt-12 text-sm text-ink-700 bg-transparent placeholder:text-ink-300 resize-y focus:outline-none rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <StepBadge n={2} />
            <div className="flex-1">
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                placeholder={`${t.targetRole} ${t.targetRoleOptional}`} aria-label={t.targetRole} maxLength={200}
                className="w-full border border-ink-100 rounded-lg px-4 py-2.5 text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none focus:border-accent transition" />
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <StepBadge n={3} />
            <div className="flex-1">
              <button onClick={analyze} disabled={!ready} aria-disabled={!ready}
                className={`w-full py-3 rounded-lg text-sm font-medium transition cursor-pointer ${ready ? "bg-accent text-white hover:bg-accent-dim soft-pulse" : "bg-ink-100 text-ink-300 cursor-not-allowed"}`}>
                {t.btnAnalyze}
              </button>
            </div>
          </div>

          <div id="cv-hint" className="text-center space-y-1 pl-8">
            <p className="text-xs text-ink-300">{t.privacy}</p>
            <p className="text-xs text-ink-300">{t.rateLimit}</p>
          </div>
        </section>
      )}

      {result && (
        <div ref={resultsRef} className="space-y-3" aria-live="polite">
          <p className="text-xs text-accent font-medium card-enter">{t.expandHint}</p>

          <div className="card-enter">
            <div className="flex gap-3 items-center"><StepBadge n={1} />
              <div className="flex-1">
                <Collapsible title={t.originalCvTitle} isOpen={isOpen("original")} onToggle={() => toggle("original")}>
                  <div className="text-sm text-ink-500 whitespace-pre-wrap max-h-60 overflow-y-auto">{cvText}</div>
                </Collapsible>
              </div>
            </div>
          </div>

          <div className="card-enter" style={{ animationDelay: "0.04s" }}>
            <div className="flex gap-3 items-center"><StepBadge n={2} />
              <div className="flex-1">
                <Collapsible title={t.targetRoleTitle} isOpen={isOpen("role")} onToggle={() => toggle("role")}>
                  <p className="text-sm text-ink-500">{targetRole || t.notSpecified}</p>
                </Collapsible>
              </div>
            </div>
          </div>

          <div className="card-enter" style={{ animationDelay: "0.08s" }}>
            <div className="flex gap-3 items-center"><StepBadge n={3} />
              <div className="flex-1">
                <Collapsible title={t.analysisStepTitle} isOpen={isOpen("analysis")} onToggle={() => toggle("analysis")}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-ink-900">{t.scoreSummaryTitle}</h3>
                      <span className="font-[family-name:var(--font-mono)] text-[13px] text-ink-500 tracking-wide shrink-0 ml-4">{result.score.total}/100 — {t.scoreMeta}</span>
                    </div>
                    <p className="text-sm text-ink-600 leading-relaxed">{result.score.summary}</p>

                    {result.analysis.strengths.length > 0 && (
                      <div className="border border-positive/20 rounded-lg overflow-hidden bg-positive-ghost">
                        <button type="button" onClick={() => toggle("strengths")}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-positive-ghost/80 transition cursor-pointer"
                          aria-expanded={isOpen("strengths")}>
                          <span className="text-ink-400 text-sm transition-transform duration-200 leading-none"
                            style={{ transform: isOpen("strengths") ? "rotate(90deg)" : "rotate(0deg)" }}>{ARROW}</span>
                          {t.strengthsTitle}
                        </button>
                        <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen("strengths") ? "5000px" : "0" }}>
                          <div className="px-4 pb-4 space-y-2">
                            {result.analysis.strengths.map((str, i) => (
                              <div key={i} className="border border-positive/20 rounded-lg p-3 bg-ink-000">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-ink-700">{dimName(str.dimension)}</span>
                                  <span className="font-[family-name:var(--font-mono)] text-[11px] text-positive tracking-wide">{str.dimension_score}/100</span>
                                </div>
                                <p className="text-sm text-ink-600">{str.detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {result.analysis.improvements.length > 0 && (
                      <Collapsible title={t.improvementsTitle} isOpen={isOpen("improvements")} onToggle={() => toggle("improvements")}>
                        <div className="space-y-3 mt-1">
                          {result.analysis.improvements.map((imp, i) => (
                            <div key={i} className="border border-ink-100 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-ink-700">{dimName(imp.dimension)}</span>
                                <span className="font-[family-name:var(--font-mono)] text-[11px] text-ink-400 tracking-wide uppercase">{imp.dimension_score}/100</span>
                              </div>
                              <p className="text-sm text-ink-600">{imp.issue}</p>
                              <p className="text-sm text-ink-500">{imp.suggestion}</p>
                              {imp.before && imp.after && (
                                <div className="grid gap-2 text-xs">
                                  <div className="bg-ink-050 rounded-lg p-3">
                                    <span className="font-[family-name:var(--font-mono)] text-ink-400 uppercase tracking-wide text-[11px]">{t.before}</span>
                                    <p className="text-ink-500 mt-1">{imp.before}</p>
                                  </div>
                                  <div className="bg-positive-ghost rounded-lg p-3">
                                    <span className="font-[family-name:var(--font-mono)] text-positive uppercase tracking-wide text-[11px]">{t.after}</span>
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

          <div className="card-enter" style={{ animationDelay: "0.12s" }}>
            <div className="flex gap-3 items-center"><StepBadge n={4} />
              <div className="flex-1">
                <Collapsible title={t.improvedStepTitle} isOpen={isOpen("improved")} onToggle={() => toggle("improved")}>
                  <div className="space-y-3">
                    {result.improved_cv.changes.length > 0 && (
                      <Collapsible title={t.changesSubTitle} isOpen={isOpen("changes")} onToggle={() => toggle("changes")}>
                        <ul className="space-y-1 mt-1">
                          {result.improved_cv.changes.map((change, i) => (
                            <li key={i} className="flex gap-2 text-sm text-ink-500"><span className="text-positive shrink-0">+</span>{change}</li>
                          ))}
                        </ul>
                      </Collapsible>
                    )}

                    <div className="border border-accent/30 rounded-lg overflow-hidden bg-accent-ghost">
                      <button type="button" onClick={() => toggle("newtext")}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-accent hover:bg-accent-ghost/80 transition cursor-pointer"
                        aria-expanded={isOpen("newtext")}>
                        <span className="text-accent/60 text-sm transition-transform duration-200 leading-none"
                          style={{ transform: isOpen("newtext") ? "rotate(90deg)" : "rotate(0deg)" }}>{ARROW}</span>
                        {t.newTextTitle}
                      </button>
                      <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen("newtext") ? "50000px" : "0" }}>
                        <div className="px-4 pb-4 space-y-3">
                          <ResumeText text={result.improved_cv.text} />
                          <button onClick={copyToClipboard}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-accent/30 text-sm text-accent hover:bg-accent/5 transition cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {copied ? t.copied : t.copy}
                          </button>
                        </div>
                      </div>
                    </div>

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

          <div className="text-center border border-ink-100 rounded-lg p-6 card-enter" style={{ animationDelay: "0.18s" }}>
            <p className="text-sm text-ink-500 mb-3">{t.donationText}</p>
            <div className="flex justify-center gap-3">
              {process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK && (
                <a href={process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK} target="_blank" rel="noopener noreferrer"
                  onClick={() => analytics.donationClicked("stripe")}
                  className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent-dim transition">{t.donationBtn}</a>
              )}
              {process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK && (
                <a href={process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK} target="_blank" rel="noopener noreferrer"
                  onClick={() => analytics.donationClicked("paypal")}
                  className="border border-ink-100 px-5 py-2 rounded-lg text-sm text-ink-600 hover:border-ink-200 transition">PayPal</a>
              )}
            </div>
          </div>

          <div className="text-center">
            <button onClick={reset} className="text-sm text-accent hover:text-accent-dim transition cursor-pointer">{t.tryAgain}</button>
          </div>
        </div>
      )}
    </div>
  );
}
