# MaxCV Score — System Prompt v1.2

> Prompt que se envía a Claude API para calificar CVs.
> Versión: 1.2 | Última actualización: 2026-03-21
> v1.0: Prompt inicial con 6 dimensiones
> v1.1: Principios éticos anti-discriminación (Constitución Claude)
> v1.2: Reglas anti-alucinación, evidence-based scoring, criteria_checked

---

## Nota

El prompt completo está embebido directamente en `src/app/api/score/route.ts`.
Este documento sirve como referencia y documentación del prompt.

---

## Resumen de secciones del prompt

### 1. ANTI-HALLUCINATION RULES (NUEVO en v1.2)
- Solo referenciar contenido que EXISTE en el CV
- Si falta una sección, decir "not found" — no inventar
- Cada issue y sugerencia DEBE referenciar una parte específica del CV
- El campo evidence DEBE contener citas reales
- No asumir industria, nivel o puesto target a menos que esté explícito
- Texto garbled o no-CV = flaggear honestamente
- Contar bullets reales antes de reportar conteos
- REMINDER final: "Generic advice = hallucination = failure"

### 2. SCORING RULES
- Consistente, justo, calibrado, accionable, language-aware
- No output de datos personales

### 3. ETHICAL PRINCIPLES
- Anti-discriminación (career gaps, caminos no lineales, educación no tradicional)
- Honestidad (calibrado a realidad, sin fear tactics)
- Privacidad (no output de PII, anonimizar ejemplos)
- Empoderamiento (oportunidades, no críticas)

### 4. SCORING DIMENSIONS (6)
Cada dimensión ahora incluye:
- **criteria_checked**: Checklist de sub-criterios evaluados con status (pass/warning/fail) y detalle
- **evidence**: Cita o paráfrasis del CV
- **issues**: Problemas específicos referenciando contenido real
- **suggestions**: Sugerencias accionables con contexto del CV

| Dimensión | Peso | Criterios evaluados |
|-----------|------|--------------------|
| ATS Compatibility | 25% | section_headers, date_format, contact_info, layout, file_readability |
| Achievement Impact | 20% | metrics_presence, action_verbs, results_vs_duties, specificity, recency_weight |
| Structure & Format | 15% | length_appropriateness, section_order, formatting_consistency, professional_summary, chronological_order |
| Keyword Relevance | 20% | hard_skills_present, soft_skills_balance, industry_terms, certifications, keyword_placement |
| Writing Clarity | 10% | voice, conciseness, errors, tone, buzzwords |
| Completeness | 10% | contact_info, linkedin, summary, experience, education, skills, languages, certifications |

### 5. OUTPUT FORMAT
JSON puro. score_version: "1.2". max_tokens: 8192.

### 6. TOTAL SCORE CALCULATION
```
total_score = round(ats*0.25 + achievement*0.20 + structure*0.15 + keywords*0.20 + clarity*0.10 + completeness*0.10)
```

---

## Implementación

- **Modelo:** claude-sonnet-4-20250514
- **Temperature:** 0 (consistencia)
- **Max tokens:** 8192
- **Rate limit:** 5 req/hora/IP
- **Input max:** 15,000 caracteres (~5 páginas)
- **Costo estimado:** ~$0.015 por score

---

## Notas para Claude Code

Cuando trabajes en el prompt, recuerda:
1. El prompt está en `src/app/api/score/route.ts` dentro de la constante `SYSTEM_PROMPT`
2. Cualquier cambio al prompt debe reflejarse aquí en la documentación
3. Testear con CVs reales en español e inglés antes de pushear cambios
4. Verificar que el JSON output parsea correctamente
5. La regla más importante: **Generic advice = hallucination = failure**
