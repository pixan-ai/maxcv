"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Lang } from "@/lib/i18n";

const HOW_UI = {
  es: {
    heroTitle: "Cómo",
    heroAccent: "funciona",
    heroSub: "MaxCV es open source (MIT). Aquí puedes ver exactamente qué pasa cuando subes tu CV.",
    pipelineTitle: "El pipeline, paso a paso",
    steps: [
      { num: "01", title: "Subes tu CV", body: "Pegas texto o adjuntas un PDF en tu navegador. Si es PDF, se envía al backend donde Claude lo lee nativamente (sin librerías de parsing). Tu archivo nunca se guarda en disco." },
      { num: "02", title: "Sanitización de input", body: "El texto pasa por sanitizeInput() que elimina bytes nulos y caracteres de control. Se trunca a 35,000 caracteres máximo. Rate limiting: 7 peticiones/hora por IP (en memoria, sin base de datos)." },
      { num: "03", title: "Prompt constitucional", body: "Tu CV se envía a la API de Claude con un system prompt que incluye principios éticos explícitos: no discriminar, no inventar, no inflar scores, referenciar solo contenido real del CV. El prompt completo está en src/lib/prompts/analyze.txt — es auditable." },
      { num: "04", title: "Claude analiza y reescribe", body: "Un solo API call con temperature: 0 (determinístico). Claude devuelve JSON con: score (0-100), análisis en 6 dimensiones con evidencia, fortalezas, mejoras, y un CV completamente reescrito. Prompt caching activado para reducir costo y latencia." },
      { num: "05", title: "Validación y render", body: "El backend parsea el JSON, valida que tenga score + analysis + improved_cv, y lo devuelve al frontend. Si Claude no responde JSON válido, se muestra un error honesto — nunca resultados inventados." },
      { num: "06", title: "Resultado en tu navegador", body: "Ves tu score, las 6 dimensiones con criterios específicos (pass/warning/fail), sugerencias con before/after, y tu CV mejorado listo para copiar. Todo en tu navegador. Nada se almacena." },
    ],
    stackTitle: "Stack técnico",
    stackItems: [
      { label: "Frontend", value: "Next.js 16 + React 19 + Tailwind CSS 4" },
      { label: "Tipografía", value: "Geist + Geist Mono (Vercel)" },
      { label: "IA", value: "Claude API (Anthropic SDK)" },
      { label: "Deploy", value: "Vercel (auto-deploy en push a master)" },
      { label: "Analytics", value: "Vercel Analytics (anónimo, agregado)" },
      { label: "Base de datos", value: "Ninguna. Cero. Nada." },
      { label: "Dependencias", value: "6 deps de producción, 0 librerías UI externas" },
      { label: "Licencia", value: "MIT" },
    ],
    architectureTitle: "Arquitectura de archivos",
    architectureCode: `src/
├─ app/
│  ├─ api/analyze/route.ts  ← Endpoint principal (Claude API call)
│  ├─ api/parse/route.ts    ← PDF → texto (Claude nativo)
│  ├─ page.tsx              ← Página principal
│  ├─ privacy/page.tsx      ← Aviso de privacidad
│  ├─ terms/page.tsx        ← Términos de uso
│  ├─ security/page.tsx     ← Seguridad & privacidad
│  └─ how/page.tsx          ← Esta página
├─ components/
│  ├─ Analyzer.tsx          ← Componente principal (~300 líneas)
│  ├─ Header.tsx / Footer.tsx
│  └─ ResumeText.tsx        ← Render de texto con bullet indent
└─ lib/
   ├─ prompts/analyze.txt   ← System prompt constitucional
   ├─ i18n.ts               ← Todas las traducciones ES/EN
   ├─ rateLimit.ts          ← Rate limiting (in-memory)
   └─ apiUtils.ts           ← sanitizeInput + stripMarkdown`,
    principlesTitle: "Principios de diseño",
    principles: [
      { icon: "🔍", title: "Transparencia radical", body: "El código fuente está público. El prompt de IA está en el repo. Los pesos del scoring están documentados. Puedes verificar cada promesa que hacemos." },
      { icon: "🧠", title: "Anti-alucinación", body: "Cada sugerencia debe referenciar contenido real del CV. Si algo no está en tu CV, no se menciona. Consejo genérico = falla del sistema." },
      { icon: "⚖️", title: "Cero discriminación", body: "No penalizamos career gaps, caminos no lineales ni educación no tradicional. No inferimos género, edad, etnia ni nacionalidad." },
      { icon: "🛡️", title: "Privacidad por diseño", body: "Sin base de datos, sin cuentas, sin cookies de tracking. Tu CV existe solo durante el análisis y se descarta inmediatamente." },
    ],
    forkTitle: "Fork, clona, contribuye",
    forkBody: "MaxCV es MIT. Puedes clonarlo, modificarlo, y lanzar tu propia versión. Solo necesitas una API key de Anthropic.",
    forkCode: `git clone https://github.com/pixan-ai/maxcv.git
cd maxcv
npm install
echo "ANTHROPIC_API_KEY=tu-key" > .env.local
npm run dev`,
    forkLink: "Ver repositorio en GitHub →",
    updated: "Última actualización: Abril 2026",
  },
  en: {
    heroTitle: "How it",
    heroAccent: "works",
    heroSub: "MaxCV is open source (MIT). Here's exactly what happens when you upload your resume.",
    pipelineTitle: "The pipeline, step by step",
    steps: [
      { num: "01", title: "You upload your resume", body: "You paste text or attach a PDF in your browser. For PDFs, it's sent to the backend where Claude reads it natively (no parsing libraries). Your file is never saved to disk." },
      { num: "02", title: "Input sanitization", body: "The text goes through sanitizeInput() which strips null bytes and control characters. It's truncated to 35,000 characters max. Rate limiting: 7 requests/hour per IP (in-memory, no database)." },
      { num: "03", title: "Constitutional prompt", body: "Your resume is sent to Claude's API with a system prompt that includes explicit ethical principles: no discrimination, no fabrication, no inflated scores, reference only real CV content. The full prompt is in src/lib/prompts/analyze.txt \u2014 it's auditable." },
      { num: "04", title: "Claude analyzes and rewrites", body: "A single API call with temperature: 0 (deterministic). Claude returns JSON with: score (0-100), analysis across 6 dimensions with evidence, strengths, improvements, and a completely rewritten resume. Prompt caching enabled to reduce cost and latency." },
      { num: "05", title: "Validation and render", body: "The backend parses the JSON, validates that it has score + analysis + improved_cv, and returns it to the frontend. If Claude doesn't respond with valid JSON, an honest error is shown \u2014 never fabricated results." },
      { num: "06", title: "Results in your browser", body: "You see your score, the 6 dimensions with specific criteria (pass/warning/fail), suggestions with before/after, and your improved resume ready to copy. All in your browser. Nothing is stored." },
    ],
    stackTitle: "Tech stack",
    stackItems: [
      { label: "Frontend", value: "Next.js 16 + React 19 + Tailwind CSS 4" },
      { label: "Typography", value: "Geist + Geist Mono (Vercel)" },
      { label: "AI", value: "Claude API (Anthropic SDK)" },
      { label: "Deploy", value: "Vercel (auto-deploy on push to master)" },
      { label: "Analytics", value: "Vercel Analytics (anonymous, aggregate)" },
      { label: "Database", value: "None. Zero. Nada." },
      { label: "Dependencies", value: "6 production deps, 0 external UI libraries" },
      { label: "License", value: "MIT" },
    ],
    architectureTitle: "File architecture",
    architectureCode: `src/
├─ app/
│  ├─ api/analyze/route.ts  ← Main endpoint (Claude API call)
│  ├─ api/parse/route.ts    ← PDF → text (Claude native)
│  ├─ page.tsx              ← Main page
│  ├─ privacy/page.tsx      ← Privacy notice
│  ├─ terms/page.tsx        ← Terms of use
│  ├─ security/page.tsx     ← Security & privacy
│  └─ how/page.tsx          ← This page
├─ components/
│  ├─ Analyzer.tsx          ← Main component (~300 lines)
│  ├─ Header.tsx / Footer.tsx
│  └─ ResumeText.tsx        ← Text renderer with bullet indent
└─ lib/
   ├─ prompts/analyze.txt   ← Constitutional system prompt
   ├─ i18n.ts               ← All translations ES/EN
   ├─ rateLimit.ts          ← Rate limiting (in-memory)
   └─ apiUtils.ts           ← sanitizeInput + stripMarkdown`,
    principlesTitle: "Design principles",
    principles: [
      { icon: "🔍", title: "Radical transparency", body: "Source code is public. The AI prompt is in the repo. Scoring weights are documented. You can verify every claim we make." },
      { icon: "🧠", title: "Anti-hallucination", body: "Every suggestion must reference real CV content. If something isn't in your resume, it's not mentioned. Generic advice = system failure." },
      { icon: "⚖️", title: "Zero discrimination", body: "We don't penalize career gaps, non-linear paths, or non-traditional education. We don't infer gender, age, ethnicity, or nationality." },
      { icon: "🛡️", title: "Privacy by design", body: "No database, no accounts, no tracking cookies. Your resume exists only during analysis and is discarded immediately." },
    ],
    forkTitle: "Fork, clone, contribute",
    forkBody: "MaxCV is MIT licensed. You can clone it, modify it, and launch your own version. You only need an Anthropic API key.",
    forkCode: `git clone https://github.com/pixan-ai/maxcv.git
cd maxcv
npm install
echo "ANTHROPIC_API_KEY=your-key" > .env.local
npm run dev`,
    forkLink: "View repository on GitHub →",
    updated: "Last updated: April 2026",
  },
} as const;

export default function HowPage() {
  const [lang, setLang] = useState<Lang>("es");
  const t = HOW_UI[lang];

  return (
    <div className="min-h-screen flex flex-col bg-ink-000">
      <Header lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-8">
        {/* Hero */}
        <section className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-3 text-ink-900">
            <span className="hero-reveal-1 inline-block">{t.heroTitle}</span>{" "}
            <span className="hero-reveal-2 inline-block text-accent">{t.heroAccent}</span>
          </h1>
          <p className="hero-reveal-3 text-ink-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">{t.heroSub}</p>
        </section>

        {/* Pipeline */}
        <section className="mb-12">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.pipelineTitle}</h2>
          <div className="space-y-3">
            {t.steps.map((step, i) => (
              <div key={i} className="border border-ink-100 rounded-xl p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs text-accent font-medium mt-0.5 shrink-0">{step.num}</span>
                  <div>
                    <h3 className="text-sm font-medium text-ink-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-ink-500 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="mb-12">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.stackTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6">
            <div className="space-y-2.5">
              {t.stackItems.map((item, i) => (
                <div key={i} className="flex items-baseline gap-3 text-sm">
                  <span className="text-ink-400 font-mono text-xs shrink-0 w-24">{item.label}</span>
                  <span className="text-ink-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-12">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.architectureTitle}</h2>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6 bg-ink-050">
            <pre className="text-xs font-mono text-ink-600 leading-relaxed overflow-x-auto">{t.architectureCode}</pre>
          </div>
        </section>

        {/* Principles */}
        <section className="mb-12">
          <h2 className="text-lg font-medium text-ink-900 mb-4">{t.principlesTitle}</h2>
          <div className="space-y-3">
            {t.principles.map((p, i) => (
              <div key={i} className="border border-ink-100 rounded-xl p-5 sm:p-6">
                <div className="flex items-start gap-3.5">
                  <span className="text-lg leading-none mt-0.5 shrink-0">{p.icon}</span>
                  <div>
                    <h3 className="text-sm font-medium text-ink-900 mb-1">{p.title}</h3>
                    <p className="text-sm text-ink-500 leading-relaxed">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fork */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-ink-900 mb-3">{t.forkTitle}</h2>
          <p className="text-sm text-ink-500 leading-relaxed mb-4">{t.forkBody}</p>
          <div className="border border-ink-100 rounded-xl p-5 sm:p-6 bg-ink-050 mb-4">
            <pre className="text-xs font-mono text-ink-600 leading-relaxed overflow-x-auto">{t.forkCode}</pre>
          </div>
          <a href="https://github.com/pixan-ai/maxcv" target="_blank" rel="noopener noreferrer"
            className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.forkLink}</a>
        </section>

        <p className="text-xs text-ink-300">{t.updated}</p>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
