# maxcv

Free, anonymous, open-source resume analyzer and improver powered by frontier AI.

Upload your resume → get a score across 6 dimensions → receive a complete rewrite optimized for ATS systems. One click. No sign-up. No data stored.

**Spanish-first.** Built for LATAM job seekers, works in any language.

🌐 **[maxcv.org](https://maxcv.org)** · 📖 **[How it works](https://maxcv.org/how)** · 🔒 **[Security](https://maxcv.org/security)** · 👤 **[About](https://maxcv.org/about)**

---

## What it does

1. You paste text or upload a PDF
2. Your resume is analyzed by Claude (Anthropic) with a constitutional prompt — ethical, honest, anti-hallucination
3. You get a score (0–100), analysis across 6 dimensions with evidence, before/after suggestions, and a fully rewritten resume
4. Everything happens in your browser. Your data evaporates immediately.

### The 6 dimensions

| Dimension | Weight | What it evaluates |
|-----------|--------|-------------------|
| ATS Compatibility | 25% | Headers, dates, contact, layout, readability |
| Achievement Impact | 20% | Metrics, action verbs, results vs duties |
| Structure & Format | 15% | Length, section order, consistency, summary |
| Keyword Relevance | 20% | Hard/soft skills, industry terms, certifications |
| Writing Clarity | 10% | Active voice, conciseness, grammar, tone |
| Completeness | 10% | Contact, LinkedIn, summary, experience, education, skills |

---

## Tech stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 |
| Typography | Geist + Geist Mono |
| AI | Claude API via Anthropic SDK |
| Deploy | Vercel (auto-deploy on push to master) |
| Analytics | Vercel Analytics (anonymous, aggregate) |
| Database | None. Zero. Nada. |
| External UI libs | None. Zero CSS/component libraries. |

**6 production dependencies.** That's it.

```
@anthropic-ai/sdk  @vercel/analytics  geist  next  react  react-dom
```

---

## Architecture

```
src/
├─ app/
│  ├─ api/analyze/route.ts  ← Main endpoint (Claude API call)
│  ├─ api/parse/route.ts    ← PDF → text (Claude native)
│  ├─ page.tsx              ← Main page (analyzer)
│  ├─ about/page.tsx        ← About me
│  ├─ how/page.tsx          ← How it works (technical)
│  ├─ privacy/page.tsx      ← Privacy notice (LFPDPPP + GDPR + LGPD + CCPA)
│  ├─ terms/page.tsx        ← Terms of use
│  └─ security/page.tsx     ← Security & privacy
├─ components/
│  ├─ Analyzer.tsx          ← Main component (~300 lines)
│  ├─ Header.tsx / Footer.tsx
│  └─ ResumeText.tsx        ← Text renderer with bullet indent
└─ lib/
   ├─ prompts/analyze.txt   ← Constitutional system prompt (auditable)
   ├─ i18n.ts               ← All translations ES/EN
   ├─ rateLimit.ts          ← Rate limiting (in-memory, 7/hour/IP)
   └─ apiUtils.ts           ← sanitizeInput + stripMarkdown
```

---

## Run locally

```bash
git clone https://github.com/pixan-ai/maxcv.git
cd maxcv
npm install
```

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

The `CLAUDE_MODEL` env var defaults to `claude-opus-4-6`. You can change it to any Claude model.

---

## Design principles

**Radical transparency.** The source code is public. The AI prompt is in the repo (`src/lib/prompts/analyze.txt`). The scoring weights are documented. You can verify every claim we make.

**Anti-hallucination.** Every suggestion must reference real CV content. If something isn't in your resume, it's not mentioned. Generic advice = system failure.

**Zero discrimination.** We don't penalize career gaps, non-linear paths, or non-traditional education. We don't infer gender, age, ethnicity, or nationality.

**Privacy by design.** No database, no accounts, no tracking cookies. Your resume exists only during analysis and is discarded immediately.

**Empowerment, not fear.** No negative language, no inflated urgency, no scare tactics. A low score means the resume can present you better — not that you're inadequate.

---

## Privacy & compliance

MaxCV complies with data protection laws across multiple jurisdictions:

- 🇲🇽 **LFPDPPP** (Mexico) — ARCO rights, Secretaría de Anticorrupción y Buen Gobierno
- 🇪🇺 **GDPR** (European Union)
- 🇧🇷 **LGPD** (Brazil)
- 🇺🇸 **CCPA/CPRA** (California)
- 🇨🇦 **PIPEDA** (Canada)

The same principle applies everywhere: **we don't store your data.** Privacy rights are fulfilled by design.

See the full [Privacy Notice](https://maxcv.org/privacy).

---

## Security

- TLS/SSL on all communications
- HTTP security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Input sanitization before Claude API calls
- Rate limiting (7 requests/hour per IP)
- API key server-side only, never exposed to client
- No database = nothing to breach

Report vulnerabilities: [security@maxcv.org](mailto:security@maxcv.org) · See [SECURITY.md](SECURITY.md)

---

## Contributing

Contributions are welcome. MaxCV is intentionally simple — the architecture is designed so any junior developer can read it, understand it, and contribute.

1. Open an issue to discuss what you'd like to change
2. Fork the repo and create your branch
3. Make your changes
4. Open a PR

If you want to build your own version, you have our blessing. It's MIT.

---

## Why this exists

Someone needed a good resume analyzer in Spanish. It didn't exist. So we built it.

Access to dignified work is a human right. The best tools should be available to everyone.

Read the full story at [maxcv.org/about](https://maxcv.org/about).

---

## License

[MIT](LICENSE)

---

Built with ☕ and stubbornness in Mexico City by [Alfredo Arenas](https://maxcv.org/about).
