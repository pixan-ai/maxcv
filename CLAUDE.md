# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and Claude Desktop when working with code in this repository.

## Project Overview

MaxCV (maxcv.org) is a free AI-powered resume/CV analyzer and improver. Users upload a PDF or paste CV text, then choose between two flows: **Score** (analysis with 6 dimensions + recommendations) or **Improve** (full rewrite optimized for ATS). Both flows live on a single page. Monetization is through voluntary donations (Stripe + PayPal). Free forever — no sign-up, no accounts, no data stored.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + Tailwind CSS 4
- Claude Opus 4.6 API (`claude-opus-4-6`) via Anthropic SDK for CV improvement
- Claude Sonnet 4 API (`claude-sonnet-4-20250514`) via Anthropic SDK for CV scoring
- Vercel Analytics for traffic tracking
- Deployed on Vercel

## Environments

- **Production:** maxcv.org — auto-deploys from master
- **Staging:** dev.maxcv.org — test changes here first
- GitHub repo: github.com/pixan-ai/maxcv

## Commands

- `npm run dev` — Start development server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `vercel deploy --prod` — Deploy to production via CLI

## Architecture

- **Single-page app** with two flows on `/`:
  - **Flow A (Score):** CV input → "Analyze my resume" → progress bar → score + dimensions + recommendations → CTA to improve
  - **Flow B (Improve):** CV input → "Rewrite it for me" → progress bar → improved CV + tips → CTA to score
- `/src/app/page.tsx` — Main unified page with both flows
- `/src/app/score/page.tsx` — Redirects to `/`
- `/src/app/layout.tsx` — Root layout with Geist fonts, meta tags, favicon, Vercel Analytics
- `/src/app/globals.css` — Tailwind theme config (ink-* palette, accent, OKLCH)
- `/src/app/security/page.tsx` — Security & privacy page
- `/src/app/api/improve/route.ts` — API route: Claude Opus 4.6 rewrites the CV
- `/src/app/api/score/route.ts` — API route: Claude Sonnet 4 scores the CV (6 dimensions)
- `/src/app/api/parse/route.ts` — API route: PDF/Sheets parsing
- `/src/lib/rateLimit.ts` — Shared rate limiting + IP extraction (used by score + improve)
- `/src/lib/apiUtils.ts` — Shared API utilities (stripMarkdown)
- `/src/lib/prompts.ts` — Prompt loader (reads .txt files at build time)
- `/src/lib/prompts/score.txt` — Claude system prompt for scoring
- `/src/lib/prompts/improve.txt` — Claude system prompt for improvement
- `/src/components/Header.tsx` — Logo + language toggle + version badge
- `/src/components/Footer.tsx` — Branding + nav links
- `/src/components/CVInput.tsx` — Shared input: paste text, upload PDF, or Google Sheets
- `/src/components/ProgressBar.tsx` — Staged progress bar with bilingual labels
- `/src/components/DonationBanner.tsx` — Post-result donation CTA
- `/src/components/AboutUs.tsx` — Who we are section

## Design System

- **Fonts:** Geist Sans + Geist Mono (via `next/font/google`)
- **Palette:** ink-* (000–900) + accent (steel blue OKLCH) + positive/warning
- **Radii:** `rounded-xl`
- **Container:** `max-w-2xl mx-auto px-5`
- **Logo:** `max` ink-900 + `cv` accent, font-mono, lowercase
- **Philosophy:** Typographic pure — Tailwind + CSS animations. No shadcn, no component libraries.

## Bilingual Support

- UI defaults to Spanish (es)
- Claude API detects CV language and responds in the same language
- When language is detected, UI auto-switches
- Manual toggle in header (EN/ES)
- All UI strings in `const UI = { en: {...}, es: {...} }` objects

## Rate Limiting & Security

- 5 requests per IP per hour (both score and improve APIs)
- Rate limiting logic shared via `src/lib/rateLimit.ts`
- Input capped at 8000 characters (improve) / 15000 characters (score)
- Target role input capped at 200 characters
- HTTP security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (configured in `next.config.ts`)
- No user accounts, no cookies, no tracking beyond Vercel Analytics

## Word-Compatible Output

- Improve API outputs ALL CAPS section headers, • bullet points, blank line separators
- "Download for Word" button generates UTF-8 BOM .txt file
- Copy button copies plain text to clipboard

## Environment Variables (set in Vercel dashboard)

- `ANTHROPIC_API_KEY` — Required. Claude API key
- `NEXT_PUBLIC_STRIPE_DONATION_LINK` — Stripe payment link
- `NEXT_PUBLIC_PAYPAL_DONATION_LINK` — PayPal donation link

## Code Conventions

- UI language: Spanish and English (bilingual)
- Code, comments, commits: always in English
- Fonts: Geist Sans + Geist Mono only
- CSS animations over JS — no Framer Motion for new animations
- Keep API prompts optimized for minimal tokens
