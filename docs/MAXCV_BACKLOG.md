# MaxCV — Backlog v1.3

> Tracking de todo lo completado y pendiente del proyecto.
> Versión: 1.3 | Última actualización: 2026-04-01

---

## Resumen

| Estado | Cantidad |
|--------|----------|
| ✅ Completado | 22 |
| ○ Fase 1 — Pre-launch | 12 |
| ○ Fase 2 — Launch | 4 |
| ○ Fase 3 — Growth | 5 |
| ⚠ Bloqueado | 2 |

---

## ✅ Completados

- [x] **Design system overhaul** (Producto) — Migración a Tailwind v4 `@theme`, ink-* palette, Geist/Geist Mono, OKLCH accent
- [x] **CVInput compartido** (Producto) — Drag-and-drop, PDF-only, validación, success state, i18n ES/EN
- [x] **Score page — resultados expandidos** (Producto) — Dimension cards auto-expandidas, criterios ✅/⚠️/❌, evidencia, keywords, before/after
- [x] **Prompt anti-alucinaciones v1.2** (Producto) — Política de solo contenido observable, sin invención, evidencia textual obligatoria
- [x] **PDF nativo via Claude API** (Técnico) — Sin pdf-parse ni mammoth — Claude lee PDFs nativamente, TXT via UTF-8
- [x] **Principles page bilingüe** (Legal) — 7 principios éticos, 6 dimensiones explicadas, link a Constitución de Claude
- [x] **Security & Privacy page** (Seguridad) — 6 pilares de confianza, sección "lo que nunca hacemos", contacto seguridad
- [x] **Footer — link a Security** (Producto) — Navegación actualizada con enlace a /security
- [x] **Project Bible v1.2** (Técnico) — Documento vivo con definiciones técnicas, producto y negocio
- [x] **Competitors v1.0** (Negocio) — 19 competidores mapeados — todos inglés-only, registro obligatorio, de pago
- [x] **Vercel Analytics básico** (Técnico) — Analytics integrado en layout.tsx
- [x] **v2.0 — Unified page, dual CTA** (Producto) — Página única con Score + Improve en `/`, redirect `/score` → `/`
- [x] **v2.0 — Progress bar** (Producto) — Barra de progreso con etapas bilingüe durante análisis
- [x] **v2.0 — Word-compatible output** (Producto) — ALL CAPS headers, • bullets, UTF-8 BOM .txt download
- [x] **v2.0 — Copy refresh** (Producto) — Hero, CTAs y copy optimizado para conversión emocional
- [x] **v2.0 — CSS animations** (Producto) — card-enter stagger, score count-up, soft-pulse CTA, scroll-reveal
- [x] **v2.0 — Rate limiting aligned** (Técnico) — 5 req/hora/IP en ambos endpoints (score + improve)
- [x] **v4.1 — Eliminar código muerto** (Técnico) — Removidos mammoth, motion, pdf-parse, @types/pdf-parse. Eliminado AtsExplainer.tsx (121 líneas huérfanas). Reducción ~165KB de bundle.
- [x] **v4.1 — Prompts a archivos .txt** (Técnico) — System prompts extraídos a `src/lib/prompts/score.txt` y `improve.txt`. Routes solo con lógica.
- [x] **v4.1 — Shared utilities** (Técnico) — Rate limiting, IP extraction y stripMarkdown extraídos a `src/lib/rateLimit.ts` y `src/lib/apiUtils.ts`. Cero duplicación en routes.
- [x] **v4.1 — Favicon SVG** (Producto) — Favicon tipográfico "M" en `public/favicon.svg`, wired en layout.tsx metadata.
- [x] **v4.1 — HTTP security headers** (Seguridad) — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy en `next.config.ts`.

---

## Fase 1 — Pre-launch

### ○ Pendientes

**Calidad de código (reingeniería progresiva)**

- [ ] **Extraer ScoreResults + ImproveResults** (Técnico) — Sacar resultados de page.tsx (450 líneas) a componentes dedicados. page.tsx queda como orquestador puro (~180 líneas). Riesgo: medio.
- [ ] **useCVAnalysis custom hook** (Técnico) — Consolidar los 8+ useState relacionados en page.tsx a un solo hook `src/hooks/useCVAnalysis.ts`. Incluye extraer `useCountUp` a su propio archivo.
- [ ] **i18n centralizado** (Técnico) — Consolidar todos los bloques `{ en: {...}, es: {...} }` dispersos en componentes a `src/lib/i18n.ts` + hook `useI18n()`. Riesgo: alto — ejecutar al final de la reingeniería.

**Producto y SEO**

- [ ] **robots.txt + sitemap.xml** (Técnico) — Permitir indexación, generar sitemap con todas las rutas
- [ ] **Schema markup** (Técnico) — SoftwareApplication + WebApplication para SEO y visibilidad en LLMs
- [ ] **URL canónica dev↔prod** (Técnico) — Definir relación entre dev.maxcv.org y maxcv.org, hreflang tags

**Legal y seguridad**

- [ ] **Configurar emails de seguridad** (Seguridad) — Crear seguridad@maxcv.org y security@maxcv.org para la Security page
- [ ] **Input sanitización** (Seguridad) — Validar y sanitizar input del usuario antes de enviarlo a Claude API
- [ ] **Aviso de privacidad LFPDPPP** (Legal) — Aviso formal conforme a ley mexicana 2025 (Secretaría de Anticorrupción)
- [ ] **Términos de uso** (Legal) — Página legal con términos del servicio, bilingüe

**Negocio**

- [ ] **Monetización — integrar donaciones** (Negocio) — Stripe o Ko-fi integrado post-valor. Montos: $50/$100/$200 MXN o $5/$10/$25 USD

---

## Fase 2 — Launch

### ○ Pendientes

- [ ] **Evento analytics custom** (Técnico) — Tracking: CV upload, score completado, improve completado, donación click
- [ ] **Copy y messaging LATAM** (Producto) — Refinar texto del sitio para audiencia desempleados LATAM, español-first
- [ ] **Accesibilidad WCAG AA** (Producto) — Contraste de colores, navegación teclado, labels en inputs, estados de error. Cero ARIA labels actualmente.
- [ ] **Core Web Vitals audit** (Técnico) — LCP <2.5s, CLS mínimo, lazy loading below-the-fold, font-display swap

---

## Fase 3 — Growth

### ○ Pendientes

- [ ] **Score shareable como imagen** (Producto) — Generar imagen OG del score para compartir en redes
- [ ] **Cover letter generator** (Producto) — Carta de presentación personalizada basada en CV + puesto target
- [ ] **Blog — 5-10 artículos SEO** (Negocio) — Contenido sobre búsqueda de empleo en LATAM, ATS, mejora de CV
- [ ] **Product Hunt launch** (Negocio) — Presencia en directorios: Product Hunt, AlternativeTo, etc.
- [ ] **Premium ligero ($149-299 MXN)** (Negocio) — PDF descargable, cover letter, versión en otro idioma

---

## Fase 4 — Scale

### ⚠ Bloqueados (requieren revenue)

- [ ] **ISO/IEC 42001 — IA responsable** (Seguridad) — Certificación más diferenciada para producto de scoring con IA. Requiere revenue
- [ ] **ISO 27001** (Seguridad) — Estándar de gestión de seguridad. Prioridad para B2B LATAM. $10K-30K+

### ○ Pendientes

- [ ] **GDPR compliance** (Legal) — Para expansión a Europa. Fase 2 del cumplimiento internacional
- [ ] **API para job boards** (Negocio) — Endpoint público de scoring a $0.04/crédito para integración en bolsas de trabajo
- [ ] **Multi-idioma: portugués** (Producto) — Expansión a Brasil (LGPD compliance incluido)

---

*Last updated: 2026-04-01 | Version 1.3*
