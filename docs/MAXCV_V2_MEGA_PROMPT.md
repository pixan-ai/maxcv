# MaxCV v2.0 — Mega Prompt para Claude Code

> Lee este prompt completo antes de tocar cualquier archivo.
> Repo: github.com/pixan-ai/maxcv | Branch: master | Auto-deploy: Vercel → dev.maxcv.org

---

## 0. CONTEXTO OBLIGATORIO — Lee primero

Antes de escribir una sola línea de código, lee estos archivos del repo:

```
docs/MAXCV_PROJECT_BIBLE.md      — Source of truth del proyecto
docs/MAXCV_STYLE_GUIDE.md        — Design system (referencia, el código real usa ink-* palette)
docs/MAXCV_SCORE_PROMPT.md       — Prompt de scoring
docs/MAXCV_PRINCIPLES_PAGE.md    — Principios éticos
docs/MAXCV_BACKLOG.md            — Backlog actual
CLAUDE.md                        — Guía para Claude Code
```

El design system REAL del código (no el style guide doc, que está desactualizado) usa:
- **Fuentes:** Geist (sans) + Geist Mono — via `next/font/google`, variables `--font-geist` y `--font-mono`
- **Palette:** `ink-*` (000 a 900) + `accent` (steel blue OKLCH) + `positive`/`warning` — definidos en `globals.css` con `@theme {}`
- **Radios:** `rounded-xl` (no `rounded-lg`)
- **Container:** `max-w-2xl mx-auto px-5`
- **Logo:** `max` ink-900 + `cv` accent, font-mono, lowercase
- **Filosofía:** "Tipográfico puro" — Camino D (Tailwind disciplinado + motion.dev + CSS nativo). Sin shadcn, sin Aceternity, sin component libraries externas.

---

## 1. ARQUITECTURA v2.0 — Una sola página, dos flujos

### Cambio principal
Actualmente hay dos páginas separadas (`/` = Improve, `/score` = Score). En v2.0, **todo vive en una sola página `/`** con dos CTAs principales:

```
[Hero]
  ↓
[CVInput — subir PDF o pegar texto]
  ↓
[Dos botones lado a lado:]
  ┌──────────────────────┐  ┌────────────────────────┐
  │  Analiza mi CV       │  │  Reescríbelo por mí    │
  │  Score + tips        │  │  CV mejorado listo     │
  └──────────────────────┘  └────────────────────────┘
```

**Flujo A — "Analiza mi CV" (Score):**
1. Usuario sube CV → click "Analiza mi CV"
2. Barra de progreso real durante análisis (~15-25 segundos)
3. Resultado: score + dimensiones expandidas + recomendaciones
4. AL FINAL del resultado del score, aparece un CTA prominente: "¿Quieres que lo mejore por ti?" → botón "Reescríbelo por mí"
5. Si hace click, usa el mismo CV ya cargado y ejecuta el flujo B

**Flujo B — "Reescríbelo por mí" (Improve):**
1. Usuario sube CV → click "Reescríbelo por mí"
2. Barra de progreso real durante mejora (~10-20 segundos)
3. Resultado: CV mejorado completo + tips + botón copiar/descargar Word
4. AL FINAL del resultado, aparece CTA: "¿Quieres ver tu nuevo score?" → botón "Analiza mi CV"

### Rate limiting visible
Debajo de los dos botones principales, mostrar un texto discreto:
- ES: `Máximo 5 análisis por hora por usuario`
- EN: `Maximum 5 analyses per hour per user`

### Redirect /score → /
Crear `src/app/score/page.tsx` que simplemente haga redirect:

```tsx
import { redirect } from 'next/navigation'
export default function ScorePage() { redirect('/') }
```

---

## 2. COPY MEJORADO — Análisis de marketing

### Problemas del copy actual:
1. **"Improve your resume. Free, forever."** — "Free, forever" suena defensivo, como justificando el precio. La gente no busca "free forever", busca que su CV funcione.
2. **"Nuestra IA reescribe tu CV pensando en los sistemas de filtrado automático (ATS)"** — Demasiado técnico. El 80% de los job seekers no saben qué es un ATS. Hay que explicar el beneficio, no la tecnología.
3. **Botón "Mejorar mi currículum"** — Genérico. No comunica qué va a pasar.
4. **Sin urgencia emocional** — Los job seekers están ansiosos. El copy actual no conecta con esa emoción.

### Copy v2.0 recomendado:

**Hero ES:**
```
Título: Tu próximo trabajo empieza con un gran CV.
Accent: Análisis profesional con IA. Gratis.
Subtítulo: Descubre qué ven los reclutadores en tu CV y mejóralo al instante. Sin registro, sin trucos.
```

**Hero EN:**
```
Title: Your next job starts with a great resume.
Accent: Professional AI analysis. Free.
Subtitle: See what recruiters see in your resume and improve it instantly. No sign-up, no tricks.
```

**Botón Score:**
- ES: `Analiza mi CV` (subtexto: "Score + recomendaciones")
- EN: `Analyze my resume` (subtexto: "Score + recommendations")

**Botón Improve:**
- ES: `Reescríbelo por mí` (subtexto: "CV mejorado listo para enviar")
- EN: `Rewrite it for me` (subtexto: "Improved resume ready to send")

**CTA post-score:**
- ES: `¿Quieres que lo reescriba por ti? →`
- EN: `Want me to rewrite it for you? →`

**CTA post-improve:**
- ES: `¿Quieres ver el score de tu CV mejorado? →`
- EN: `Want to see your improved resume's score? →`

**Privacy line:**
- ES: `Tu CV se analiza en tiempo real y se descarta al instante. Sin registro, sin almacenamiento.`
- EN: `Your resume is analyzed in real time and discarded instantly. No sign-up, no storage.`

**Rate limit note:**
- ES: `5 análisis por hora · sin límite de uso diario`
- EN: `5 analyses per hour · no daily usage limit`

---

## 3. BARRA DE PROGRESO REAL

No usar un spinner genérico. Implementar una barra de progreso que simule las etapas reales del proceso:

```tsx
const STAGES_ES = [
  { label: "Leyendo tu CV...", pct: 15, duration: 2000 },
  { label: "Analizando estructura...", pct: 35, duration: 3000 },
  { label: "Evaluando contenido...", pct: 60, duration: 5000 },
  { label: "Generando recomendaciones...", pct: 85, duration: 4000 },
  { label: "Finalizando...", pct: 95, duration: 3000 },
];

const STAGES_EN = [
  { label: "Reading your resume...", pct: 15, duration: 2000 },
  { label: "Analyzing structure...", pct: 35, duration: 3000 },
  { label: "Evaluating content...", pct: 60, duration: 5000 },
  { label: "Generating recommendations...", pct: 85, duration: 4000 },
  { label: "Finalizing...", pct: 95, duration: 3000 },
];
```

La barra avanza automáticamente por las etapas con transiciones suaves. Cuando la API responde, salta a 100% con un ease-out rápido.

**Diseño de la barra:**
- Background: `bg-ink-100`
- Fill: `bg-accent` con `transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1)`
- Height: `h-1.5 rounded-full`
- Label de etapa arriba de la barra: `text-sm text-ink-500`
- Porcentaje a la derecha: `text-xs text-ink-300 font-mono tabular-nums`

---

## 4. OUTPUT COMPATIBLE CON WORD

El CV mejorado debe poder pegarse en Word y mantener estructura:

1. **Formato del texto:** Usar newlines claros (`\n\n` entre secciones, `\n` entre bullets)
2. **Headers de sección:** ALL CAPS (ej: `EXPERIENCIA PROFESIONAL`, `EDUCATION`)
3. **Bullets:** Usar `•` como character, no `-`
4. **Estructura preservada:** El prompt de improve debe instruir a Claude a mantener la misma estructura de secciones del CV original
5. **Botón "Descargar para Word":** Generar un `.txt` limpio que Word pueda abrir con formato preservado. Agregar BOM UTF-8 para compatibilidad con caracteres especiales.

Actualizar el SYSTEM_PROMPT del improve API para incluir:
```
- Preserve the EXACT section structure of the original resume
- Use ALL CAPS for section headers (e.g., PROFESSIONAL EXPERIENCE, EDUCATION, SKILLS)
- Use • for bullet points
- Separate sections with blank lines
- The output must be copy-paste compatible with Microsoft Word
```

---

## 5. ANIMACIONES v2.0

Además de las animaciones `hero-reveal` existentes, agregar:

### 5.1 Stagger de cards de resultados
Cuando aparecen los resultados del score, las 6 dimension cards deben entrar con stagger:

```css
@keyframes card-enter {
  from { opacity: 0; transform: translateY(16px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
```
Cada card con `animation-delay: calc(var(--i) * 80ms)` donde `--i` es el index.

### 5.2 Score number count-up
El número del score total debe contar de 0 al valor final:
- Duration: 1.2s
- Easing: ease-out
- Font: mono, tabular-nums

### 5.3 Progress bar animation
La barra de progreso ya descrita en sección 3.

### 5.4 Scroll-reveal para secciones below the fold
Usar CSS `animation-timeline: view()` con fallback:

```css
@supports (animation-timeline: view()) {
  .reveal-on-scroll {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 25%;
  }
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 5.5 Botón CTA pulse suave
El botón "Reescríbelo por mí" que aparece después del score debe tener un pulse suave para atraer atención:

```css
@keyframes soft-pulse {
  0%, 100% { box-shadow: 0 0 0 0 oklch(50% 0.13 230 / 0.3); }
  50% { box-shadow: 0 0 0 8px oklch(50% 0.13 230 / 0); }
}
```

### Reglas de animación:
- Usar `prefers-reduced-motion: reduce` para desactivar todas
- No usar `motion` library (Framer Motion) para estas — CSS puro
- Transiciones: `transition` con 200ms default en todos los interactivos
- No page transitions, no entrances exageradas

---

## 6. VERSIÓN Y METADATA

- **Versión:** Cambiar de `v3.2` a `v4.0` en Header.tsx
- **package.json version:** Cambiar a `"version": "4.0.0"`
- **Meta tags:** Actualizar title y description en layout.tsx:
  - Title: `maxcv — AI Resume Analyzer & Improver`
  - Description ES: `Analiza y mejora tu CV con IA. Score profesional + reescritura instantánea. Gratis, sin registro.`
  - Description EN: `Analyze and improve your resume with AI. Professional score + instant rewrite. Free, no sign-up.`
- **OpenGraph:** Actualizar og:title y og:description con los mismos

---

## 7. CÓDIGO — ESTÁNDARES

### Reglas de código:
- TypeScript estricto — no `any` salvo donde sea estrictamente necesario (marcar con `/* eslint-disable */` inline)
- Componentes funcionales con hooks
- Extraer constantes bilingües en objetos `const UI = { en: {...}, es: {...} }` al top del archivo
- Minimum lines of code — si algo se puede hacer en 1 línea, hacerlo en 1 línea
- DRY — no duplicar lógica entre score e improve
- Shared utilities: rate limiting, IP extraction, error handling en un shared helper
- Imports: usar `@/` path aliases
- CSS: Tailwind utility classes, variables de `@theme`, CSS puro para animaciones. NO instalar más dependencias CSS.
- No crear archivos innecesarios — si un componente se usa en un solo lugar y es corto (<30 líneas), inline it

### Estructura de archivos v2.0:
```
src/
  app/
    globals.css          ← Agregar nuevas animaciones aquí
    layout.tsx           ← Actualizar meta tags + version
    page.tsx             ← REESCRIBIR: página única con ambos flujos
    score/page.tsx       ← REEMPLAZAR: solo redirect a /
    security/page.tsx    ← No tocar
    api/
      improve/route.ts   ← Actualizar prompt para output Word-compatible
      score/route.ts     ← No tocar (funciona bien)
      parse/route.ts     ← No tocar (funciona bien)
  components/
    Header.tsx           ← Actualizar versión a v4.0
    Footer.tsx           ← No tocar (ya tiene link a Security)
    CVInput.tsx          ← Puede necesitar ajustes menores
    DonationBanner.tsx   ← No tocar
    AboutUs.tsx          ← No tocar
    ProgressBar.tsx      ← NUEVO: componente de barra de progreso
```

### Dependencias:
- NO agregar nuevas dependencias. Todo lo necesario ya está instalado:
  - `@anthropic-ai/sdk`, `next`, `react`, `tailwindcss`, `geist`, `@vercel/analytics`
  - `motion` está instalada pero no la uses para las animaciones nuevas — CSS puro
  - `mammoth` y `pdf-parse` están en package.json pero ya no se usan (Claude lee PDFs nativamente). Se pueden dejar por ahora.

---

## 8. PLAN DE EJECUCIÓN — Orden exacto

1. **Lee los docs/** — Project Bible, Style Guide, Score Prompt, Principles, Backlog
2. **Crea `ProgressBar.tsx`** — Componente de barra de progreso con etapas
3. **Actualiza `globals.css`** — Agregar keyframes para card-enter, reveal-on-scroll, soft-pulse
4. **Actualiza `Header.tsx`** — Version v4.0
5. **Actualiza `/api/improve/route.ts`** — Prompt para output Word-compatible
6. **Reescribe `page.tsx`** — Página única con:
   - Hero con nuevo copy
   - CVInput compartido
   - Dos botones CTA
   - Nota de rate limit
   - Flujo A (score + resultados + CTA improve)
   - Flujo B (improve + resultado + CTA score)
   - ProgressBar durante loading
   - Todas las animaciones
   - DonationBanner post-resultado
   - AboutUs al final
7. **Reemplaza `score/page.tsx`** — Solo redirect
8. **Actualiza `layout.tsx`** — Meta tags
9. **Actualiza `package.json`** — Version 4.0.0
10. **Actualiza `CLAUDE.md`** — Reflejar arquitectura v2.0
11. **Actualiza `docs/MAXCV_BACKLOG.md`** — Marcar items completados
12. **Crea `docs/MAXCV_V2_CHANGELOG.md`** — Changelog de la versión
13. **Haz commit y push a master** — Commit message: `feat: MaxCV v2.0 — unified page, dual CTA, progress bar, Word-compatible output, copy refresh`
14. **Verifica que Vercel deploye exitosamente**

---

## 9. VERIFICACIÓN POST-DEPLOY

Después de pushear, verifica:
- [ ] `dev.maxcv.org` carga sin errores
- [ ] Los dos botones aparecen y funcionan
- [ ] `/score` redirige a `/`
- [ ] `/security` sigue funcionando
- [ ] Barra de progreso anima correctamente
- [ ] Resultado de score muestra 6 dimensiones expandidas
- [ ] Resultado de improve muestra CV con formato Word-compatible
- [ ] CTA "Reescríbelo por mí" aparece después del score
- [ ] CTA "Analiza mi CV" aparece después del improve
- [ ] Rate limit note visible
- [ ] Toggle ES/EN funciona en todo
- [ ] Animaciones respetan `prefers-reduced-motion`
- [ ] Versión muestra v4.0

---

## 10. LO QUE NO DEBES TOCAR

- `src/app/security/page.tsx` — Recién creada, no modificar
- `src/app/api/score/route.ts` — Funciona correctamente
- `src/app/api/parse/route.ts` — Funciona correctamente
- `src/components/DonationBanner.tsx` — Funciona correctamente
- `src/components/Footer.tsx` — Actualizado recientemente con link Security
- `docs/MAXCV_PROJECT_BIBLE.md` — No tocar en este sprint
- `docs/MAXCV_SCORE_PROMPT.md` — No tocar
- `docs/MAXCV_PRINCIPLES_PAGE.md` — No tocar
- `docs/MAXCV_COMPETITORS.md` — No tocar
- `docs/MAXCV_STYLE_GUIDE.md` — No tocar (referencia histórica)

---

*Prompt version: 1.0 | Para: Claude Code | Proyecto: MaxCV v2.0*
