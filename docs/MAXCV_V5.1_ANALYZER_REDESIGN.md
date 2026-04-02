# MaxCV v5.1 — Analyzer Redesign Prompt

> Prompt for Claude Code to redesign the Analyzer component.
> Read this file completely before executing.
> Date: 2026-04-02

---

## Context

Read `docs/MAXCV_STYLE_GUIDE.md` first for visual rules.
Read `src/components/Analyzer.tsx` to understand the current implementation.
The component `src/components/ResumeText.tsx` already exists — use it.

---

## Critical Rules

1. **All copy must use "tú" (informal Spanish), never "su/usted".**
   Examples: "Analizar tu CV", "tu puntuación", "lo que ya funciona en tu CV".
2. **Do NOT exceed ~600 lines** in Analyzer.tsx. Extract sub-components if needed.
3. **Do NOT add dependencies.** Zero new packages.
4. **Import `ResumeText` from `@/components/ResumeText`** for rendering the improved CV.
   Delete the inline `ResumeText` function currently inside Analyzer.tsx.
   The external component uses inline styles (paddingLeft + textIndent) for bullet hanging indent.
   Do NOT use Tailwind classes for text-indent — they don't work in Tailwind v4.
5. **Push directly to master** when it compiles without errors.
6. **Style guide compliance:** no shadows, no gradients, no font-bold (max font-medium),
   borders 1px border-ink-100, rounded-lg, OKLCH color tokens.

---

## Part 1: Redesigned Input Form

The form has 3 visually numbered steps:

### Step ①: CV Input
A textarea with a modern, minimal design (inspired by Claude Desktop):
- Rounded border, blinking cursor on focus
- Placeholder text: "Pega el texto de tu CV aquí..." (ES) / "Paste your resume text here..." (EN)
- In the bottom-right corner of the textarea: a pill button with a clip icon (📎) 
  labeled "Adjuntar PDF" (ES) / "Attach PDF" (EN)
- Clicking the pill opens the file picker (PDF only)
- When a PDF is uploaded, the extracted text appears in the textarea
- PDF parsing uses the existing `/api/parse` endpoint (POST with FormData)

### Step ②: Target Role
Simple text input: "Puesto al que aspiras (opcional)" / "Target role (optional)"

### Step ③: Action Button  
CTA button: "Analizar tu CV y recomendar mejoras" / "Analyze your resume and suggest improvements"
- Accent color when ready, ink-100/ink-300 when disabled
- soft-pulse animation when ready

The step numbers ①②③ should appear as small circular badges in accent color,
positioned to the left of each field. Keep it subtle — not too large.

Below the button: privacy text + rate limit text (same as current).

---

## Part 2: Redesigned Results Layout

The results appear after analysis completes. New structure with collapsible sections:

### Score (always visible)
- Centered: `{score}/100 — puntuación actual` in mono font, ink-500, 13px
- Left-aligned below: the summary paragraph

### Block 1: "Análisis de tu CV" / "Analysis of your resume"
Subtitle: "Expande cada sección para ver el detalle" / "Expand each section for details"

Contains 3 **collapsible** sub-sections (all COLLAPSED by default):

- **1.1** "Resumen del análisis" / "Analysis summary"
  → Expands to show: `top_actions` as numbered list

- **1.2** "Lo que ya funciona bien" / "What already works well"  
  → Expands to show: `strengths` cards (green positive-ghost background)

- **1.3** "Oportunidades de mejora" / "Improvement opportunities"
  → Expands to show: `improvements` with dimension name, score, issue, suggestion, before/after

Each collapsed row shows: ▸ icon + title + subtle "tap to expand" affordance.
When expanded: ▾ icon + title + content below.

### Block 2: "Tu CV con mejoras" / "Your resume with improvements"

Contains 1 collapsible sub-section:

- **2.1** "Mejoras que aplicamos" / "Improvements we applied"
  → Expands to show: the `changes` list with + icons

Followed by (ALWAYS VISIBLE, never collapsed):

- **2.2** The full improved CV text rendered with `<ResumeText />`
  inside a bordered card
- Buttons: [Copiar/Copy] [Descargar para Word/Download for Word]
- Note: "Revísalo y realiza las correcciones que consideres necesarias en tu documento.
  Si quieres, vuélvelo a subir — puedes hacer 7 revisiones cada hora, ilimitadas por día."
  (EN: "Review it and make any corrections you see fit. Want to refine further?
  Upload it again — 7 reviews per hour, unlimited per day.")

### After the blocks:
- Donation CTA (same as current)
- "Empezar de nuevo" / "Start over" link

---

## Part 3: Accordion Behavior

Use a single `useState<string | null>` to track which section is open.
- `null` = all collapsed
- Click on a closed section → opens it, closes the previously open one
- Click on an open section → closes it

Animation: use CSS `max-height` transition + `overflow-hidden`.
Do NOT use animation libraries. Example pattern:

```tsx
<div 
  className="overflow-hidden transition-all duration-300 ease-in-out"
  style={{ maxHeight: isOpen ? "2000px" : "0" }}
>
  {/* content */}
</div>
```

---

## Part 4: Progress Bar

Keep the existing `ProgressBar` component (asymptotic progress bar).
- Shows ABOVE the input area (not below)
- "Leyendo tu PDF..." (~8s duration) when parsing
- "Analizando tu CV..." (~30s duration) when analyzing
- Input area hides during loading

---

## Part 5: Bilingual Strings

Maintain the existing `UI` object with ES and EN keys.
Add new strings needed for the redesign:
- `stepLabel1`, `stepLabel2`, `stepLabel3` (if showing step labels)
- `analysisBlockTitle`, `analysisBlockSub`
- `analysisSummaryTitle`
- `improvedBlockTitle`
- `changesSubTitle`
- `cvReadyTitle` (for the visible CV section 2.2)
- `attachPdf`
- Any other new strings needed

All new Spanish copy must use "tú" voice.

---

## Files to modify

1. `src/components/Analyzer.tsx` — full redesign per this spec
2. `src/components/ResumeText.tsx` — already exists, do NOT modify

## Files to NOT modify

- `src/app/api/analyze/route.ts`
- `src/app/api/parse/route.ts`  
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/lib/*`

---

## Verification

After implementing:
1. `npm run build` must pass with zero errors
2. PDF upload must work (sends to /api/parse, puts text in textarea)
3. Analysis must work (sends to /api/analyze, renders results)
4. Accordion expand/collapse must work
5. Copy and Download buttons must work
6. Language toggle must work
7. All text uses "tú" voice in Spanish

Push to master with message: "redesign: collapsible results, step-numbered input, Claude-style textarea"
