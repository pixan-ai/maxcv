# MaxCV — Project Bible v1.2

> Documento vivo con definiciones técnicas, de producto y de negocio.
> Versión: 1.2 | Última actualización: 2026-03-21

---

## 1. Visión del proyecto

**Misión:** Democratizar el acceso a CVs profesionales optimizados para ATS, sin importar el presupuesto o la ubicación geográfica del usuario.

**Modelo de negocio:** Pay-what-you-want / donación post-valor. Sin suscripciones, sin registro obligatorio, sin facturación en fase inicial.

**Mercado objetivo primario:** Personas en búsqueda activa de empleo (desempleados y en transición de carrera) — global, multi-idioma.

**Mercados geográficos prioritarios:**
- Fase 1: México y LATAM (español)
- Fase 2: Estados Unidos y Canadá (inglés)
- Fase 3: Europa (inglés, alemán, francés)
- Fase 4: Asia-Pacífico (mandarín, japonés, coreano, hindi)
- Fase 5: Medio Oriente y África (inglés, árabe, francés)

**Idiomas soportados (roadmap):**
Español, Inglés, Portugués, Francés, Alemán, Mandarín simplificado, Japonés, Coreano, Hindi

---

## 2. Servicios

### 2.1 MaxCV Score (Prioridad actual)
El usuario sube su CV y recibe un puntaje de 0 a 100 en 6 dimensiones con feedback accionable.
- Input: Texto pegado, PDF, DOCX, o Google Sheets URL
- Output: JSON con score total, 6 dimensiones con criteria_checked + evidence + suggestions
- Modelo IA: Claude Sonnet 4 (temperature 0, max 8192 tokens)
- Costo: ~$0.015 por score (v1.2 con output más detallado)

### 2.2 MaxCV Improve (Servicio original)
El usuario pega su CV y recibe una versión reescrita y optimizada para ATS.
- Modelo IA: Claude Opus 4.6

### 2.3 Funnel integrado
```
Score gratuito → "Tu CV sacó 58/100" → Mejora del CV → Score de validación → "¡Subiste a 87!" → Compartir + Donación
```

---

## 3. Ciencia del ATS

### 3.1 Top ATS del mundo
**Enterprise:** Workday (#1 Fortune 500), SAP SuccessFactors, Oracle Taleo, iCIMS
**Mid-market:** Greenhouse, Lever/Employ, SmartRecruiters, BambooHR
**Staffing:** Bullhorn, Zoho Recruit, Manatal, ADP Workforce Now

98-99% de Fortune 500 usan ATS. 77% del mercado es cloud/SaaS.

### 3.2 Pipeline ATS
```
PARSING → EXTRACCIÓN DE ENTIDADES → KEYWORD MATCHING → SCORING & RANKING
```
Regla crítica: Un CV que no puede ser parseado no puede ser calificado.
Target keyword match: 65-75% es sweet spot. >85% puede ser keyword stuffing.

### 3.3 Mercados globales
| Mercado | Job seekers | Competencia scoring | Idioma MaxCV |
|---------|------------|--------------------|--------------|
| LATAM | 30-40M | CERO | ES, PT |
| US/Canada | 10-15M | ALTA | EN |
| Europa | 15-20M | MEDIA | EN, DE, FR |
| China | 200M+ | LOCAL | ZH |
| India | 100M+ | BAJA | EN, HI |
| Japón | 5-8M | BAJA | JA |
| Corea | 3-5M | BAJA | KO |
| SE Asia | 20-30M | MUY BAJA | EN |

TAM: 400M+ | SAM: 70-80M | SOM Year 1: 100K-500K

### 3.4 Plataformas clave por mercado
**China:** BOSS Zhipin (200M+ usuarios), 51job (155M), Zhaopin, Liepin, Lagou
**India:** Naukri (100M+), Monster India, Shine, LinkedIn
**Japón:** Rikunabi, Mynavi, Doda (formato Rirekisho)
**Corea:** JobKorea, Saramin, Wanted (cultura del "spec")

---

## 4. MaxCV Score — Definición técnica

### 4.1 Las 6 dimensiones
```
SCORE = (ATS × 0.25) + (LOGROS × 0.20) + (ESTRUCTURA × 0.15) + (KEYWORDS × 0.20) + (CLARIDAD × 0.10) + (COMPLETITUD × 0.10)
```

| Dimensión | Peso | Qué evalúa |
|-----------|------|-------------|
| Compatibilidad ATS | 25% | Headers, fechas, contacto, layout, legibilidad |
| Impacto de logros | 20% | Métricas, action verbs, resultados vs tareas, especificidad |
| Estructura y formato | 15% | Longitud, orden, consistencia, summary, cronología |
| Palabras clave | 20% | Hard/soft skills, términos industria, certificaciones, placement |
| Claridad de redacción | 10% | Voz activa, concisión, errores, tono, buzzwords |
| Completitud | 10% | Contacto, LinkedIn, summary, experiencia, educación, skills, idiomas |

### 4.2 Output JSON v1.2
Cada dimensión incluye:
- `criteria_checked`: Checklist con status (pass/warning/fail) y detalle específico
- `evidence`: Cita o paráfrasis del CV que justifica el score
- `issues`: Problemas específicos referenciando contenido del CV
- `suggestions`: Sugerencias accionables referenciando secciones específicas

### 4.3 Escala
| Rango | Categoría | Color |
|-------|-----------|-------|
| 90-100 | Excelente | Verde |
| 75-89 | Bueno | Verde claro |
| 60-74 | Regular | Amarillo |
| 40-59 | Bajo | Naranja |
| 0-39 | Crítico | Rojo |

---

## 5. Stack técnico

| Componente | Tecnología |
|-----------|------------|
| Frontend | Next.js 16+ (App Router, Tailwind 4) |
| Backend | Vercel Edge Functions / API Routes |
| IA Score | Claude Sonnet 4 (temp 0, 8192 tokens) |
| IA Improve | Claude Opus 4.6 |
| File parsing | pdf-parse + mammoth.js |
| Dominio prod | maxcv.org |
| Dominio dev | dev.maxcv.org |
| Repo | github.com/pixan-ai/maxcv |
| Deploy | Vercel (auto-deploy on push) |
| Analytics | Vercel Analytics (pendiente: PostHog) |
| Pagos | Pendiente: Stripe + Mercado Pago |

---

## 6. Seguridad y cumplimiento

### 6.1 LFPDPPP 2025 (México)
Nueva ley vigente desde 21 marzo 2025. Secretaría de Anticorrupción y Buen Gobierno supervisa.
MaxCV necesita: Aviso de privacidad (integral + simplificado), mecanismos de confidencialidad.

### 6.2 Certificaciones por etapa
- **Ahora (gratis):** SSL/TLS (Vercel), aviso privacidad, security headers
- **Con revenue:** PrivacyTrust seal ($200-500 USD/año)
- **Enterprise:** SOC 2, ISO 27001

---

## 7. Análisis competitivo

Ver documento completo: `docs/MAXCV_COMPETITORS.md`

**Resumen:** 19 competidores mapeados. TODOS son inglés-only, requieren registro, y cobran suscripción. NINGUNO ataca español, modelo donación, ni segmento desempleados.

**Gaps de mercado que MaxCV llena:**
- Scoring en español/portugués: 0 competidores
- Sin registro: ~2 competidores (parcial)
- Modelo donación: 0 competidores
- Principios éticos públicos: 0 competidores
- Multi-mercado con adaptación regional: 0 competidores

---

## 8. Modelo de negocio

### 8.1 Donación post-valor
- MX/LATAM: $50, $100, $200 MXN
- US/EU: $5, $10, $25 USD
- Momento: inmediatamente después de entregar valor
- Conversión esperada: 3-5% con buen flujo emocional

### 8.2 Roadmap de revenue
```
Fase 1: Donaciones (MVP actual)
Fase 2: Donación + premium ($149-299 MXN): PDF, cover letter, traducción
Fase 3: Partnerships con bolsas de trabajo
Fase 4: API para job boards ($0.04/crédito)
```

---

## 9. Principios éticos y Constitución de IA

### 9.1 Base filosófica
Inspirado en la Constitución de Claude de Anthropic (CC0, enero 2026).

### 9.2 Jerarquía de prioridades
1. **SEGURIDAD:** No almacenar datos. No filtrar información.
2. **ÉTICA:** Evaluar sin discriminación. Nunca asumir identidad.
3. **HONESTIDAD:** No inflar scores. No usar miedo. Reflejar realidad.
4. **PRECISIÓN (anti-alucinación):** Solo referenciar contenido real del CV. No inventar, no asumir, no fabricar.
5. **UTILIDAD:** Feedback accionable que empodere al usuario.

### 9.3 Política anti-alucinaciones (v1.2)
Esta política aplica a TODO output generado por MaxCV:

1. **Solo contenido observable:** Cada issue, sugerencia, y evidencia debe referenciar contenido que EXISTE en el CV. Si no está en el CV, no se menciona.
2. **Sin invención:** Si una sección falta, se dice "no encontrado" — nunca se adivina qué podría contener.
3. **Evidencia obligatoria:** Cada dimensión incluye un campo `evidence` con citas o paráfrasis reales del CV.
4. **Sugerencias contextuales:** "Agrega métricas a tus 3 bullets en [Empresa] que solo listan tareas" — NO "Mejora tus logros" (genérico).
5. **Conteo verificable:** `weak_bullets_count` y `strong_bullets_count` deben sumar un total realista basado en los bullets reales del CV.
6. **Detección de no-CV:** Si el texto no parece un CV real (garbled, truncado, irrelevante), se flaggea honestamente.
7. **Consejo genérico = alucinación = falla:** Todo feedback que no pueda rastrearse a contenido específico del CV se considera una alucinación.

### 9.4 Principios anti-discriminación
- No penalizar career gaps, caminos no lineales, educación no tradicional
- No inferir género, edad, etnicidad, nacionalidad
- Ser igualmente riguroso en todos los niveles de seniority

### 9.5 Estrategia de transparencia
| Capa | Qué se publica | Dónde |
|------|----------------|-------|
| PÚBLICA | Principios éticos + 6 dimensiones (sin pesos) + anti-alucinación | /principles |
| PRIVADA | Prompt completo, rúbricas, pesos, JSON schema | Repo privado |

### 9.6 Documentos del proyecto
| Documento | Ubicación | Versión |
|-----------|-----------|----------|
| Project Bible | docs/MAXCV_PROJECT_BIBLE.md | 1.2 |
| Score Prompt | docs/MAXCV_SCORE_PROMPT.md | 1.2 |
| Principles Page | docs/MAXCV_PRINCIPLES_PAGE.md | 1.1 |
| Competitors | docs/MAXCV_COMPETITORS.md | 1.0 |
| Constitución de Claude | anthropic.com (CC0) | ref |

---

## 10. Decisiones pendientes

- [ ] ¿Score requiere job description target o funciona standalone?
- [ ] ¿Imagen/tarjeta compartible del score para redes?
- [ ] ¿Score por industria/región?
- [ ] ¿Integrar parser propio o depender 100% de Claude?
- [ ] Conectar pagos reales (Stripe / Mercado Pago)
- [ ] Blog SEO para visibilidad en LLMs
- [ ] Versionamiento del producto (v1.0, v1.1, etc.)

---

## 11. Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-03-21 | 1.0 | Documento inicial. 6 dimensiones, pipeline ATS, stack, modelo negocio, compliance. |
| 2026-03-21 | 1.0 | Análisis competitivo (19 competidores). Mercados Asia-Pacífico. TAM/SAM/SOM. |
| 2026-03-21 | 1.1 | Principios éticos (Constitución Claude). Prompt v1.1 con anti-discriminación. Página /principles bilingüe. |
| 2026-03-21 | 1.2 | Política anti-alucinaciones. Prompt v1.2 con evidence-based scoring y criteria_checked. Upload de archivos. Animación de privacidad. Docs centralizados en /docs del repo. |

---

*Este documento se actualiza con cada sesión de trabajo. Es la fuente de verdad del proyecto MaxCV.*
