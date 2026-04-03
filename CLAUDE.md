# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and Claude Desktop when working with code in this repository.

## Project Overview

MaxCV (maxcv.org) is a free AI-powered resume/CV analyzer and improver. Users upload a PDF or paste CV text, and the app analyzes it across 6 dimensions, provides a score with actionable improvements, and generates a fully rewritten resume optimized for ATS. Everything happens in a single unified flow on the home page. Monetization is through voluntary donations (Buy Me a Coffee). Free forever — no sign-up, no accounts, no data stored.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + Tailwind CSS 4 (OKLCH color system)
- Claude Opus 4.6 API (`claude-opus-4-6`) via Anthropic SDK for analysis + rewriting
- Vercel Analytics for traffic + custom event tracking
- Deployed on Vercel (auto-deploy from master)

## Environments

- **Production:** maxcv.org — auto-deploys from master
- GitHub repo: github.com/pixan-ai/maxcv
- Strategic docs (private): github.com/pixan-ai/maxcv-docs

## Commands

- `npm run dev` — Start development server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Architecture

### Pages
- `/` (src/app/page.tsx) — Main page with Analyzer component (single unified flow)
- `/how` — How it works (pipeline, stack, architecture, principles)
- `/about` — Founder story
- `/donate` — Donation page (Buy Me a Coffee)
- `/security` — Security & privacy practices
- `/privacy` — Privacy notice (LFPDPPP + GDPR + LGPD + CCPA + PIPEDA)
- `/terms` — Terms of use

### API Routes
- `/api/analyze` (src/app/api/analyze/route.ts) — Main endpoint: Claude analyzes + rewrites CV in a single call
- `/api/parse` (src/app/api/parse/route.ts) — PDF → text extraction (Claude native, no parsing libraries)

### Components
- `Analyzer.tsx` — Main component: CV input → analysis → results → improved CV (~450 lines)
- `Header.tsx` — Logo + language toggle + GitHub/X icons
- `Footer.tsx` — Nav links + social icons
- `ResumeText.tsx` — Text renderer with bullet point hanging indent
- `ui/ProgressBar.tsx` — Animated progress bar with time estimation
- `ui/StepBadge.tsx` — Numbered step indicator
- `ui/Collapsible.tsx` — Expandable section

### Lib
- `i18n.ts` — All bilingual strings (ES/EN) for security, privacy, terms, donate, header, footer, analyzer
- `analytics.ts` — Custom event tracking (cv_pasted, pdf_uploaded, analysis_started, analysis_completed, cv_copied, donation_clicked, etc.)
- `rateLimit.ts` — In-memory rate limiting + IP extraction (7 req/hr per IP)
- `apiUtils.ts` — sanitizeInput + stripMarkdown
- `prompts.ts` — Prompt loader (reads .txt files at build time)
- `prompts/analyze.txt` — Constitutional system prompt for Claude

### Types
- `types/analysis.ts` — TypeScript types for AnalysisResult (score, dimensions, improvements, improved_cv)

## Design System

- **Fonts:** Geist Sans + Geist Mono (via `next/font/google`)
- **Palette:** OKLCH-based — ink-* (000–900) + accent (steel blue) + positive/positive-ghost + accent-ghost/accent-dim
- **Layout:** `max-w-2xl mx-auto px-5`, white background always
- **Logo:** `max` ink-900 + `cv` accent, Geist Sans, font-medium, lowercase
- **Philosophy:** Tipográfico puro — Tailwind + CSS animations. No shadcn, no component libraries. No shadows, no gradients, no dark mode.
- **Motion:** CSS scroll-driven animations + card-enter keyframes. No framer-motion.

## Bilingual Support

- UI defaults to Spanish (es)
- Claude API detects CV language and responds accordingly
- When language is detected, UI auto-switches
- Manual toggle in header (EN/ES)
- Centralized strings in `src/lib/i18n.ts` (security, privacy, terms, donate, header, footer, analyzer)
- How and About pages use inline i18n objects (HOW_UI, ABOUT_UI)

## Rate Limiting & Security

- 7 requests per IP per hour (in-memory, no database)
- Input sanitization: null bytes, control chars stripped, 35k char max
- HTTP security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Mozilla Observatory: A+ grade
- No user accounts, no cookies, no tracking beyond Vercel Analytics

## Analytics Events (src/lib/analytics.ts)

Custom events tracked via Vercel Analytics `track()`:
- `cv_pasted` (char_count) — User pastes CV text
- `pdf_uploaded` (file_size_kb) — User uploads PDF
- `pdf_parsed` (char_count) — PDF parsed successfully
- `analysis_started` (input_method, has_target_role) — User clicks Analyze
- `analysis_completed` (score, language) — Results returned
- `analysis_error` (reason) — Analysis failed
- `cv_copied` — User copies improved CV
- `donation_clicked` (provider) — User clicks donation link
- `reset_clicked` — User starts over

## Environment Variables (Vercel dashboard)

- `ANTHROPIC_API_KEY` — Required. Claude API key
- `NEXT_PUBLIC_STRIPE_DONATION_LINK` — Optional. Stripe payment link
- `NEXT_PUBLIC_PAYPAL_DONATION_LINK` — Optional. PayPal donation link

## Code Conventions

- UI language: Spanish and English (bilingual)
- Code, comments, commits: always in English
- Fonts: Geist Sans + Geist Mono only
- CSS animations over JS
- Keep API prompts optimized for minimal tokens
- Named exports for components, default exports for pages
- All pages use `"use client"` with local `useState` for lang toggle
- Each subpage has its own `layout.tsx` with page-level metadata
