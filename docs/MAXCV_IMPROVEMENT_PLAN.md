# MaxCV — Plan Maestro de Mejoras v1.0

> 3 dimensiones · 18 sub-categorías · 4 fases de prioridad
> Visual interactivo: ver artefacto HTML adjunto o regenerar en Claude

---

## Dimensiones

| # | Dimensión | Enfoque | Sub-categorías |
|---|-----------|---------|----------------|
| 1 | **Técnicas** | Stack y performance | 1.1–1.6 |
| 2 | **Producto** | UX y funcionalidad | 2.1–2.6 |
| 3 | **Negocio** | Revenue y crecimiento | 3.1–3.6 |

---

## 1. Mejoras técnicas

### 1.1 Seguridad y privacidad
Lo más urgente. Ahora mismo dices "nunca almacenamos datos" pero no hay nada que lo respalde. Necesitas: una política de privacidad real (puede ser corta y en español/inglés), headers de seguridad HTTP (Content-Security-Policy, X-Frame-Options, Strict-Transport-Security), asegurar que las llamadas al API de Claude sean server-side (nunca exponer tu API key en el frontend), y validación/sanitización del input del usuario antes de mandarlo al modelo. Si el CV se procesa y se descarta, documéntalo. Si hay logs, dilo.

### 1.2 SEO técnico
Para que Google y los LLMs te encuentren: meta tags completos (title, description, og:image, twitter:card), schema markup de tipo `SoftwareApplication` y `WebApplication`, un `robots.txt` que permita indexación, un `sitemap.xml`, URLs canónicas entre `dev.maxcv.org` y `maxcv.org`, y el clásico favicon + apple-touch-icon. También necesitas que la página sea server-side rendered (SSR) o al menos tenga buen contenido en el HTML inicial — si todo es client-rendered, los crawlers ven una página vacía.

### 1.3 Performance y Core Web Vitals
Google penaliza sitios lentos, y tu audiencia (desempleados en búsqueda) puede estar en celulares viejos con datos limitados. Revisa: Largest Contentful Paint (la sección hero debe cargar en menos de 2.5s), Cumulative Layout Shift (que nada brinque mientras carga), lazy loading de la sección ATS que está below the fold, compresión de assets, y que las fuentes se carguen con `font-display: swap`.

### 1.4 Infraestructura y deploy
Estás en Vercel, lo cual ya es bueno. Pero necesitas: separar limpiamente el ambiente `dev.maxcv.org` de producción `maxcv.org`, configurar rate limiting en tu API route para que alguien no abuse del servicio (un bot podría hacer miles de llamadas y dejarte sin créditos de Anthropic), implementar un sistema básico de throttling por IP, y considerar un edge function para el procesamiento del CV para reducir latencia en México/LATAM.

### 1.5 Accesibilidad
Tu audiencia incluye personas de todos los contextos. Revisa: contraste de colores suficiente (WCAG AA mínimo), navegación por teclado funcional, labels en los form inputs (no solo placeholders), estados de error claros cuando algo falla, y que el botón "Improve my resume" tenga un estado de loading claro mientras espera la respuesta del API.

### 1.6 Analytics y tracking
Sin datos, vuelas a ciegas. Implementa como mínimo: eventos de conversión (cuántos pegan CV, cuántos le dan clic al botón, cuántos reciben resultado), funnel de donación (cuando lo tengas), y algún tracking básico. Vercel Analytics es gratuito y te da Web Vitals automáticos. Para eventos custom, considera Plausible o PostHog (ambos tienen tiers gratuitos y son privacy-friendly, lo cual va con tu messaging).

---

## 2. Mejoras de producto

### 2.1 Flujo de usuario
Optimizar el camino: llegar → pegar/subir CV → resultado → acción. Reducir fricción en cada paso.

### 2.2 Copy y messaging
Refinar el texto del sitio para la audiencia target (desempleados LATAM). Claridad > creatividad.

### 2.3 Output del CV
Mejorar cómo se presenta el CV mejorado y el score. Formatos de descarga, presentación visual.

### 2.4 Diseño y branding
Seguir el Style Guide v1.0 (Clean SaaS Minimal). Consistencia visual entre Score e Improve.

### 2.5 Multi-idioma
Español primero, luego inglés, portugués, y eventualmente mercados asiáticos.

### 2.6 Features adicionales
Score shareable como imagen, comparación antes/después, historial anónimo, carta de presentación.

---

## 3. Mejoras de negocio

### 3.1 Monetización
Donaciones post-valor con Stripe / Mercado Pago. Montos sugeridos: $50/$100/$200 MXN o $5/$10/$25 USD.

### 3.2 SEO y contenido
Blog con 5-10 artículos sobre búsqueda de empleo en LATAM. Contenido que responda preguntas que la gente le hace a ChatGPT/Claude.

### 3.3 Visibilidad en LLMs
Schema markup, contenido semántico, ser la respuesta cuando alguien pregunte "herramientas gratuitas para mejorar mi CV".

### 3.4 Difusión pagada
Cuando haya tracción orgánica, amplificar con Google Ads y Meta Ads en mercados LATAM.

### 3.5 Legal y términos
Política de privacidad, términos de uso, aviso legal. Corto, claro, bilingüe.

### 3.6 Comunidad y retención
Testimonios, casos de éxito, newsletter opcional, programa de referidos.

---

## Fases de prioridad

| Fase | Timing | Qué incluye |
|------|--------|-------------|
| **Fase 1** (pre-launch) | Ahora | Técnicas + Legal + Monetización básica |
| **Fase 2** (launch) | Semana 2-3 | Copy + Flujo de usuario + Diseño |
| **Fase 3** (growth) | Mes 2-3 | SEO + Contenido + Visibilidad LLMs |
| **Fase 4** (scale) | Mes 4+ | Features adicionales + Comunidad + Multi-idioma |

---

*Last updated: 2026-03-22 | Version 1.0*
