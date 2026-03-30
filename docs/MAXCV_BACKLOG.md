# MaxCV — Backlog v1.0

> Tracking de todo lo completado y pendiente del proyecto.
> Versión: 1.0 | Última actualización: 2026-03-29

---

## Resumen

| Estado | Cantidad |
|--------|----------|
| ✅ Completado | 11 |
| ○ Pendiente | 22 |
| ⚠ Bloqueado | 2 |

---

## Fase 1 — Pre-launch

### ✅ Completados

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

### ○ Pendientes

- [ ] **Configurar emails de seguridad** (Seguridad) — Crear seguridad@maxcv.org y security@maxcv.org para la Security page
- [ ] **Header — link a Security** (Producto) — Agregar Security/Seguridad a la navegación del Header (hoy solo está en Footer)
- [ ] **HTTP security headers** (Seguridad) — CSP, X-Frame-Options, HSTS, X-Content-Type-Options en next.config
- [ ] **Input sanitización** (Seguridad) — Validar y sanitizar input del usuario antes de enviarlo a Claude API
- [ ] **Rate limiting API** (Técnico) — Throttling por IP en /api/improve y /api/score para evitar abuso de créditos Anthropic
- [ ] **robots.txt + sitemap.xml** (Técnico) — Permitir indexación, generar sitemap con todas las rutas
- [ ] **Meta tags en español** (Técnico) — Title, description, og:image, twitter:card — target LATAM/español
- [ ] **Schema markup** (Técnico) — SoftwareApplication + WebApplication para SEO y visibilidad en LLMs
- [ ] **Favicon + apple-touch-icon** (Producto) — Icono de marca para browser tabs y home screen
- [ ] **URL canónica dev↔prod** (Técnico) — Definir relación entre dev.maxcv.org y maxcv.org, hreflang tags
- [ ] **Aviso de privacidad LFPDPPP** (Legal) — Aviso formal conforme a ley mexicana 2025 (Secretaría de Anticorrupción)
- [ ] **Términos de uso** (Legal) — Página legal con términos del servicio, bilingüe
- [ ] **Monetización — integrar donaciones** (Negocio) — Stripe o Ko-fi integrado post-valor. Montos: $50/$100/$200 MXN o $5/$10/$25 USD

---

## Fase 2 — Launch

### ○ Pendientes

- [ ] **Evento analytics custom** (Técnico) — Tracking: CV upload, score completado, improve completado, donación click
- [ ] **Copy y messaging LATAM** (Producto) — Refinar texto del sitio para audiencia desempleados LATAM, español-first
- [ ] **Accesibilidad WCAG AA** (Producto) — Contraste de colores, navegación teclado, labels en inputs, estados de error
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

*Last updated: 2026-03-29 | Version 1.0*
