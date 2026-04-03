# MaxCV v5.1 — Moments of Truth Redesign

## Context
Repo: `github.com/pixan-ai/maxcv`, branch `master`.
Stack: Next.js + Tailwind CSS v4 (`@theme {}` with OKLCH tokens) + Geist/Geist Mono.
Design system: `src/app/globals.css` has `ink-*`, `accent`, `positive`, etc. tokens.
Main file to modify: `src/components/Analyzer.tsx` (~650 lines).

**Design philosophy**: "Pure typographic" — Clean SaaS Minimal. White background, no dark mode, no external UI libraries.

⚠️ RULE: Do NOT touch `globals.css`, `Header.tsx`, `Footer.tsx`, `ResumeText.tsx`, `layout.tsx`, `page.tsx`, or any API file. Only modify `Analyzer.tsx`.

---

## CHANGE 1 — Landing page (pre-analysis state)

### 1.1 Hero text strings
Replace the following strings in the `UI` object for both ES and EN:

**ES:**
```
heroTitle: "Tu próximo trabajo empieza con un gran CV."
heroAccent: "Análisis profesional con IA 100% anónimo"
heroSub: "Descubre cómo ven tu CV los expertos y sistemas de reclutamiento (ATS)\nMejóralo al instante\nSin registro · sin guardar tus datos · sin costo"
```

**EN:**
```
heroTitle: "Your next job starts with a great resume."
heroAccent: "100% anonymous professional AI analysis"
heroSub: "See how recruiters and applicant tracking systems (ATS) see your resume\nImprove it instantly\nNo sign-up · no data stored · no cost"
```

### 1.2 Render heroSub with line breaks
The `heroSub` string now contains `\n`. Render it with centered line breaks:

```tsx
<div className="text-sm text-ink-400 max-w-md mx-auto leading-relaxed hero-reveal-3 text-center">
  {t.heroSub.split('\n').map((line, i) => (
    <span key={i} className="block">
      {line}
    </span>
  ))}
</div>
```

### 1.3 Make the "Attach PDF" pill more visible
Move the attach PDF pill from the **bottom-right** corner of the textarea to the **top-right** corner, inside the textarea border. Make it more prominent:

Change the container div position from `bottom-3 right-3` to `top-3 right-3`.

Update the pill button styling for more visibility:
```
className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-ink-200
           text-xs font-medium text-ink-600 hover:border-accent hover:text-accent
           transition cursor-pointer bg-ink-000"
```

Update the textarea placeholder strings:
```
ES: "Pega el texto de tu CV aquí o adjunta un PDF"
EN: "Paste your resume text here or attach a PDF"
```

These are the existing `placeholder` keys in the UI object — just change the values.

### 1.4 Text below the CTA button
Replace the `privacy` and `rateLimit` strings:

**ES:**
```
privacy: "Tu CV se analiza en línea por IA de frontera y se elimina de inmediato"
rateLimit: "Puedes analizar y mejorar tu CV hasta 7 veces cada hora"
```

**EN:**
```
privacy: "Your resume is analyzed online by frontier AI and deleted immediately"
rateLimit: "You can analyze and improve your resume up to 7 times per hour"
```

### 1.5 CTA button text
Confirm `btnAnalyze` stays as:
```
ES: "Analizar tu CV y recomendar mejoras"
EN: "Analyze your resume and suggest improvements"
```

### 1.6 Placeholder sections at the bottom (pre-analysis only)
Below the `privacy + rateLimit` block, add a placeholder div that only shows in pre-analysis state (`!result && !loading && !parsing`). Empty for now:

```tsx
{/* Future sections placeholder */}
<div className="space-y-4 mt-8 pt-8 border-t border-ink-100">
  <div className="text-center">
    <p className="text-xs text-ink-300">
      {lang === 'es' ? '¿Cómo funciona?' : 'How does it work?'}
    </p>
  </div>
</div>
```

---

## CHANGE 2 — Results page (post-analysis state)

This is the most important change. The entire results structure is redesigned.

### 2.1 New results structure

Replace the ENTIRE `{result && (...)}` block with this structure:

```
┌─ Step 1: "Original resume text" — COLLAPSED (collapsible, shows cvText) ──────┐
├─ Step 2: "Target role" — COLLAPSED (collapsible, shows targetRole) ────────────┤
├─ Step 3: "Analysis of your resume" — EXPANDED by default ─────────────────────┤
│   ├─ Score (discrete): "82/100 — current score" (right-aligned, monospace)     │
│   ├─ "Score and analysis summary" as bold subtitle                             │
│   ├─ result.score.summary as body text                                         │
│   ├─ "What already works well" — COLLAPSED, light green background             │
│   └─ "Improvement opportunities" — COLLAPSED                                  │
├─ Step 4: "Your improved resume (text)" — EXPANDED ────────────────────────────┤
│   ├─ "Improvements we applied" — COLLAPSED                                     │
│   ├─ Bold subtitle: "New text (copy and paste)"                                │
│   ├─ Full improved CV text (ResumeText) — VISIBLE, accent-ghost bg             │
│   └─ Small copy pill button inline with title                                  │
└─ Donation CTA + Start over ────────────────────────────────────────────────────┘
```

### 2.2 Add new strings to UI object

Add these new keys to both ES and EN:

**ES:**
```
originalCvTitle: "Texto original de tu CV"
targetRoleTitle: "Puesto al que aspiras"
analysisStepTitle: "Análisis de tu CV"
scoreSummaryTitle: "Score y resumen del análisis"
improvedStepTitle: "Tu nuevo CV mejorado (texto)"
newTextTitle: "Nuevo texto (para copiar y pegar)"
expandHint: "Expande cada sección para ver el detalle"
```

**EN:**
```
originalCvTitle: "Your original resume text"
targetRoleTitle: "Target role"
analysisStepTitle: "Analysis of your resume"
scoreSummaryTitle: "Score and analysis summary"
improvedStepTitle: "Your improved resume (text)"
newTextTitle: "New text (copy and paste)"
expandHint: "Expand each section for details"
```

### 2.3 Change open sections state to support multiple

Change `openSection` from `string | null` to a `Set<string>` called `openSections`:

```tsx
const [openSections, setOpenSections] = useState<Set<string>>(new Set());
```

Update `toggleSection`:
```tsx
const toggleSection = (id: string) => {
  setOpenSections(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};
```

When `result` is set (inside the `analyze` function, after `setResult(data)`), initialize default open sections:
```tsx
setOpenSections(new Set(['analysis', 'improved']));
```

Also in the `reset` function, reset to empty:
```tsx
setOpenSections(new Set());
```

### 2.4 Full results JSX

```tsx
{result && (
  <div ref={resultsRef} className="space-y-3" aria-live="polite">

    {/* Hint */}
    <p className="text-xs text-accent font-medium card-enter">
      {t.expandHint}
    </p>

    {/* Step 1: Original CV text — collapsed */}
    <div className="card-enter">
      <div className="flex gap-3 items-start">
        <StepBadge n={1} />
        <div className="flex-1">
          <Collapsible
            title={t.originalCvTitle}
            isOpen={openSections.has('original')}
            onToggle={() => toggleSection('original')}
          >
            <div className="text-sm text-ink-500 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {cvText.slice(0, 500)}{cvText.length > 500 ? '...' : ''}
            </div>
          </Collapsible>
        </div>
      </div>
    </div>

    {/* Step 2: Target role — collapsed */}
    <div className="card-enter" style={{ animationDelay: "0.04s" }}>
      <div className="flex gap-3 items-start">
        <StepBadge n={2} />
        <div className="flex-1">
          <Collapsible
            title={t.targetRoleTitle}
            isOpen={openSections.has('role')}
            onToggle={() => toggleSection('role')}
          >
            <p className="text-sm text-ink-500">
              {targetRole || (lang === 'es' ? 'No especificado' : 'Not specified')}
            </p>
          </Collapsible>
        </div>
      </div>
    </div>

    {/* Step 3: Analysis — expanded by default */}
    <div className="card-enter" style={{ animationDelay: "0.08s" }}>
      <div className="flex gap-3 items-start">
        <StepBadge n={3} />
        <div className="flex-1">
          <Collapsible
            title={t.analysisStepTitle}
            isOpen={openSections.has('analysis')}
            onToggle={() => toggleSection('analysis')}
          >
            <div className="space-y-4">
              {/* Discrete score */}
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-medium text-ink-900">
                  {t.scoreSummaryTitle}
                </h3>
                <span className="font-[family-name:var(--font-mono)] text-[13px] text-ink-500 tracking-wide shrink-0 ml-4">
                  {result.score.total}/100 — {t.scoreMeta}
                </span>
              </div>

              {/* Summary */}
              <p className="text-sm text-ink-600 leading-relaxed">
                {result.score.summary}
              </p>

              {/* Strengths — collapsed, green background */}
              {result.analysis.strengths.length > 0 && (
                <div className="border border-positive/20 rounded-lg overflow-hidden bg-positive-ghost">
                  <button
                    type="button"
                    onClick={() => toggleSection('strengths')}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-ink-700
                               hover:bg-positive-ghost/80 transition cursor-pointer"
                    aria-expanded={openSections.has('strengths')}
                  >
                    <span className="text-ink-400 text-xs transition-transform duration-200"
                          style={{ transform: openSections.has('strengths') ? "rotate(90deg)" : "rotate(0deg)" }}>
                      ▸
                    </span>
                    {t.strengthsTitle}
                  </button>
                  <div className="overflow-hidden transition-all duration-300 ease-in-out"
                       style={{ maxHeight: openSections.has('strengths') ? "2000px" : "0" }}>
                    <div className="px-4 pb-4 space-y-2">
                      {result.analysis.strengths.map((str, i) => (
                        <div key={i} className="border border-positive/20 rounded-lg p-3 bg-ink-000">
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
                  </div>
                </div>
              )}

              {/* Improvement opportunities — collapsed */}
              {result.analysis.improvements.length > 0 && (
                <Collapsible
                  title={t.improvementsTitle}
                  isOpen={openSections.has('improvements')}
                  onToggle={() => toggleSection('improvements')}
                >
                  <div className="space-y-3 mt-1">
                    {result.analysis.improvements.map((imp, i) => (
                      <div key={i} className="border border-ink-100 rounded-lg p-3 space-y-2">
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
                </Collapsible>
              )}
            </div>
          </Collapsible>
        </div>
      </div>
    </div>

    {/* Step 4: Improved resume — expanded */}
    <div className="card-enter" style={{ animationDelay: "0.12s" }}>
      <div className="flex gap-3 items-start">
        <StepBadge n={4} />
        <div className="flex-1">
          <Collapsible
            title={t.improvedStepTitle}
            isOpen={openSections.has('improved')}
            onToggle={() => toggleSection('improved')}
          >
            <div className="space-y-4">
              {/* Changes applied — collapsed */}
              {result.improved_cv.changes.length > 0 && (
                <Collapsible
                  title={t.changesSubTitle}
                  isOpen={openSections.has('changes')}
                  onToggle={() => toggleSection('changes')}
                >
                  <ul className="space-y-1 mt-1">
                    {result.improved_cv.changes.map((change, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink-500">
                        <span className="text-positive shrink-0">+</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </Collapsible>
              )}

              {/* New text to copy — always visible, accent background */}
              <div className="border border-accent/30 rounded-lg p-4 sm:p-6 bg-accent-ghost">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-accent">
                    {t.newTextTitle}
                  </h4>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-ink-200
                               text-xs text-ink-500 hover:border-accent hover:text-accent
                               transition cursor-pointer bg-ink-000"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied ? t.copied : t.copy}
                  </button>
                </div>
                <ResumeText text={result.improved_cv.text} />
              </div>

              {/* Download button */}
              <div className="flex gap-2">
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
            </div>
          </Collapsible>
        </div>
      </div>
    </div>

    {/* Donation CTA */}
    <div className="text-center border border-ink-100 rounded-lg p-6 card-enter"
         style={{ animationDelay: "0.18s" }}>
      <p className="text-sm text-ink-500 mb-3">{t.donationText}</p>
      <div className="flex justify-center gap-3">
        {process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK && (
          <a href={process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK}
             target="_blank" rel="noopener noreferrer"
             className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent-dim transition">
            {t.donationBtn}
          </a>
        )}
        {process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK && (
          <a href={process.env.NEXT_PUBLIC_PAYPAL_DONATION_LINK}
             target="_blank" rel="noopener noreferrer"
             className="border border-ink-100 px-5 py-2 rounded-lg text-sm text-ink-600 hover:border-ink-200 transition">
            PayPal
          </a>
        )}
      </div>
    </div>

    {/* Start over */}
    <div className="text-center">
      <button onClick={reset}
              className="text-sm text-ink-400 hover:text-ink-700 transition cursor-pointer">
        {t.tryAgain}
      </button>
    </div>
  </div>
)}
```

### 2.5 Remove redundant sections

- ❌ REMOVE the `top_actions` rendering block (the 3 top improvements summary) — this info is already covered by `summary` + `improvements`
- ❌ REMOVE unused UI strings: `analysisSummaryTitle`, `analysisBlockTitle`, `analysisBlockSub`, `improvedBlockTitle`
- Keep `analysisBlockTitle` and `analysisBlockSub` ONLY if other code references them; otherwise remove

### 2.6 Copy and download button placement

- COPY button: inline pill next to the "New text (copy and paste)" title — small, pill style with copy icon
- DOWNLOAD button: below the text block, separate

---

## SUMMARY OF CHANGES

**Files to modify:** Only `src/components/Analyzer.tsx`

**State change:** `openSection: string | null` → `openSections: Set<string>`

**New UI strings:** `originalCvTitle`, `targetRoleTitle`, `analysisStepTitle`, `scoreSummaryTitle`, `improvedStepTitle`, `newTextTitle`, `expandHint`

**Modified UI strings:** `heroAccent`, `heroSub`, `placeholder`, `privacy`, `rateLimit`

**Removed UI strings:** `analysisBlockTitle`, `analysisBlockSub`, `analysisSummaryTitle`, `improvedBlockTitle`

**Removed JSX sections:**
- `top_actions` block (the 3 top improvements)
- Score as a separate block above results (now inside step 3)
- Copy/download buttons as a separate block (now inside step 4)

**Added JSX sections:**
- Step 1: Original CV text (collapsed)
- Step 2: Target role (collapsed)
- Placeholder sections at the bottom of pre-analysis state

**Mobile result:** Steps 1-2 collapsed take ~90px. Step 3 expanded shows score + summary. Step 4 expanded shows the new text immediately visible — user can start copying without excessive scrolling.

---

## INSTRUCTIONS FOR EXECUTION

1. `git pull origin master` first
2. Read `src/components/Analyzer.tsx` completely
3. Apply ALL changes described above in a single pass
4. Verify no TypeScript errors (`npx tsc --noEmit`)
5. Commit with message: `v5.1: Moments of truth redesign — collapsed steps, visible new text`
6. Push to master

Do NOT touch any other file. If something doesn't compile, fix it without changing the described structure.
