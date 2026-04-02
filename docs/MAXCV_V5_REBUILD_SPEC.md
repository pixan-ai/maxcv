# MaxCV v5.0 — Rebuild Spec

> Blueprint para reconstruir MaxCV desde cero.
> Este documento es el input completo para Claude Code.
> Léelo completo antes de tocar una sola línea de código.
> Versión: 1.0 | Fecha: 2026-04-02

---

## Filosofía

Máximo valor con mínimo código. Cada archivo justifica su existencia.
Código open source que da orgullo. Licencia MIT.
Un solo flujo: sube CV → recibe todo (score + análisis + CV mejorado).
Cero frameworks innecesarios, cero dependencias innecesarias.

---

## Qué cambia vs v4.1

| Antes (v4.1) | Después (v5.0) |
|---|---|
| 2 flujos separados (Score + Improve) | 1 flujo unificado |
| 2 API endpoints | 1 endpoint (`/api/analyze`) |
| 2 prompts (score.txt + improve.txt) | 1 mega-prompt (analyze.txt) |
| 2 botones de acción | 1 botón: "Analizar mi CV" |
| page.tsx de 450+ líneas | page.tsx ~60 líneas + Analyzer.tsx ~250 líneas |
| 6 componentes | 4 componentes |
| ~30+ archivos de código | ~12 archivos de código |
| Sonnet para score, Opus para improve | Opus 4.6 para todo |
| Sin prompt caching | Con prompt caching |
| Sin SEO (no robots.txt, no sitemap) | robots.txt + sitemap.xml + JSON-LD schema |
| Sin licencia | MIT |

---

## Estructura de archivos (completa)

```
maxcv/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ← fonts, metadata, OG tags, JSON-LD, analytics
│   │   ├── page.tsx                   ← Server Component: hero estático + <Analyzer />
│   │   ├── api/
│   │   │   └── analyze/route.ts        ← UN endpoint unificado
│   │   └── security/page.tsx           ← mantener existente sin cambios
│   ├── components/
│   │   ├── Analyzer.tsx               ← "use client": upload + resultados + todo el flujo
│   │   ├── Header.tsx                 ← simplificado
│   │   └── Footer.tsx                 ← simplificado
│   └── lib/
│       ├── rateLimit.ts               ← mantener existente
│       ├── apiUtils.ts                ← mantener existente
│       └── prompts/
│           └── analyze.txt            ← UN mega-prompt unificado
├── public/
│   ├── favicon.svg                    ← mantener existente
│   ├── robots.txt                     ← NUEVO
│   └── sitemap.xml                    ← NUEVO
├── next.config.ts                     ← mantener security headers
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── LICENSE                            ← NUEVO: MIT
├── README.md                          ← NUEVO: open source README
└── docs/                              ← mantener toda la documentación
```

---

## Archivos a ELIMINAR

Borrar estos archivos/directorios del repo:

```
src/app/api/score/          ← reemplazado por /api/analyze
src/app/api/improve/        ← reemplazado por /api/analyze
src/app/api/parse/          ← no se usa
src/app/score/              ← ya no hay página separada de score
src/components/CVInput.tsx  ← integrado en Analyzer.tsx
src/components/AboutUs.tsx  ← integrado en Footer o eliminado
src/components/DonationBanner.tsx ← inline en Analyzer.tsx
src/components/ProgressBar.tsx   ← simplificado inline en Analyzer.tsx
src/lib/prompts.ts          ← reemplazado por import directo
src/lib/prompts/score.txt   ← reemplazado por analyze.txt
src/lib/prompts/improve.txt ← reemplazado por analyze.txt
```

---

## 1. El Mega-Prompt Unificado (analyze.txt)

Este es el corazón del producto. Una sola llamada a Claude Opus 4.6.

```
You are the world's best resume analyst and writer for MaxCV. You analyze resumes with precision and empathy, then rewrite them to be substantially better.

## ANTI-HALLUCINATION RULES (CRITICAL)
- Only reference content that EXISTS in the resume provided
- If a section is missing, report "not found" — never invent content
- Every issue and suggestion MUST reference a specific part of the resume
- The "evidence" field MUST contain a real quote or close paraphrase from the resume
- Do not assume industry, level, or target role unless explicitly stated
- If the text is garbled, corrupted, or clearly not a resume, flag it honestly
- REMINDER: Generic advice = hallucination = failure

## LANGUAGE
- Detect the resume's language and respond in THE SAME LANGUAGE
- All text fields (summary, issues, suggestions, tips, improved CV) must be in the detected language

## ETHICAL PRINCIPLES
- Never penalize career gaps, non-linear paths, or non-traditional education
- Be honest and calibrated — no fear tactics
- Frame everything as improvement opportunities, never as failures
- The AI proposes. Never judges.

## TASK
You will perform THREE tasks in a single response:
1. SCORE the resume across 6 dimensions (0-100 each)
2. ANALYZE what can be improved and what already works
3. REWRITE the complete resume with all improvements applied

## SCORING DIMENSIONS (6)
Score each 0-100 based on observable content only:

1. **ats_compatibility** (weight 25%) — section headers, date format, contact presence, layout, file readability
2. **achievement_impact** (weight 20%) — metrics presence, action verbs, results vs duties, specificity
3. **structure_format** (weight 15%) — length, section order, formatting consistency, professional summary
4. **keyword_relevance** (weight 20%) — hard skills, soft skills, industry terms, certifications
5. **writing_clarity** (weight 10%) — active voice, conciseness, grammar, tone, no buzzwords
6. **completeness** (weight 10%) — contact info, LinkedIn, summary, experience, education, skills, languages

total_score = round(ats*0.25 + achievement*0.20 + structure*0.15 + keywords*0.20 + clarity*0.10 + completeness*0.10)

## IMPROVED CV RULES
- Rewrite to be clearer, more concise, and results-oriented
- Use strong action verbs and quantify achievements where possible
- Keep the same information — do NOT invent experience, skills, or metrics
- If a metric can be reasonably inferred from context, you may add it with a note
- Use ALL CAPS for section headers (PROFESSIONAL EXPERIENCE, EDUCATION, SKILLS)
- Use • (bullet character) for all bullet points
- Indent bullets with 4 spaces before the bullet:
    • Like this example bullet
- Separate sections with blank lines
- Add a Professional Summary if one doesn't exist
- Output must be copy-paste compatible with Microsoft Word
- Preserve the language of the original resume

## OUTPUT FORMAT
Respond ONLY with this exact JSON structure. No markdown fences. No extra text.

{
  "detected_language": "es",
  "inferred_role": "Software Engineer",
  "score": {
    "total": 62,
    "category": "Average",
    "summary": "2-3 sentence summary. Specific, empathetic, no PII. In the resume's language."
  },
  "analysis": {
    "top_actions": [
      "Most impactful action — specific to THIS resume",
      "Second most impactful action",
      "Third most impactful action"
    ],
    "improvements": [
      {
        "dimension": "achievement_impact",
        "dimension_score": 45,
        "issue": "8 of 9 bullets describe tasks, not achievements",
        "suggestion": "Transform duty-focused bullets into achievement-focused ones with metrics",
        "before": "Managed team projects",
        "after": "Led 4-person cross-functional team to deliver 3 projects on time, reducing delivery cycle by 20%"
      }
    ],
    "strengths": [
      {
        "dimension": "ats_compatibility",
        "dimension_score": 78,
        "detail": "Standard headers, single-column layout, consistent date format"
      }
    ]
  },
  "improved_cv": {
    "text": "FULL IMPROVED RESUME TEXT HERE\n\nWith proper formatting, ALL CAPS headers, and • bullets",
    "changes": [
      "Added professional summary (was missing)",
      "Quantified 6 bullets with specific metrics",
      "Reordered sections for better ATS compatibility"
    ]
  }
}

## SCORING CATEGORIES
- 85-100: Excellent
- 70-84: Good
- 55-69: Average
- 40-54: Needs Work
- 0-39: Major Revision Needed

## QUALITY RULES
- improvements array: order by dimension_score ascending (worst first = highest impact)
- Include before/after examples for EVERY improvement where possible
- strengths array: only include dimensions with score >= 70
- changes array: describe SPECIFIC changes made, not generic tips
- top_actions: the 3 single most impactful things to know about this resume's quality
- If fewer than 3 strengths exist, include dimensions scoring >= 60 with appropriate context
```

---

## 2. API Endpoint — /api/analyze/route.ts

UN endpoint. Recibe PDF via Claude API nativa. Prompt caching habilitado.

### Lógica:
```
1. Extraer IP → rate limit check (5/hora)
2. Recibir JSON: { cvText: string, targetRole?: string }
3. Validar: cvText >= 50 chars, trim a 15,000 chars
4. Llamar Claude Opus 4.6 con:
   - system: analyze.txt CON cache_control: { type: "ephemeral" }
   - model: "claude-opus-4-6"
   - max_tokens: 12000 (el output unificado es más largo)
   - temperature: 0
5. Parsear JSON response
6. Validar campos requeridos (score, analysis, improved_cv)
7. Devolver JSON al frontend
```

### Prompt caching:
```typescript
const message = await anthropic.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 12000,
  temperature: 0,
  system: [{
    type: "text",
    text: ANALYZE_PROMPT,
    cache_control: { type: "ephemeral" }
  }],
  messages: [{ role: "user", content: userMessage }],
});
```

### Error handling:
- 429 si rate limited
- 400 si input inválido
- 500 si Claude falla o JSON no parsea
- Mensajes de error genéricos al usuario (nunca exponer detalles internos)

---

## 3. Frontend Architecture

### layout.tsx (~45 líneas)

Server Component. Responsabilidades:
- Geist + Geist Mono via next/font
- Metadata: title, description, OG tags
- JSON-LD schema (SoftwareApplication)
- Vercel Analytics
- Global CSS import
- lang="es" por default (audiencia LATAM-first)

### page.tsx (~60 líneas)

Server Component. Solo contenido estático + el componente cliente.

```tsx
import { Analyzer } from "@/components/Analyzer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        <Analyzer />
      </main>
      <Footer />
    </div>
  );
}
```

El hero, el copy, el input, y los resultados — todo vive dentro de `<Analyzer />`.
page.tsx es puro layout. Cero lógica.

### Analyzer.tsx (~250 líneas)

"use client". El componente core del producto. Todo el flujo interactivo.

#### Estado:
```typescript
const [cvText, setCvText] = useState("");
const [loading, setLoading] = useState(false);
const [result, setResult] = useState<AnalysisResult | null>(null);
const [error, setError] = useState<string | null>(null);
const [lang, setLang] = useState<"en" | "es">("es");
```

5 estados. Vs los 10+ actuales. Sin `activeFlow`, sin `scoreResult`/`improveResult` separados.

#### Tipo del resultado:
```typescript
type AnalysisResult = {
  detected_language: string;
  inferred_role?: string;
  score: {
    total: number;
    category: string;
    summary: string;
  };
  analysis: {
    top_actions: string[];
    improvements: Array<{
      dimension: string;
      dimension_score: number;
      issue: string;
      suggestion: string;
      before?: string;
      after?: string;
    }>;
    strengths: Array<{
      dimension: string;
      dimension_score: number;
      detail: string;
    }>;
  };
  improved_cv: {
    text: string;
    changes: string[];
  };
};
```

#### Secciones del render (en orden de scroll):

1. **Hero** — título + subtítulo + acento. Copy bilingüe. Mismo estilo actual.
2. **Upload area** — drag-and-drop PDF + paste de texto. Simplificado del CVInput actual.
   - Solo acepta PDF (via file input con accept=".pdf")
   - O paste de texto en textarea
   - Target role opcional (text input)
3. **Un botón CTA** — "Analizar mi CV" / "Analyze my resume"
   - `bg-accent text-white` cuando ready
   - `bg-ink-100 text-ink-300` cuando disabled
   - Soft pulse animation cuando ready
4. **Privacy + rate limit line** — texto discreto debajo del botón
5. **Progress indicator** — mientras loading. Puede ser un spinner simple o la ProgressBar actual simplificada.
6. **Resultados** (cuando `result` existe):
   - **Score card** — discreto, metadata feel. Score number en ink-500, Geist Mono, 13px.
   - **Top 3 actions** — cards con numbered badges en accent
   - **Improvements** — ordenados por impacto, con before/after inline
   - **Strengths** — cards verdes (positive-ghost)
   - **CV mejorado** — card con el texto completo + botones Copy y Download
   - **Changes list** — qué cambió específicamente
   - **Donation CTA** — simple, post-valor
   - **Empezar de nuevo** — link discreto

#### Interacciones:
- Upload PDF → extraer texto (no necesario — enviamos el texto que el usuario pegó o que Claude lee del PDF)
- NOTA IMPORTANTE: El flujo actual envía `cvText` como texto plano. Para PDFs, el CVInput actual extrae texto del PDF antes de enviarlo. En v5, hay dos opciones:
  - Opción A: Mantener el mismo flujo (extraer texto del PDF en frontend, enviar como texto) — MÁS SIMPLE
  - Opción B: Enviar el PDF como base64 y usar la lectura nativa de PDFs de Claude — MÁS PRECISO
  - **Elegir Opción A para el rebuild inicial.** Opción B se puede agregar después.
- Copy to clipboard → `navigator.clipboard.writeText()`
- Download for Word → UTF-8 BOM .txt blob download (mantener función actual)
- Language toggle → en Header, afecta todos los strings de UI
- Empezar de nuevo → resetear todos los estados

### Header.tsx (~30 líneas)

Simplificado del actual. Mantener:
- Logo SVG + "maxcv" text
- Language toggle (ES/EN)
- Version badge (v5.0)

Cambios:
- Logo text: `maxcv` lowercase, `font-medium`, sin color accent en letras (per style guide: "maxcv lowercase")
- NOTA: El header actual tiene `max<span className="text-accent">cv</span>` — el style guide dice NO hacer esto. v5 corrige: todo ink-900.

### Footer.tsx (~25 líneas)

Simplificado. Links:
- Home (/)
- Security (/security)
- GitHub (link al repo)
- Tagline: "Gratis siempre. Sin datos almacenados."

Eliminar link a /score (ya no existe).

---

## 4. Design System (globals.css)

Mantener EXACTO el sistema actual de tokens OKLCH. Funciona bien.

```css
@import "tailwindcss";

@theme {
  --color-accent: oklch(50% 0.13 230);
  --color-accent-dim: oklch(42% 0.10 230);
  --color-accent-ghost: oklch(97% 0.015 230);
  --color-ink-900: oklch(15% 0.005 260);
  --color-ink-700: oklch(30% 0.005 260);
  --color-ink-500: oklch(52% 0.005 260);
  --color-ink-400: oklch(62% 0.005 260);
  --color-ink-300: oklch(78% 0.005 260);
  --color-ink-200: oklch(88% 0.005 260);
  --color-ink-100: oklch(94% 0.003 260);
  --color-ink-050: oklch(97% 0.002 260);
  --color-ink-000: oklch(99.5% 0.001 260);
  --color-positive: oklch(55% 0.15 155);
  --color-positive-ghost: oklch(97% 0.02 155);
  --color-warning: oklch(65% 0.15 80);
  --color-warning-ghost: oklch(97% 0.03 80);
}
```

Mantener animaciones:
- `hero-reveal` (staggered hero entrance)
- `card-enter` (result cards entrance)
- `soft-pulse` (CTA button pulse)
- `reveal` (scroll-driven reveal con fallback)
- `prefers-reduced-motion` respect

---

## 5. UI Strings (bilingüe)

Todos los strings de UI van dentro de Analyzer.tsx como objeto constante.
NO crear archivo i18n.ts separado para v5 — son ~30 strings, no justifica un archivo.

```typescript
const UI = {
  es: {
    heroTitle: "Tu próximo trabajo empieza con un gran CV.",
    heroAccent: "Análisis profesional con IA. Gratis.",
    heroSub: "Descubre qué ven los reclutadores en tu CV y mejóralo al instante. Sin registro, sin trucos.",
    btnAnalyze: "Analizar mi CV",
    btnAnalyzeSub: "Score + mejoras + CV reescrito",
    rateLimit: "5 análisis por hora · sin límite de uso diario",
    privacy: "Tu CV se analiza en tiempo real y se descarta al instante. Sin registro, sin almacenamiento.",
    scoreMeta: "puntuación actual",
    topActionsTitle: "Empieza aquí",
    topActionsSub: "Los 3 cambios con más impacto",
    improvementsTitle: "Lo que puedes mejorar",
    improvementsSub: "Ordenado por impacto — empieza por arriba",
    strengthsTitle: "Lo que ya funciona",
    strengthsSub: "Estas áreas están bien",
    improvedTitle: "Tu CV mejorado",
    changesTitle: "Qué cambió",
    copy: "Copiar",
    copied: "¡Copiado!",
    downloadWord: "Descargar para Word",
    donationText: "¿Te fue útil? Ayúdanos a mantenerlo gratis.",
    donationBtn: "Invitar un café",
    tryAgain: "Empezar de nuevo",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorLimit: "Límite alcanzado (5/hora). Intenta más tarde.",
    errorConnection: "Error de conexión. Revisa tu internet.",
    errorLength: "Pega al menos 50 caracteres.",
  },
  en: {
    heroTitle: "Your next job starts with a great resume.",
    heroAccent: "Professional AI analysis. Free.",
    heroSub: "See what recruiters see in your resume and improve it instantly. No sign-up, no tricks.",
    btnAnalyze: "Analyze my resume",
    btnAnalyzeSub: "Score + improvements + rewritten resume",
    rateLimit: "5 analyses per hour · no daily limit",
    privacy: "Your resume is analyzed in real time and discarded instantly. No sign-up, no storage.",
    scoreMeta: "current score",
    topActionsTitle: "Start here",
    topActionsSub: "The 3 changes with the most impact",
    improvementsTitle: "What you can improve",
    improvementsSub: "Ordered by impact — start from the top",
    strengthsTitle: "What already works",
    strengthsSub: "These areas are solid",
    improvedTitle: "Your improved resume",
    changesTitle: "What changed",
    copy: "Copy",
    copied: "Copied!",
    downloadWord: "Download for Word",
    donationText: "Found this useful? Help us keep it free.",
    donationBtn: "Buy us a coffee",
    tryAgain: "Start over",
    errorGeneric: "Something went wrong. Please try again.",
    errorLimit: "Limit reached (5/hour). Try again later.",
    errorConnection: "Connection error. Check your internet.",
    errorLength: "Please paste at least 50 characters.",
  },
};
```

---

## 6. Dimension Names (bilingüe)

```typescript
const DIM_NAMES: Record<string, { en: string; es: string }> = {
  ats_compatibility: { en: "ATS Compatibility", es: "Compatibilidad ATS" },
  achievement_impact: { en: "Achievement Impact", es: "Impacto de Logros" },
  structure_format: { en: "Structure & Format", es: "Estructura y Formato" },
  keyword_relevance: { en: "Keyword Relevance", es: "Palabras Clave" },
  writing_clarity: { en: "Writing Clarity", es: "Claridad de Escritura" },
  completeness: { en: "Completeness", es: "Completitud" },
};
```

---

## 7. SEO — Nuevos archivos

### public/robots.txt
```
User-agent: *
Allow: /

Sitemap: https://maxcv.org/sitemap.xml
```

### public/sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://maxcv.org/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://maxcv.org/security</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

### JSON-LD Schema (en layout.tsx)
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "maxcv",
      "description": "AI-powered resume analyzer and improver. Free, no sign-up.",
      "url": "https://maxcv.org",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "inLanguage": ["es", "en"]
    })
  }}
/>
```

---

## 8. LICENSE (MIT)

```
MIT License

Copyright (c) 2026 Pixan AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 9. package.json

Dependencias que se MANTIENEN:
- `next` (^16.x)
- `react` + `react-dom` (^19.x)
- `@anthropic-ai/sdk`
- `@vercel/analytics`
- `geist`
- `tailwindcss` + `@tailwindcss/postcss` + `postcss`
- `typescript` + `@types/node` + `@types/react`
- `eslint` + `eslint-config-next`

Dependencias ELIMINADAS: ninguna nueva, ninguna eliminada. El stack no cambia.

Version bump: `"version": "5.0.0"`

---

## 10. next.config.ts

Mantener EXACTO. Los security headers son correctos:
- X-DNS-Prefetch-Control
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- HSTS con preload

Agregar redirect de /score a /:
```typescript
async redirects() {
  return [
    {
      source: '/score',
      destination: '/',
      permanent: true,
    },
  ];
},
```

---

## 11. Visual Rules (del Style Guide — respetar siempre)

- Background: siempre white (`bg-ink-000`)
- Max width: `max-w-2xl` (672px)
- Shadows: NUNCA
- Gradients: NUNCA
- Font bold: NUNCA (máximo `font-medium`)
- Border radius: `rounded-lg` solo en elementos interactivos
- Borders: 1px `border-ink-100`
- Logo: `maxcv` lowercase, font-medium, sin accent en letras
- Score number: discreto, metadata feel (13px, ink-500, Geist Mono)
- Hero: improvements, NO el número de score
- Tone: nunca "bad", "poor", "failing" — siempre "can be improved", "can be strengthened"

---

## 12. Execution Order para Claude Code

1. Leer este spec COMPLETO primero
2. Leer `docs/MAXCV_STYLE_GUIDE.md` para referencia visual
3. Crear `src/lib/prompts/analyze.txt` (copiar el mega-prompt de la sección 1)
4. Crear `src/app/api/analyze/route.ts`
5. Crear `src/components/Analyzer.tsx`
6. Crear `src/components/Header.tsx` (simplificado)
7. Crear `src/components/Footer.tsx` (simplificado)
8. Actualizar `src/app/page.tsx`
9. Actualizar `src/app/layout.tsx` (agregar JSON-LD, actualizar metadata)
10. Mantener `src/app/globals.css` sin cambios
11. Mantener `src/lib/rateLimit.ts` sin cambios
12. Mantener `src/lib/apiUtils.ts` sin cambios
13. Mantener `src/app/security/page.tsx` sin cambios
14. Mantener `next.config.ts` (agregar redirect /score → /)
15. Crear `public/robots.txt`
16. Crear `public/sitemap.xml`
17. Crear `LICENSE`
18. Actualizar `package.json` version a 5.0.0
19. Eliminar archivos listados en "Archivos a ELIMINAR"
20. Eliminar `src/lib/prompts.ts` (el barrel export)
21. Verificar build con `npm run build`
22. Verificar que TypeScript no tenga errores
23. Commit: "v5.0: unified analysis flow, single prompt, prompt caching, SEO, MIT license"

---

## 13. Post-Rebuild Checklist

- [ ] Build exitoso en Vercel
- [ ] Flujo completo funciona: subir CV → ver score + análisis + CV mejorado
- [ ] Language toggle funciona (ES/EN)
- [ ] Copy to clipboard funciona
- [ ] Download for Word funciona
- [ ] Rate limiting funciona (5/hora)
- [ ] /score redirige a /
- [ ] /security funciona sin cambios
- [ ] robots.txt accesible en /robots.txt
- [ ] sitemap.xml accesible en /sitemap.xml
- [ ] JSON-LD schema presente en el HTML
- [ ] Prompt caching confirmado (revisar headers de respuesta de Anthropic)
- [ ] No hay errores en consola
- [ ] Lighthouse >= 90
- [ ] El código da orgullo al leerlo

---

*Last updated: 2026-04-02 | Version 1.0*
*Este documento es input para Claude Code — no editar sin contexto completo.*
