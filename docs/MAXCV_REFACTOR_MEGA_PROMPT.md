# MaxCV — Refactor Mega Prompt v1.0
> Fase: Prioridad Inmediata | Fecha: 2026-04-01

Usa este prompt en Claude Code (Cursor) para ejecutar la fase de refactor de alta prioridad.
Antes de ejecutar: `git pull origin master`

---

## PROMPT PARA CLAUDE CODE

```
Eres un ingeniero senior ejecutando una refactorización quirúrgica del proyecto MaxCV.
El objetivo es calidad de código world-class: cero duplicación, separación de responsabilidades,
bundle más liviano, y seguridad básica activada.

Lee este prompt completo antes de tocar cualquier archivo.
Muéstrame el plan de ejecución y espera mi confirmación antes de proceder.

---

## CONTEXTO DEL PROYECTO

- Next.js 16 + Tailwind v4 + App Router
- Stack: `/src/app/` (pages + api routes) y `/src/components/`
- No usar shadcn, Aceternity, ni ninguna UI library externa
- Design system: CSS variables `--ink-000..900`, `--accent`, `--positive` (ya definidas en globals.css)
- Tailwind v4: usar `text-accent` no `text-[--accent]` (genera CSS inválido)
- Deploy: Vercel auto-deploy desde master

---

## FASE 1 — ELIMINAR CÓDIGO MUERTO (riesgo: cero)

### 1A. Limpiar package.json

Las siguientes dependencias están instaladas pero NUNCA se usan en el código:
- `mammoth` — fue reemplazado por Claude API native PDF reading
- `motion` — importado pero no usado en ningún componente
- `pdf-parse` — reemplazado por Claude API
- `@types/pdf-parse` — devDep del anterior

Ejecuta en la raíz del proyecto:
```bash
npm uninstall mammoth motion pdf-parse @types/pdf-parse
```

Verifica que el build pase después: `npm run build`

### 1B. Eliminar AtsExplainer.tsx

El archivo `src/components/AtsExplainer.tsx` (121 líneas) no está importado
en ningún archivo del proyecto. Verificar con:
```bash
grep -r "AtsExplainer" src/
```
Si la búsqueda no arroja resultados de importación, eliminar el archivo.

---

## FASE 2 — EXTRAER PROMPTS A ARCHIVOS DE TEXTO (riesgo: cero)

Los system prompts están hardcodeados dentro de los route.ts como constantes string,
mezclando prosa con lógica. Esto viola separación de responsabilidades.

### 2A. Crear carpeta y archivos de prompts

Crear la carpeta `src/lib/prompts/` con dos archivos:

**`src/lib/prompts/score.txt`**
Mover el contenido EXACTO de la constante `SYSTEM_PROMPT` de
`src/app/api/score/route.ts` (todo el string desde "You are an expert resume analyst..."
hasta el cierre del JSON de ejemplo). Sin modificar ni una coma del contenido.

**`src/lib/prompts/improve.txt`**
Mover el contenido EXACTO de la constante `SYSTEM_PROMPT` de
`src/app/api/improve/route.ts` (desde "You are an expert resume writer..."
hasta "Respond ONLY with the JSON object..."). Sin modificar ni una coma.

### 2B. Crear utilidad de carga de prompts

Crear `src/lib/prompts.ts`:

```typescript
import { readFileSync } from "fs";
import { join } from "path";

function loadPrompt(name: string): string {
  return readFileSync(join(process.cwd(), "src/lib/prompts", `${name}.txt`), "utf-8");
}

// Prompts se leen una sola vez en build time gracias al bundler
export const SCORE_PROMPT = loadPrompt("score");
export const IMPROVE_PROMPT = loadPrompt("improve");
```

### 2C. Actualizar los routes para usar las constantes importadas

En `src/app/api/score/route.ts`:
- Eliminar la constante `SYSTEM_PROMPT` (líneas con el string hardcodeado)
- Agregar al inicio: `import { SCORE_PROMPT } from "@/lib/prompts";`
- Reemplazar `system: SYSTEM_PROMPT` por `system: SCORE_PROMPT`

En `src/app/api/improve/route.ts`:
- Eliminar la constante `SYSTEM_PROMPT`
- Agregar al inicio: `import { IMPROVE_PROMPT } from "@/lib/prompts";`
- Reemplazar `system: SYSTEM_PROMPT` por `system: IMPROVE_PROMPT`

Verificar build: `npm run build` — no debe haber errores TypeScript.

---

## FASE 3 — APIHANDLER WRAPPER (riesgo: bajo)

Los tres routes (`/api/score`, `/api/improve`, `/api/parse`) duplican exactamente
el mismo código de rate limiting e IP extraction. Esto viola DRY.

### 3A. Crear `src/lib/rateLimit.ts`

```typescript
import { NextRequest } from "next/server";

const store = new Map<string, { count: number; resetAt: number }>();
const HOURLY_LIMIT = 5;

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (record.count >= HOURLY_LIMIT) return true;
  record.count++;
  return false;
}
```

### 3B. Actualizar los tres routes para importar desde rateLimit.ts

En `src/app/api/score/route.ts`:
- Eliminar las funciones `isRateLimited` y `getClientIp` locales (y la constante `ipRequests`)
- Agregar: `import { getClientIp, isRateLimited } from "@/lib/rateLimit";`

En `src/app/api/improve/route.ts`:
- Mismo proceso: eliminar duplicados locales, importar desde `@/lib/rateLimit`

En `src/app/api/parse/route.ts`:
- Nota: parse/route.ts no tiene rate limiting actualmente.
  NO agregar rate limiting aquí — dejarlo fuera de scope de este task para no romper el flujo de upload.

### 3C. Crear `src/lib/apiUtils.ts` para stripMarkdown

El siguiente código está duplicado en score/route.ts y improve/route.ts:
```typescript
.replace(/^```(?:json)?\s*\n?/, "")
.replace(/\n?```\s*$/, "")
.trim()
```

Extraer a utilidad compartida:

```typescript
/** Removes markdown code fences from Claude API responses */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}
```

Actualizar score/route.ts e improve/route.ts para importar `stripMarkdown` desde `@/lib/apiUtils`.

Verificar build: `npm run build`

---

## FASE 4 — HTTP SECURITY HEADERS (riesgo: cero)

`next.config.ts` está vacío. Agregar headers de seguridad estándar.

Reemplazar el contenido de `next.config.ts` con:

```typescript
import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

NOTA: No agregar CSP (Content-Security-Policy) todavía — requiere análisis de
todos los dominios externos cargados (fonts, analytics) para no romper la app.
Los headers listados arriba son seguros y no tienen efectos secundarios.

Verificar build: `npm run build`

---

## FASE 5 — FAVICON (riesgo: cero)

Actualmente la app muestra el favicon default de Next.js en todas las pestañas.

### 5A. Crear favicon SVG minimalista

Crear `public/favicon.svg` con un favicon tipográfico que refleje la identidad de MaxCV:
texto "M" en la paleta de la marca (usa el color de acento aproximado `#2563eb` como
placeholder — el color exacto es una variable CSS que no funciona en SVG estático).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0f172a"/>
  <text x="16" y="23" font-family="system-ui, -apple-system, sans-serif"
        font-size="20" font-weight="700" fill="white"
        text-anchor="middle">M</text>
</svg>
```

### 5B. Actualizar layout.tsx

En `src/app/layout.tsx`, actualizar el objeto `metadata` para incluir los iconos:

```typescript
export const metadata: Metadata = {
  // ... metadata existente sin cambios ...
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};
```

Si ya existe un `icons` en metadata, reemplazarlo. Si no existe, agregarlo.
No modificar nada más de layout.tsx.

---

## CRITERIOS DE ACEPTACIÓN

Antes de hacer commit, verificar que:

- [ ] `npm run build` pasa sin errores TypeScript ni warnings
- [ ] `npm run lint` pasa sin errores
- [ ] Las tres dependencias removidas no aparecen en node_modules (verificar con `ls node_modules | grep mammoth`)
- [ ] `AtsExplainer.tsx` eliminado y no hay ninguna importación rota
- [ ] `src/lib/prompts/score.txt` existe y su contenido es idéntico al SYSTEM_PROMPT original de score/route.ts
- [ ] `src/lib/prompts/improve.txt` existe y su contenido es idéntico al SYSTEM_PROMPT original de improve/route.ts
- [ ] score/route.ts e improve/route.ts no tienen ninguna función `isRateLimited` ni `getClientIp` locales
- [ ] `src/lib/rateLimit.ts` exporta ambas funciones correctamente
- [ ] `src/lib/apiUtils.ts` exporta `stripMarkdown`
- [ ] next.config.ts tiene los 6 security headers definidos
- [ ] public/favicon.svg existe
- [ ] layout.tsx tiene el campo `icons` en metadata

## COMMIT STRATEGY

Hacer UN SOLO commit atómico con todos los cambios al final:

```
refactor: dead code removal, extract prompts+utils, security headers, favicon

- Remove unused deps: mammoth, motion, pdf-parse, @types/pdf-parse
- Delete orphan component AtsExplainer.tsx
- Extract system prompts to src/lib/prompts/*.txt
- Create src/lib/rateLimit.ts — deduplicate rate limiting across routes
- Create src/lib/apiUtils.ts — stripMarkdown shared utility
- Add HTTP security headers to next.config.ts
- Add SVG favicon to public/ and wire into layout.tsx metadata
```

NO hacer commits intermedios — si algo falla, el repo queda en estado limpio.
Push a master cuando todos los criterios de aceptación estén en verde.
```
